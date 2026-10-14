<template>
  <ToolPage fill>
    <div class="split">
      <div class="inputs">
        <CodePane
          v-model="input"
          class="inputs__cert"
          label="Certificate (PEM)"
          placeholder="-----BEGIN CERTIFICATE-----&#10;…&#10;-----END CERTIFICATE-----&#10;&#10;Paste the certificate and its chain, or drop a .pem / .crt / .der file."
          accept="*/*"
          :error="error"
          @file="onFile"
        />

        <section class="card verify" aria-labelledby="verify-title">
          <h2 id="verify-title" class="verify__title">Validate against</h2>
          <label class="verify__field">
            <span class="label">Hostname</span>
            <input
              v-model="hostname"
              class="field t-mono"
              type="text"
              inputmode="url"
              placeholder="api.example.com"
              autocapitalize="off"
              autocomplete="off"
              spellcheck="false"
            />
          </label>
          <CodePane
            v-model="privateKey"
            class="verify__key"
            label="Private key (optional)"
            placeholder="-----BEGIN PRIVATE KEY-----&#10;…&#10;&#10;Checked in this tab only. Never stored or uploaded."
            accept=".key,.pem,text/plain"
          />
        </section>
      </div>

      <section class="card result" aria-labelledby="cert-title">
        <header class="result__bar">
          <h2 id="cert-title" class="result__label">Details</h2>
          <span v-if="certs.length > 1" class="t-caption t-secondary">{{ certs.length }} certificates</span>
        </header>
        <div class="result__scroll">
          <section v-if="report" class="report" aria-labelledby="report-title" aria-live="polite">
            <div class="report__head" :class="`report__head--${report.verdict}`">
              <AppIcon :name="VERDICT[report.verdict].icon" :size="26" :weight="2" />
              <div>
                <h3 id="report-title" class="t-headline">{{ VERDICT[report.verdict].title }}</h3>
                <p class="t-footnote t-secondary">{{ summary }}</p>
              </div>
            </div>
            <ul class="checks" role="list">
              <li v-for="c in report.checks" :key="c.id" class="check" :class="`check--${c.status}`">
                <span class="check__icon"><AppIcon :name="STATUS[c.status].icon" :size="18" :weight="2.2" /></span>
                <span class="check__text">
                  <span class="check__title"><span class="sr-only">{{ STATUS[c.status].label }}: </span>{{ c.title }}</span>
                  <span class="check__detail">{{ c.detail }}</span>
                </span>
              </li>
            </ul>
          </section>
          <p v-else-if="validating" class="report__loading t-footnote t-secondary">Validating…</p>

          <div v-if="!certs.length" class="empty">
            <AppIcon name="certificate" :size="44" :weight="1.4" />
            <p class="t-footnote t-secondary">Decoded fields appear here. Everything is parsed locally; nothing is uploaded.</p>
          </div>

          <article v-for="(c, i) in certs" :key="c.sha256 + i" class="cert" :aria-labelledby="`cert-${i}`">
            <div class="cert__head">
              <h3 :id="`cert-${i}`" class="t-headline">{{ c.title }}</h3>
              <p class="t-footnote t-secondary">
                <template v-if="certs.length > 1">Certificate {{ i + 1 }} of {{ certs.length }} · </template>{{ c.role }}
              </p>
              <span class="badge" :class="c.status.cls">
                <AppIcon :name="c.status.icon" :size="12" />{{ c.status.label }}
              </span>
            </div>

            <template v-for="section in c.sections" :key="section.title">
              <h4 class="cert__section t-footnote">{{ section.title }}</h4>
              <ul class="inset-list" role="list">
                <li v-for="(row, k) in section.rows" :key="k" class="row">
                  <span class="row__label t-subhead">{{ row[0] }}</span>
                  <span class="row__value">{{ row[1] }}</span>
                  <button
                    v-if="row[2]"
                    class="icon-btn icon-btn--sm"
                    type="button"
                    :aria-label="`Copy ${row[0]}`"
                    title="Copy"
                    @click="copyText(row[1], `${row[0]} copied`)"
                  >
                    <AppIcon name="copy" :size="16" />
                  </button>
                </li>
              </ul>
            </template>
          </article>
        </div>
      </section>
    </div>
  </ToolPage>
</template>

<script setup>
import { computed, markRaw, onMounted, ref, shallowRef, watch } from 'vue'
import {
  X509Certificate, X509Certificates, SubjectAlternativeNameExtension, KeyUsagesExtension,
  ExtendedKeyUsageExtension, BasicConstraintsExtension,
} from '@peculiar/x509'
import ToolPage from '@/components/ToolPage.vue'
import CodePane from '@/components/CodePane.vue'
import AppIcon from '@/components/AppIcon.vue'
import { copyText } from '@/composables/clipboard'
import { takeHandoff } from '@/composables/useHandoff'
import { validate, parseRootStore } from '@/tools/certValidate'

const input = ref('')
const certs = ref([])
// X509Certificate uses private #fields, which break behind Vue's reactive proxies; keep them raw.
const parsed = shallowRef([])
const error = ref('')
const hostname = ref('')
const privateKey = ref('') // deliberately never persisted
const report = shallowRef(null)
const validating = ref(false)

const VERDICT = {
  pass: { icon: 'checkCircle', title: 'Certificate is valid' },
  warn: { icon: 'warning', title: 'Valid, with warnings' },
  fail: { icon: 'xmark', title: 'Certificate is not valid' },
}
const STATUS = {
  pass: { icon: 'checkCircle', label: 'Passed' },
  warn: { icon: 'warning', label: 'Warning' },
  fail: { icon: 'xmark', label: 'Failed' },
  skip: { icon: 'minus', label: 'Not checked' },
}
const summary = computed(() => {
  if (!report.value) return ''
  const n = (s) => report.value.checks.filter((c) => c.status === s).length
  return [`${n('pass')} passed`, n('warn') && `${n('warn')} ${n('warn') === 1 ? 'warning' : 'warnings'}`, n('fail') && `${n('fail')} failed`, n('skip') && `${n('skip')} not checked`].filter(Boolean).join(' · ')
})

// Mozilla's root store (~190 KB) loads only when there's something to validate.
let rootStorePromise = null
const loadRootStore = () => (rootStorePromise ||= import('@/tools/data/cacert.pem?raw').then((m) => parseRootStore(m.default)))

let validateId = 0
let validateTimer = null
watch([parsed, hostname, privateKey], () => {
  clearTimeout(validateTimer)
  validateTimer = setTimeout(runValidation, 150)
})
async function runValidation () {
  const id = ++validateId
  if (!parsed.value.length) { report.value = null; validating.value = false; return }
  validating.value = true
  try {
    const { roots, asOf } = await loadRootStore()
    const result = await validate(parsed.value, { rootStore: roots, storeDate: asOf, hostname: hostname.value, privateKeyPem: privateKey.value })
    if (id === validateId) report.value = markRaw(result)
  } catch (e) {
    if (id === validateId) report.value = { verdict: 'fail', checks: [{ id: 'error', status: 'fail', title: 'Validation failed', detail: e.message }] }
  } finally {
    if (id === validateId) validating.value = false
  }
}

const KEY_USAGE = ['Digital Signature', 'Non-Repudiation', 'Key Encipherment', 'Data Encipherment', 'Key Agreement', 'Certificate Sign', 'CRL Sign', 'Encipher Only', 'Decipher Only']
const EKU = {
  '1.3.6.1.5.5.7.3.1': 'TLS Web Server Authentication',
  '1.3.6.1.5.5.7.3.2': 'TLS Web Client Authentication',
  '1.3.6.1.5.5.7.3.3': 'Code Signing',
  '1.3.6.1.5.5.7.3.4': 'Email Protection',
  '1.3.6.1.5.5.7.3.8': 'Time Stamping',
  '1.3.6.1.5.5.7.3.9': 'OCSP Signing',
  '1.3.6.1.4.1.311.10.3.3': 'Microsoft Server Gated Crypto',
  '2.16.840.1.113730.4.1': 'Netscape Server Gated Crypto',
}
const NAME_LABELS = { CN: 'Common Name', O: 'Organization', OU: 'Organizational Unit', C: 'Country', ST: 'State / Province', L: 'Locality', E: 'Email', SERIALNUMBER: 'Serial Number', DC: 'Domain Component', street: 'Street' }
const SAN_LABELS = { dns: 'DNS', ip: 'IP', email: 'Email', url: 'URI', upn: 'UPN', guid: 'GUID', dn: 'Directory', id: 'Registered ID' }

const toHex = (buf, sep = ':') => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0').toUpperCase()).join(sep)

function nameRows (name) {
  const rows = []
  for (const part of name.toJSON()) {
    for (const [k, values] of Object.entries(part)) {
      for (const v of values) rows.push([NAME_LABELS[k] || k, v])
    }
  }
  return rows
}

function keyInfo (alg) {
  if (alg.modulusLength) return [`${alg.name.startsWith('RSA') ? 'RSA' : alg.name}`, `${alg.modulusLength} bits`]
  if (alg.namedCurve) return ['Elliptic Curve (ECDSA)', alg.namedCurve]
  return [alg.name, '—']
}

function sigName (alg) {
  const hash = alg.hash?.name
  const base = alg.name === 'RSASSA-PKCS1-v1_5' ? 'RSA' : alg.name
  return hash ? `${hash.replace('-', '')} with ${base}` : base
}

function status (cert) {
  const now = Date.now()
  const day = 86400000
  if (now < cert.notBefore.getTime()) return { label: `Not yet valid · starts in ${Math.ceil((cert.notBefore - now) / day)} days`, icon: 'clock', cls: 'badge--err' }
  if (now > cert.notAfter.getTime()) return { label: `Expired ${Math.floor((now - cert.notAfter) / day)} days ago`, icon: 'xmark', cls: 'badge--err' }
  const left = Math.floor((cert.notAfter - now) / day)
  const when = left < 1 ? 'expires in under a day' : `${left} ${left === 1 ? 'day' : 'days'} left`
  return { label: `Valid · ${when}`, icon: left < 30 ? 'warning' : 'checkCircle', cls: left < 30 ? '' : 'badge--ok' }
}

const fmtDate = (d) => `${d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })} (${d.toISOString().replace('.000', '')})`

async function describe (cert) {
  const [sha1, sha256] = await Promise.all([cert.getThumbprint('SHA-1'), cert.getThumbprint('SHA-256')])
  const subject = nameRows(cert.subjectName)
  const cn = subject.find((r) => r[0] === 'Common Name')?.[1]
  const selfSigned = cert.subject === cert.issuer
  const bc = cert.getExtension(BasicConstraintsExtension)
  const [keyAlg, keySize] = keyInfo(cert.publicKey.algorithm)

  const sections = [
    { title: 'Subject', rows: subject.length ? subject : [['Subject', '(empty)']] },
    { title: 'Issuer', rows: nameRows(cert.issuerName) },
    { title: 'Validity', rows: [['Not before', fmtDate(cert.notBefore)], ['Not after', fmtDate(cert.notAfter)]] },
  ]

  const san = cert.getExtension(SubjectAlternativeNameExtension)
  if (san) sections.push({ title: 'Subject Alternative Names', rows: san.names.items.map((n) => [SAN_LABELS[n.type] || n.type, n.value]) })

  const details = [
    ['Serial number', toHex(hexToBytes(cert.serialNumber)), true],
    ['Signature', sigName(cert.signatureAlgorithm)],
    ['Public key', keyAlg],
    [cert.publicKey.algorithm.namedCurve ? 'Curve' : 'Key size', keySize],
  ]
  const ku = cert.getExtension(KeyUsagesExtension)
  if (ku) details.push(['Key usage', KEY_USAGE.filter((_, b) => ku.usages & (1 << b)).join(', ') || '—'])
  const eku = cert.getExtension(ExtendedKeyUsageExtension)
  if (eku) details.push(['Extended key usage', eku.usages.map((u) => EKU[u] || u).join(', ')])
  if (bc) details.push(['Basic constraints', `${bc.ca ? 'CA' : 'End entity'}${bc.pathLength != null ? ` · path length ${bc.pathLength}` : ''}${bc.critical ? ' · critical' : ''}`])
  sections.push({ title: 'Details', rows: details })

  sections.push({ title: 'Fingerprints', rows: [['SHA-256', toHex(sha256), true], ['SHA-1', toHex(sha1), true]] })

  return {
    title: cn || cert.subject || 'Certificate',
    role: bc?.ca ? (selfSigned ? 'Root certificate authority' : 'Intermediate certificate authority') : (selfSigned ? 'Self-signed certificate' : 'End-entity certificate'),
    status: status(cert),
    sha256: toHex(sha256, ''),
    sections,
  }
}

function hexToBytes (hex) {
  const h = hex.length % 2 ? `0${hex}` : hex
  return Uint8Array.from(h.match(/../g) || [], (b) => parseInt(b, 16))
}

function parse (text) {
  const blocks = text.match(/-----BEGIN (?:X509 |TRUSTED )?CERTIFICATE-----[\s\S]+?-----END (?:X509 |TRUSTED )?CERTIFICATE-----/g)
  if (blocks) return blocks.map((b) => new X509Certificate(b.replace(/(X509|TRUSTED) CERTIFICATE/g, 'CERTIFICATE')))
  const p7 = text.match(/-----BEGIN PKCS7-----[\s\S]+?-----END PKCS7-----/)
  if (p7) return [...new X509Certificates(p7[0])]
  const b64 = text.replace(/\s+/g, '')
  if (/^[A-Za-z0-9+/=_-]+$/.test(b64) && b64.length > 100) return [new X509Certificate(b64)]
  throw new Error('No certificate found. Paste a PEM block starting with -----BEGIN CERTIFICATE-----.')
}

let runId = 0
watch(input, async (text) => {
  const id = ++runId
  if (!text.trim()) { certs.value = []; parsed.value = []; error.value = ''; return }
  try {
    const raw = parse(text)
    const list = await Promise.all(raw.map(describe))
    if (id !== runId) return
    certs.value = list
    parsed.value = markRaw(raw.map(markRaw))
    error.value = ''
  } catch (e) {
    if (id !== runId) return
    certs.value = []
    parsed.value = []
    error.value = /No certificate found/.test(e.message) ? e.message : `Couldn’t parse the certificate: ${e.message}`
  }
})

// DER (binary) files become PEM; text files are used as-is.
async function onFile (file) {
  const bytes = new Uint8Array(await file.arrayBuffer())
  if (bytes[0] === 0x30) {
    const b64 = btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(''))
    input.value = `-----BEGIN CERTIFICATE-----\n${b64.match(/.{1,64}/g).join('\n')}\n-----END CERTIFICATE-----\n`
  } else {
    input.value = new TextDecoder().decode(bytes)
  }
}

onMounted(() => {
  const h = takeHandoff()
  if (h != null) input.value = h
})
</script>

<style scoped>
.inputs { display: flex; flex-direction: column; gap: 16px; min-width: 0; min-height: 0; }
.inputs__cert { flex: 1.4; }
.verify { display: flex; flex-direction: column; gap: 12px; padding: 14px 10px 10px; min-height: 0; flex: 1; }
.verify__title { padding: 0 6px; font-size: 0.9375rem; font-weight: 600; letter-spacing: -0.015em; }
.verify__field { padding: 0 6px; }
.verify__key { flex: 1; min-height: 200px; box-shadow: inset 0 0 0 0.5px var(--separator); }
.verify__key :deep(.pane__text) { min-height: 90px; }

.report { padding: 4px 0 8px; }
.report__head { display: flex; align-items: center; gap: 12px; margin: 0 12px 10px; padding: 12px 14px; border-radius: 16px; }
.report__head--pass { background: color-mix(in srgb, var(--green) 14%, transparent); color: var(--success-text); }
.report__head--warn { background: color-mix(in srgb, var(--orange) 16%, transparent); color: var(--warning-text); }
.report__head--fail { background: color-mix(in srgb, var(--red) 13%, transparent); color: var(--danger-text); }
.report__head h3 { color: var(--label); }
.report__loading { padding: 4px 16px 12px; }
.checks { border-top: 0.5px solid var(--separator); border-bottom: 0.5px solid var(--separator); }
.check { display: flex; gap: 10px; padding: 10px 16px; }
.check + .check { box-shadow: inset 44px 0.5px 0 0 var(--bg-2), inset 0 0.5px 0 0 var(--separator); }
.check__icon { flex: none; padding-top: 1px; }
.check--pass .check__icon { color: var(--success-text); }
.check--warn .check__icon { color: var(--warning-text); }
.check--fail .check__icon { color: var(--danger-text); }
.check--skip .check__icon { color: var(--label-3); }
.check__text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.check__title { font-size: 0.9375rem; font-weight: 600; letter-spacing: -0.015em; }
.check--skip .check__title { color: var(--label-2); font-weight: 500; }
.check__detail { font-size: 0.8125rem; line-height: 1.4; color: var(--label-2); overflow-wrap: anywhere; }
.result { display: flex; flex-direction: column; min-height: 260px; min-width: 0; overflow: hidden; }
.result__bar { display: flex; align-items: center; gap: 8px; min-height: 46px; padding: 8px 16px 6px; }
.result__label { flex: 1; font-size: 0.9375rem; font-weight: 600; letter-spacing: -0.015em; }
.result__scroll { flex: 1; min-height: 0; overflow-y: auto; padding: 0 0 16px; }
.empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; min-height: 200px; padding: 24px; text-align: center; color: var(--label-2); }
.cert + .cert { margin-top: 20px; padding-top: 16px; border-top: 0.5px solid var(--separator); }
.cert__head { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; padding: 4px 16px 4px; }
.cert__head .badge { margin-top: 4px; }
.cert__section { padding: 16px 16px 6px; color: var(--label-2); font-weight: 600; text-transform: uppercase; letter-spacing: 0.02em; font-size: 0.75rem; }
.cert .inset-list { border-radius: 0; border-top: 0.5px solid var(--separator); border-bottom: 0.5px solid var(--separator); }
.cert .row { align-items: flex-start; }
.cert .row__label { flex: none; width: 34%; min-width: 110px; color: var(--label); }
.cert .row__value { flex: 1; text-align: left; }
.cert .icon-btn { margin: -6px -8px -6px 0; }
</style>
