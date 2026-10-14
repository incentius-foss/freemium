// Certificate validation that runs entirely in the browser (WebCrypto + @peculiar/x509).
// Checks: chain signatures, chain completeness and order, trust against Mozilla's root
// store, validity dates, CA constraints, hostname (RFC 6125), private-key match, TLS server
// usage, weak algorithms and lifetime. Revocation (OCSP/CRL) needs network calls to the CA,
// so it is reported as not checked.
import {
  X509Certificate, BasicConstraintsExtension, ExtendedKeyUsageExtension,
  KeyUsagesExtension, SubjectAlternativeNameExtension,
} from '@peculiar/x509'

const SERVER_AUTH = '1.3.6.1.5.5.7.3.1'
const ANY_EKU = '2.5.29.37.0'
const KEY_CERT_SIGN = 1 << 5 // bit 5 in @peculiar/x509's KeyUsageFlags

// ── Root store ─────────────────────────────────────────────────────

export function parseRootStore (pem) {
  const blocks = pem.match(/-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/g) || []
  const roots = []
  for (const b of blocks) {
    try { roots.push(new X509Certificate(b)) } catch { /* skip malformed entries */ }
  }
  const asOf = /as of: ([^\n]+)/.exec(pem)?.[1]?.trim() || null
  return { roots, asOf }
}

// ── Minimal DER reader (just enough for SPKI, PKCS#1, PKCS#8 and SEC1) ─

function tlv (b, pos) {
  const tag = b[pos]
  let len = b[pos + 1]
  let off = pos + 2
  if (len & 0x80) {
    const n = len & 0x7f
    len = 0
    for (let i = 0; i < n; i++) len = len * 256 + b[off++]
  }
  if (off + len > b.length) throw new Error('Truncated DER')
  return { tag, start: off, end: off + len }
}

function kids (b, node) {
  const out = []
  let p = node.start
  while (p < node.end) {
    const c = tlv(b, p)
    out.push(c)
    p = c.end
  }
  return out
}

const hex = (b) => Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('')
const slice = (b, n) => b.subarray(n.start, n.end)
const intHex = (b, n) => hex(slice(b, n)).replace(/^(00)+/, '')
const b64urlToBytes = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), (c) => c.charCodeAt(0))

const OID = {
  rsa: '2a864886f70d010101',
  rsaPss: '2a864886f70d01010a',
  ec: '2a8648ce3d0201',
  ed25519: '2b6570',
  ed448: '2b6571',
  p256: '2a8648ce3d030107',
  p384: '2b81040022',
  p521: '2b81040023',
}
const CURVES = { [OID.p256]: 'P-256', [OID.p384]: 'P-384', [OID.p521]: 'P-521' }

// Canonical public-key identity: "rsa:<modulus>", "ec:<point>" or "okp:<raw>".
function spkiIdentity (spki) {
  const b = new Uint8Array(spki)
  const [algId, bits] = kids(b, tlv(b, 0))
  const oid = hex(slice(b, kids(b, algId)[0]))
  const key = b.subarray(bits.start + 1, bits.end) // skip "unused bits" byte
  if (oid === OID.rsa || oid === OID.rsaPss) {
    const [n] = kids(key, tlv(key, 0))
    return `rsa:${intHex(key, n)}`
  }
  if (oid === OID.ec) return `ec:${hex(key)}`
  if (oid === OID.ed25519 || oid === OID.ed448) return `okp:${hex(key)}`
  throw new Error('Unsupported public key type')
}

function pemBody (pem, label) {
  const m = new RegExp(`-----BEGIN ${label}-----([\\s\\S]+?)-----END ${label}-----`).exec(pem)
  if (!m) return null
  if (/Proc-Type:\s*4,ENCRYPTED/.test(m[1])) return 'encrypted'
  const b64 = m[1].replace(/^[\w-]+:.*$/gm, '').replace(/\s+/g, '')
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
}

function rsaPkcs1Identity (b) {
  const [, n] = kids(b, tlv(b, 0)) // version, modulus, ...
  return `rsa:${intHex(b, n)}`
}

// SEC1 ECPrivateKey: SEQUENCE { version, privateKey, [0] params?, [1] publicKey? }
function sec1Identity (b) {
  const fields = kids(b, tlv(b, 0))
  const pub = fields.find((f) => f.tag === 0xa1)
  if (!pub) return null
  const bits = tlv(b, pub.start)
  return `ec:${hex(b.subarray(bits.start + 1, bits.end))}`
}

async function webCryptoIdentity (pkcs8, algorithm) {
  const key = await crypto.subtle.importKey('pkcs8', pkcs8, algorithm, true, algorithm.name === 'Ed25519' ? ['sign'] : ['sign'])
  const jwk = await crypto.subtle.exportKey('jwk', key)
  if (jwk.kty === 'EC') return `ec:04${hex(b64urlToBytes(jwk.x))}${hex(b64urlToBytes(jwk.y))}`
  if (jwk.kty === 'OKP') return `okp:${hex(b64urlToBytes(jwk.x))}`
  return `rsa:${hex(b64urlToBytes(jwk.n)).replace(/^(00)+/, '')}`
}

// Returns the public-key identity of a PEM private key. The key never leaves this function.
export async function privateKeyIdentity (pem) {
  if (/-----BEGIN ENCRYPTED PRIVATE KEY-----/.test(pem)) {
    throw new Error('This private key is encrypted. Decrypt it first: openssl pkey -in key.pem -out plain.pem')
  }
  let der = pemBody(pem, 'RSA PRIVATE KEY')
  if (der === 'encrypted') throw new Error('This RSA key is password-protected. Decrypt it first: openssl rsa -in key.pem -out plain.pem')
  if (der) return { type: 'RSA (PKCS#1)', id: rsaPkcs1Identity(der) }

  der = pemBody(pem, 'EC PRIVATE KEY')
  if (der === 'encrypted') throw new Error('This EC key is password-protected. Decrypt it first: openssl ec -in key.pem -out plain.pem')
  if (der) {
    const id = sec1Identity(der)
    if (!id) throw new Error('This EC key doesn’t include its public key. Re-export it with: openssl pkey -in key.pem -out plain.pem')
    return { type: 'EC (SEC1)', id }
  }

  der = pemBody(pem, 'PRIVATE KEY')
  if (!der) throw new Error('No private key found. Paste a PEM block starting with -----BEGIN PRIVATE KEY-----.')
  // PKCS#8: SEQUENCE { version, AlgorithmIdentifier, OCTET STRING privateKey, [0] attrs?, [1] publicKey? }
  const [, algId, priv, ...rest] = kids(der, tlv(der, 0))
  const [oidNode, params] = kids(der, algId)
  const oid = hex(slice(der, oidNode))
  const inner = slice(der, priv)
  if (oid === OID.rsa || oid === OID.rsaPss) return { type: 'RSA (PKCS#8)', id: rsaPkcs1Identity(inner) }
  if (oid === OID.ec) {
    const id = sec1Identity(inner)
    if (id) return { type: 'EC (PKCS#8)', id }
    const curve = params && CURVES[hex(slice(der, params))]
    if (!curve) throw new Error('Unsupported elliptic curve')
    return { type: `EC ${curve} (PKCS#8)`, id: await webCryptoIdentity(der, { name: 'ECDSA', namedCurve: curve }) }
  }
  if (oid === OID.ed25519 || oid === OID.ed448) {
    const pub = rest.find((f) => f.tag === 0x81)
    if (pub) return { type: 'EdDSA (PKCS#8)', id: `okp:${hex(der.subarray(pub.start + 1, pub.end))}` }
    try {
      return { type: 'Ed25519 (PKCS#8)', id: await webCryptoIdentity(der, { name: oid === OID.ed25519 ? 'Ed25519' : 'Ed448' }) }
    } catch {
      throw new Error('This browser can’t derive the public key for this EdDSA key. Try a current version of Chrome, Safari or Firefox.')
    }
  }
  throw new Error('Unsupported private key type')
}

// ── Hostname (RFC 6125) ───────────────────────────────────────────

function normalizeHost (input) {
  const raw = input.trim()
  if (!raw) return ''
  try {
    const u = new URL(/^[a-z][\w+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`)
    return u.hostname.replace(/^\[|\]$/g, '').replace(/\.$/, '').toLowerCase()
  } catch {
    return raw.toLowerCase()
  }
}

function wildcardMatch (pattern, host) {
  const p = pattern.toLowerCase().replace(/\.$/, '')
  if (!p.includes('*')) return p === host
  // Only a whole left-most label may be a wildcard, and it covers exactly one label.
  if (!p.startsWith('*.') || p.indexOf('*', 1) !== -1) return false
  const suffix = p.slice(1) // ".example.com"
  if (!host.endsWith(suffix)) return false
  const label = host.slice(0, -suffix.length)
  return label.length > 0 && !label.includes('.')
}

export function matchHostname (cert, input) {
  const host = normalizeHost(input)
  const san = cert.getExtension(SubjectAlternativeNameExtension)
  const items = san ? san.names.items : []
  const dns = items.filter((n) => n.type === 'dns').map((n) => n.value)
  const ips = items.filter((n) => n.type === 'ip').map((n) => n.value.toLowerCase())
  const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(':')
  if (isIp) {
    const ok = ips.includes(host)
    return { host, ok, matched: ok ? host : null, names: ips, usedCN: false }
  }
  let names = dns
  let usedCN = false
  if (!dns.length && !ips.length) {
    const cn = cert.subjectName.getField('CN')
    names = cn
    usedCN = cn.length > 0
  }
  const matched = names.find((n) => wildcardMatch(n, host)) || null
  return { host, ok: !!matched, matched, names, usedCN }
}

// ── Chain ─────────────────────────────────────────────────────────

async function signedBy (child, issuer) {
  if (child.issuer !== issuer.subject) return false
  try { return await child.verify({ publicKey: issuer.publicKey, signatureOnly: true }) } catch { return false }
}

const isSelfIssued = (c) => c.subject === c.issuer

async function thumb (c) {
  return hex(new Uint8Array(await c.getThumbprint('SHA-256')))
}

export async function buildChain (certs, rootStore = []) {
  const thumbs = await Promise.all(certs.map(thumb))
  // The leaf is the certificate that didn't issue any of the others.
  let leafIndex = 0
  for (let i = 0; i < certs.length; i++) {
    const issuesAnother = certs.some((other, j) => j !== i && other.issuer === certs[i].subject && !isSelfIssued(other))
    if (!issuesAnother) { leafIndex = i; break }
  }
  const chain = [{ cert: certs[leafIndex], index: leafIndex, fromStore: false, signatureOk: null }]
  const used = new Set([leafIndex])
  const links = []
  let end = 'incomplete'
  let missingIssuer = null

  for (let guard = 0; guard < 10; guard++) {
    const cur = chain[chain.length - 1].cert
    if (isSelfIssued(cur)) {
      const ok = await signedBy(cur, cur)
      links.push({ from: cur, to: cur, ok, self: true })
      end = 'self-signed'
      break
    }
    let next = null
    for (let i = 0; i < certs.length && !next; i++) {
      if (!used.has(i) && certs[i].subject === cur.issuer) next = { cert: certs[i], index: i }
    }
    if (next) {
      const ok = await signedBy(cur, next.cert)
      links.push({ from: cur, to: next.cert, ok })
      used.add(next.index)
      chain.push({ cert: next.cert, index: next.index, fromStore: false })
      continue
    }
    const candidates = rootStore.filter((r) => r.subject === cur.issuer)
    let root = null
    for (const r of candidates) {
      if (await signedBy(cur, r)) { root = r; break }
    }
    if (root) {
      links.push({ from: cur, to: root, ok: true })
      chain.push({ cert: root, index: -1, fromStore: true })
      end = 'store'
    } else {
      missingIssuer = cur.issuer
      if (candidates.length) links.push({ from: cur, to: candidates[0], ok: false })
    }
    break
  }

  const top = chain[chain.length - 1].cert
  const storeThumbs = new Set(await Promise.all(rootStore.map(thumb)))
  const topTrusted = end === 'store' || storeThumbs.has(await thumb(top))
  const unused = certs.map((c, i) => ({ c, i })).filter(({ i }) => !used.has(i)).map(({ c }) => c)
  const providedOrder = chain.filter((l) => !l.fromStore).map((l) => l.index)
  const inOrder = providedOrder.every((idx, k) => idx === k)

  return { chain, links, end, missingIssuer, topTrusted, unused, inOrder, thumbs }
}

// ── Full report ───────────────────────────────────────────────────

const cn = (c) => c.subjectName.getField('CN')[0] || c.subject
const DAY = 86400000

export async function validate (certs, { rootStore = [], storeDate = null, hostname = '', privateKeyPem = '', now = new Date() } = {}) {
  const checks = []
  const add = (id, status, title, detail) => checks.push({ id, status, title, detail })
  const r = await buildChain(certs, rootStore)
  const leaf = r.chain[0].cert
  const chainCerts = r.chain.map((l) => l.cert)

  // Dates
  const expired = chainCerts.filter((c) => now > c.notAfter)
  const early = chainCerts.filter((c) => now < c.notBefore)
  if (expired.length) add('dates', 'fail', 'Expired certificate in chain', expired.map((c) => `${cn(c)} expired ${c.notAfter.toISOString().slice(0, 10)}`).join(' · '))
  else if (early.length) add('dates', 'fail', 'Certificate not yet valid', early.map((c) => `${cn(c)} starts ${c.notBefore.toISOString().slice(0, 10)}`).join(' · '))
  else {
    const days = Math.floor((leaf.notAfter - now) / DAY)
    add('dates', days < 30 ? 'warn' : 'pass', days < 30 ? `Expires soon: ${days} days left` : 'All certificates are within their validity period', `${cn(leaf)} is valid until ${leaf.notAfter.toISOString().slice(0, 10)} (${days} days).`)
  }

  // Signatures
  const bad = r.links.filter((l) => !l.ok)
  if (bad.length) add('signatures', 'fail', 'Signature doesn’t verify', bad.map((l) => `${cn(l.from)} isn’t validly signed by ${cn(l.to)}. The certificate may be altered, or the wrong issuer was supplied.`).join(' '))
  else if (r.links.length) add('signatures', 'pass', 'Every signature in the chain verifies', `${r.links.length} ${r.links.length === 1 ? 'signature' : 'signatures'} checked with the issuer’s public key.`)

  // Completeness and trust
  if (r.end === 'incomplete') {
    add('chain', 'fail', 'Chain is incomplete', `Missing the issuer “${r.missingIssuer}”. Ask the client for the intermediate certificate (often called the CA bundle or chain file).`)
  } else {
    add('chain', 'pass', 'Chain is complete', r.chain.map((l) => `${cn(l.cert)}${l.fromStore ? ' (from root store)' : ''}`).join(' → '))
  }
  const asOf = storeDate ? ` (Mozilla root store, ${storeDate.replace(/^\w+ /, '').replace(/ \d\d:\d\d:\d\d.*$/, '')})` : ''
  if (r.topTrusted) add('trust', 'pass', 'Chains to a publicly trusted root', `${cn(chainCerts[chainCerts.length - 1])} is in the Mozilla root store${asOf}.`)
  else if (r.end === 'self-signed') add('trust', 'warn', 'Root isn’t publicly trusted', `${cn(chainCerts[chainCerts.length - 1])} is self-signed and not in the Mozilla root store. It’s fine for a private CA, but only clients that have this root installed will trust it.`)
  else add('trust', 'fail', 'Trust couldn’t be established', 'The chain doesn’t reach a root certificate, so it can’t be trusted.')

  // Order and extras
  if (certs.length > 1 && !r.inOrder) add('order', 'warn', 'Certificates are out of order', 'Servers should send the leaf certificate first, then each intermediate. Most clients cope, some don’t.')
  if (r.unused.length) add('unused', 'warn', `${r.unused.length} unrelated ${r.unused.length === 1 ? 'certificate' : 'certificates'} in the file`, r.unused.map(cn).join(' · '))

  // CA constraints
  const caProblems = []
  r.chain.slice(1).forEach((l, k) => {
    const bc = l.cert.getExtension(BasicConstraintsExtension)
    if (!bc?.ca) caProblems.push(`${cn(l.cert)} isn’t marked as a CA`)
    const ku = l.cert.getExtension(KeyUsagesExtension)
    if (ku && !(ku.usages & KEY_CERT_SIGN)) caProblems.push(`${cn(l.cert)} isn’t allowed to sign certificates`)
    if (bc?.pathLength != null && bc.pathLength < k) caProblems.push(`${cn(l.cert)} allows ${bc.pathLength} intermediate(s) below it, but the chain has ${k}`)
  })
  if (r.chain.length > 1) {
    if (caProblems.length) add('ca', 'fail', 'Issuer constraints violated', caProblems.join(' · '))
    else add('ca', 'pass', 'Issuers are permitted to issue certificates', 'Basic constraints, key usage and path length are consistent.')
  }

  // Hostname
  if (hostname.trim()) {
    const h = matchHostname(leaf, hostname)
    if (h.ok) add('hostname', h.usedCN ? 'warn' : 'pass', `Matches ${h.host}`, h.usedCN ? `Matched the Common Name “${h.matched}”. Modern browsers ignore the Common Name and require a Subject Alternative Name.` : `Covered by “${h.matched}”.`)
    else add('hostname', 'fail', `Doesn’t match ${h.host}`, h.names.length ? `Certificate covers: ${h.names.join(', ')}` : 'The certificate lists no host names.')
  } else {
    add('hostname', 'skip', 'Hostname not checked', 'Enter the host name the certificate should cover.')
  }

  // Private key
  if (privateKeyPem.trim()) {
    try {
      const k = await privateKeyIdentity(privateKeyPem)
      const certId = spkiIdentity(leaf.publicKey.rawData)
      if (k.id === certId) add('key', 'pass', 'Private key matches the certificate', `${k.type} key pairs with ${cn(leaf)}.`)
      else {
        const other = chainCerts.slice(1).find((c) => { try { return spkiIdentity(c.publicKey.rawData) === k.id } catch { return false } })
        add('key', 'fail', 'Private key doesn’t match the certificate', other ? `This key belongs to ${cn(other)}, not the leaf certificate.` : 'This key belongs to a different certificate. Ask the client for the key that was used to create the CSR.')
      }
    } catch (e) {
      add('key', 'fail', 'Couldn’t read the private key', e.message)
    }
  } else {
    add('key', 'skip', 'Private key not checked', 'Optionally paste the private key to confirm it pairs with this certificate. It stays in this browser tab.')
  }

  // TLS server usage
  const eku = leaf.getExtension(ExtendedKeyUsageExtension)
  if (eku && !eku.usages.includes(SERVER_AUTH) && !eku.usages.includes(ANY_EKU)) {
    add('usage', 'warn', 'Not valid for TLS servers', 'The certificate’s Extended Key Usage doesn’t include server authentication, so browsers will reject it for HTTPS.')
  } else {
    add('usage', 'pass', 'Allowed for TLS server authentication', eku ? 'Extended Key Usage includes server authentication.' : 'No Extended Key Usage restriction.')
  }

  // Algorithms and key strength
  const weak = []
  chainCerts.forEach((c, i) => {
    const sig = c.signatureAlgorithm
    if (sig.hash?.name === 'SHA-1' && !(i === chainCerts.length - 1 && isSelfIssued(c))) weak.push(`${cn(c)} is signed with SHA-1`)
    if (c.publicKey.algorithm.modulusLength && c.publicKey.algorithm.modulusLength < 2048) weak.push(`${cn(c)} uses a ${c.publicKey.algorithm.modulusLength}-bit RSA key`)
  })
  if (weak.length) add('crypto', 'fail', 'Weak cryptography', weak.join(' · '))
  else add('crypto', 'pass', 'Strong signature and key algorithms', 'No SHA-1 signatures or RSA keys under 2048 bits.')

  // Lifetime for publicly trusted certificates
  const lifetime = Math.round((leaf.notAfter - leaf.notBefore) / DAY)
  if (r.topTrusted && lifetime > 398) add('lifetime', 'warn', `Lifetime is ${lifetime} days`, 'Browsers reject publicly trusted TLS certificates valid for more than 398 days.')

  add('revocation', 'skip', 'Revocation not checked', 'Checking OCSP or CRLs means contacting the certificate authority, which this offline tool doesn’t do. Run: openssl ocsp -issuer chain.pem -cert cert.pem -url <OCSP URL>')

  const verdict = checks.some((c) => c.status === 'fail') ? 'fail' : checks.some((c) => c.status === 'warn') ? 'warn' : 'pass'
  return { verdict, checks, chain: r.chain, leaf }
}
