<template>
  <TransformTool
    :transform="transform"
    :options="options"
    :sample="sample"
    input-label="cURL command"
    output-label="Code"
    placeholder="curl https://api.example.com -H 'Accept: application/json'"
    :accept="false"
    :download="(o) => `request.${ext[o.target]}`"
  />
</template>

<script setup>
import TransformTool from '@/components/TransformTool.vue'

const options = [
  {
    key: 'target', type: 'select', label: 'Language', default: 'fetch',
    options: [
      { value: 'fetch', label: 'JavaScript (fetch)' },
      { value: 'axios', label: 'JavaScript (Axios)' },
      { value: 'python', label: 'Python (requests)' },
      { value: 'go', label: 'Go (net/http)' },
      { value: 'php', label: 'PHP (cURL)' },
      { value: 'swift', label: 'Swift (URLSession)' },
      { value: 'rust', label: 'Rust (reqwest)' },
    ],
  },
]
const ext = { fetch: 'js', axios: 'js', python: 'py', go: 'go', php: 'php', swift: 'swift', rust: 'rs' }

const sample = `curl -X POST 'https://api.example.com/v1/users?team=core' \\
  -H 'Content-Type: application/json' \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{"name":"Ada Lovelace","roles":["admin"]}'`

function transform (input, o) {
  return generators[o.target](parseCurl(input))
}

// ── Tokenize like a POSIX shell (quotes, escapes, line continuations) ──
function tokenize (src) {
  const s = src.replace(/\\\r?\n/g, ' ').replace(/\^\r?\n/g, ' ').trim()
  const out = []
  let cur = null
  let i = 0
  const push = () => { if (cur !== null) out.push(cur); cur = null }
  while (i < s.length) {
    const c = s[i]
    if (/\s/.test(c)) { push(); i++; continue }
    cur = cur ?? ''
    if (c === "'") {
      const e = s.indexOf("'", i + 1)
      if (e < 0) throw new Error('Unclosed single quote.')
      cur += s.slice(i + 1, e); i = e + 1
    } else if (c === '$' && s[i + 1] === "'") {
      i += 2
      while (i < s.length && s[i] !== "'") {
        if (s[i] === '\\') { const m = { n: '\n', t: '\t', r: '\r', "'": "'", '\\': '\\', '"': '"' }[s[i + 1]]; cur += m ?? s[i + 1]; i += 2 } else cur += s[i++]
      }
      i++
    } else if (c === '"') {
      i++
      while (i < s.length && s[i] !== '"') {
        if (s[i] === '\\' && '"\\$`'.includes(s[i + 1])) { cur += s[i + 1]; i += 2 } else cur += s[i++]
      }
      if (s[i] !== '"') throw new Error('Unclosed double quote.')
      i++
    } else if (c === '\\') { cur += s[i + 1] ?? ''; i += 2 } else { cur += c; i++ }
  }
  push()
  return out
}

function parseCurl (src) {
  const t = tokenize(src)
  if (t[0] !== 'curl') throw new Error('Command must start with “curl”.')
  const req = { method: null, url: null, headers: [], data: [], form: [], auth: null, json: false, cookies: null, insecure: false, compressed: false, getMode: false }
  const takesArg = new Set(['-X', '--request', '-H', '--header', '-d', '--data', '--data-raw', '--data-binary', '--data-ascii', '--data-urlencode', '--json', '-u', '--user', '-F', '--form', '--form-string', '-b', '--cookie', '-A', '--user-agent', '-e', '--referer', '--url', '-o', '--output', '-m', '--max-time', '--connect-timeout', '-x', '--proxy', '-w', '--write-out', '--retry', '-c', '--cookie-jar', '--cacert', '--cert', '--key', '-T', '--upload-file'])
  for (let i = 1; i < t.length; i++) {
    let tok = t[i]
    let val
    const eq = /^(--[\w-]+)=(.*)$/s.exec(tok)
    if (eq) { tok = eq[1]; val = eq[2] }
    // -XPOST / -HFoo style
    if (!eq && /^-[XHdubFAe]./.test(tok) && !tok.startsWith('--')) { val = tok.slice(2); tok = tok.slice(0, 2) }
    if (takesArg.has(tok) && val === undefined) {
      val = t[++i]
      if (val === undefined) throw new Error(`Option ${tok} needs a value.`)
    }
    switch (tok) {
      case '-X': case '--request': req.method = val.toUpperCase(); break
      case '-H': case '--header': {
        const k = val.indexOf(':')
        if (k > 0) req.headers.push([val.slice(0, k).trim(), val.slice(k + 1).trim()])
        break
      }
      case '-d': case '--data': case '--data-ascii': case '--data-binary': case '--data-raw':
        req.data.push(tok === '--data-raw' || tok === '--data-binary' ? val : val.replace(/[\r\n]/g, '')); break
      case '--data-urlencode': {
        const k = val.indexOf('=')
        req.data.push(k >= 0 ? `${val.slice(0, k + 1)}${encodeURIComponent(val.slice(k + 1))}` : encodeURIComponent(val)); break
      }
      case '--json':
        req.data.push(val); req.json = true; break
      case '-u': case '--user': req.auth = val; break
      case '-F': case '--form': case '--form-string': {
        const k = val.indexOf('=')
        req.form.push([val.slice(0, k), val.slice(k + 1)]); break
      }
      case '-b': case '--cookie': req.cookies = val; break
      case '-A': case '--user-agent': req.headers.push(['User-Agent', val]); break
      case '-e': case '--referer': req.headers.push(['Referer', val]); break
      case '-k': case '--insecure': req.insecure = true; break
      case '--compressed': req.compressed = true; break
      case '-G': case '--get': req.getMode = true; break
      case '-I': case '--head': req.method = 'HEAD'; break
      case '--url': req.url = val; break
      default:
        if (tok.startsWith('-')) { if (takesArg.has(tok)) break; continue }
        if (!req.url) req.url = tok
    }
  }
  if (!req.url) throw new Error('No URL found in the command.')
  if (!/^[a-z][\w+.-]*:\/\//i.test(req.url)) req.url = `http://${req.url}`
  if (req.cookies) req.headers.push(['Cookie', req.cookies])
  if (req.json) {
    if (!req.headers.some(([k]) => /^content-type$/i.test(k))) req.headers.push(['Content-Type', 'application/json'])
    if (!req.headers.some(([k]) => /^accept$/i.test(k))) req.headers.push(['Accept', 'application/json'])
  }
  let body = req.data.length ? req.data.join('&') : null
  if (req.getMode && body) { req.url += (req.url.includes('?') ? '&' : '?') + body; body = null }
  if (body && !req.json && !req.headers.some(([k]) => /^content-type$/i.test(k))) req.headers.push(['Content-Type', 'application/x-www-form-urlencoded'])
  if (req.auth) {
    const [u, p = ''] = req.auth.split(/:(.*)/s)
    req.basic = { user: u, pass: p }
  }
  req.body = body
  req.method = req.method || (body || req.form.length ? 'POST' : 'GET')
  return req
}

// ── Code generators ──
const q = (s) => JSON.stringify(s) // double-quoted, escaped (valid in JS, Go, Swift, Rust, Python, PHP)
const isJsonBody = (r) => {
  if (!r.body) return false
  const ct = (r.headers.find(([k]) => /^content-type$/i.test(k)) || [])[1] || ''
  if (!/json/i.test(ct)) return false
  try { JSON.parse(r.body); return true } catch { return false }
}
const authHeader = (r) => (r.basic ? [['Authorization', `Basic ${btoa(`${r.basic.user}:${r.basic.pass}`)}`]] : [])
const fileField = (v) => v.startsWith('@')

function jsFetch (r) {
  const headers = [...r.headers, ...authHeader(r)]
  const lines = []
  if (r.form.length) {
    lines.push('const form = new FormData()')
    for (const [k, v] of r.form) lines.push(fileField(v) ? `form.append(${q(k)}, fileInput.files[0]) // ${v.slice(1)}` : `form.append(${q(k)}, ${q(v)})`)
    lines.push('')
  }
  const opts = [`  method: ${q(r.method)},`]
  if (headers.length) opts.push(`  headers: {\n${headers.map(([k, v]) => `    ${q(k)}: ${q(v)},`).join('\n')}\n  },`)
  if (r.form.length) opts.push('  body: form,')
  else if (isJsonBody(r)) opts.push(`  body: JSON.stringify(${JSON.stringify(JSON.parse(r.body), null, 2).replace(/\n/g, '\n  ')}),`)
  else if (r.body) opts.push(`  body: ${q(r.body)},`)
  lines.push(`const response = await fetch(${q(r.url)}, {\n${opts.join('\n')}\n})`, '', 'const data = await response.json()')
  return lines.join('\n')
}

function axios (r) {
  const headers = r.headers
  const lines = ["import axios from 'axios'", '']
  if (r.form.length) {
    lines.push('const form = new FormData()')
    for (const [k, v] of r.form) lines.push(fileField(v) ? `form.append(${q(k)}, fileInput.files[0]) // ${v.slice(1)}` : `form.append(${q(k)}, ${q(v)})`)
    lines.push('')
  }
  const cfg = [`  method: ${q(r.method.toLowerCase())},`, `  url: ${q(r.url)},`]
  if (headers.length) cfg.push(`  headers: {\n${headers.map(([k, v]) => `    ${q(k)}: ${q(v)},`).join('\n')}\n  },`)
  if (r.basic) cfg.push(`  auth: { username: ${q(r.basic.user)}, password: ${q(r.basic.pass)} },`)
  if (r.form.length) cfg.push('  data: form,')
  else if (isJsonBody(r)) cfg.push(`  data: ${JSON.stringify(JSON.parse(r.body), null, 2).replace(/\n/g, '\n  ')},`)
  else if (r.body) cfg.push(`  data: ${q(r.body)},`)
  lines.push(`const { data } = await axios({\n${cfg.join('\n')}\n})`)
  return lines.join('\n')
}

function pyLit (v, ind = '') {
  if (v === null) return 'None'
  if (v === true) return 'True'
  if (v === false) return 'False'
  if (typeof v === 'number') return String(v)
  if (typeof v === 'string') return q(v)
  const n = ind + '    '
  if (Array.isArray(v)) return v.length ? `[\n${v.map((x) => n + pyLit(x, n)).join(',\n')},\n${ind}]` : '[]'
  const e = Object.entries(v)
  return e.length ? `{\n${e.map(([k, x]) => `${n}${q(k)}: ${pyLit(x, n)}`).join(',\n')},\n${ind}}` : '{}'
}

function python (r) {
  const lines = ['import requests', '']
  const args = [q(r.url)]
  const headers = r.headers.filter(([k]) => !(r.form.length && /^content-type$/i.test(k)))
  if (headers.length) { lines.push(`headers = {\n${headers.map(([k, v]) => `    ${q(k)}: ${q(v)},`).join('\n')}\n}`, ''); args.push('headers=headers') }
  if (r.form.length) {
    const files = r.form.filter(([, v]) => fileField(v))
    const fields = r.form.filter(([, v]) => !fileField(v))
    if (fields.length) { lines.push(`data = {\n${fields.map(([k, v]) => `    ${q(k)}: ${q(v)},`).join('\n')}\n}`, ''); args.push('data=data') }
    if (files.length) { lines.push(`files = {\n${files.map(([k, v]) => `    ${q(k)}: open(${q(v.slice(1))}, "rb"),`).join('\n')}\n}`, ''); args.push('files=files') }
  } else if (isJsonBody(r)) { lines.push(`json_data = ${pyLit(JSON.parse(r.body))}`, ''); args.push('json=json_data') } else if (r.body) { lines.push(`data = ${q(r.body)}`, ''); args.push('data=data') }
  if (r.basic) args.push(`auth=(${q(r.basic.user)}, ${q(r.basic.pass)})`)
  if (r.insecure) args.push('verify=False')
  lines.push(`response = requests.${['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].includes(r.method) ? r.method.toLowerCase() : 'request'}(${r.method.match(/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)$/) ? '' : `${q(r.method)}, `}${args.join(', ')})`, 'print(response.status_code)', 'print(response.text)')
  return lines.join('\n')
}

function go (r) {
  const goStr = (s) => (s.includes('`') ? q(s) : `\`${s}\``)
  const lines = ['package main', '', 'import (', '\t"fmt"', '\t"io"', '\t"net/http"']
  if (r.body) lines.push('\t"strings"')
  lines.push(')', '', 'func main() {')
  if (r.form.length) lines.push('\t// TODO: multipart form fields: ' + r.form.map(([k]) => k).join(', ') + ' (use mime/multipart)')
  lines.push(r.body ? `\tbody := strings.NewReader(${goStr(r.body)})` : '\tvar body io.Reader')
  lines.push(`\treq, err := http.NewRequest(${q(r.method)}, ${q(r.url)}, body)`, '\tif err != nil {', '\t\tpanic(err)', '\t}')
  for (const [k, v] of r.headers) lines.push(`\treq.Header.Set(${q(k)}, ${q(v)})`)
  if (r.basic) lines.push(`\treq.SetBasicAuth(${q(r.basic.user)}, ${q(r.basic.pass)})`)
  lines.push('', '\tresp, err := http.DefaultClient.Do(req)', '\tif err != nil {', '\t\tpanic(err)', '\t}', '\tdefer resp.Body.Close()', '', '\tdata, _ := io.ReadAll(resp.Body)', '\tfmt.Println(resp.Status)', '\tfmt.Println(string(data))', '}')
  return lines.join('\n')
}

function php (r) {
  const sq = (s) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
  const lines = ['<?php', '', `$ch = curl_init(${sq(r.url)});`, '', 'curl_setopt_array($ch, [', '    CURLOPT_RETURNTRANSFER => true,']
  if (r.method !== 'GET') lines.push(`    CURLOPT_CUSTOMREQUEST => ${sq(r.method)},`)
  if (r.headers.length) lines.push('    CURLOPT_HTTPHEADER => [', ...r.headers.map(([k, v]) => `        ${sq(`${k}: ${v}`)},`), '    ],')
  if (r.basic) lines.push(`    CURLOPT_USERPWD => ${sq(`${r.basic.user}:${r.basic.pass}`)},`)
  if (r.form.length) lines.push('    CURLOPT_POSTFIELDS => [', ...r.form.map(([k, v]) => `        ${sq(k)} => ${fileField(v) ? `new CURLFile(${sq(v.slice(1))})` : sq(v)},`), '    ],')
  else if (r.body) lines.push(`    CURLOPT_POSTFIELDS => ${sq(r.body)},`)
  if (r.insecure) lines.push('    CURLOPT_SSL_VERIFYPEER => false,')
  if (r.compressed) lines.push("    CURLOPT_ENCODING => '',")
  lines.push(']);', '', '$response = curl_exec($ch);', '$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);', 'curl_close($ch);', '', 'echo $response;')
  return lines.join('\n')
}

function swift (r) {
  const lines = ['import Foundation', '', `var request = URLRequest(url: URL(string: ${q(r.url)})!)`, `request.httpMethod = ${q(r.method)}`]
  for (const [k, v] of [...r.headers, ...authHeader(r)]) lines.push(`request.setValue(${q(v)}, forHTTPHeaderField: ${q(k)})`)
  if (r.form.length) lines.push('// TODO: build a multipart/form-data body for: ' + r.form.map(([k]) => k).join(', '))
  if (r.body) lines.push(r.body.includes('\n') ? `request.httpBody = """\n${r.body}\n""".data(using: .utf8)` : `request.httpBody = ${q(r.body)}.data(using: .utf8)`)
  lines.push('', 'let (data, response) = try await URLSession.shared.data(for: request)', 'if let http = response as? HTTPURLResponse {', '    print(http.statusCode)', '}', 'print(String(decoding: data, as: UTF8.self))')
  return lines.join('\n')
}

function rust (r) {
  const lines = ['// Cargo.toml: reqwest = { version = "0.12", features = ["blocking", "json", "multipart"] }', '', 'fn main() -> Result<(), Box<dyn std::error::Error>> {', '    let client = reqwest::blocking::Client::new();', `    let response = client`, `        .request(reqwest::Method::from_bytes(b${q(r.method)})?, ${q(r.url)})`]
  for (const [k, v] of r.headers) lines.push(`        .header(${q(k)}, ${q(v)})`)
  if (r.basic) lines.push(`        .basic_auth(${q(r.basic.user)}, Some(${q(r.basic.pass)}))`)
  if (r.form.length) lines.push(`        .multipart(reqwest::blocking::multipart::Form::new()${r.form.map(([k, v]) => (fileField(v) ? `.file(${q(k)}, ${q(v.slice(1))})?` : `.text(${q(k)}, ${q(v)})`)).join('')})`)
  else if (r.body) lines.push(`        .body(${q(r.body)})`)
  lines.push('        .send()?;', '', '    println!("{}", response.status());', '    println!("{}", response.text()?);', '    Ok(())', '}')
  return lines.join('\n')
}

const generators = { fetch: jsFetch, axios, python, go, php, swift, rust }
</script>
