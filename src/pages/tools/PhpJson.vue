<template>
  <TransformTool
    :transform="transform"
    :options="options"
    :sample="sample"
    :download="(o) => ({ toPhp: 'array.php', fromPhp: 'data.json', serialize: 'serialized.txt', unserialize: 'data.json' }[o.mode])"
  />
</template>

<script setup>
import TransformTool from '@/components/TransformTool.vue'
import { load } from '@/composables/storage'

const options = [
  {
    key: 'mode', type: 'segmented', label: 'Conversion', default: 'toPhp',
    options: [
      { value: 'toPhp', label: 'JSON → PHP' },
      { value: 'fromPhp', label: 'PHP → JSON' },
      { value: 'serialize', label: 'serialize()' },
      { value: 'unserialize', label: 'unserialize()' },
    ],
  },
  { key: 'syntax', type: 'select', label: 'Array syntax', default: 'short', options: [{ value: 'short', label: '[ ] short' }, { value: 'long', label: 'array( )' }] },
]

const json = JSON.stringify({ name: 'Freemium', version: 2, tags: ['php', 'json'], active: true, meta: { author: 'Incentius', score: 9.5 }, license: null }, null, 2)
const samples = {
  toPhp: json,
  serialize: json,
  fromPhp: `<?php
return [
    'name' => 'Freemium',
    'version' => 2,
    'tags' => ['php', 'json'],
    'active' => true,
    'meta' => array('author' => "Incentius", 'score' => 9.5),
    'license' => null,
];`,
  unserialize: 'a:4:{s:4:"name";s:8:"Freemium";s:7:"version";i:2;s:4:"tags";a:2:{i:0;s:3:"php";i:1;s:4:"json";}s:6:"active";b:1;}',
}
// TransformTool persists options, so the current mode is readable here.
const sample = () => samples[load('freemium:opts:php-json', {}).mode || 'toPhp']

const parseJson = (input) => {
  try { return JSON.parse(input) } catch (e) { throw new Error(e.message) }
}

function transform (input, o) {
  switch (o.mode) {
    case 'toPhp': return `<?php\n\nreturn ${toPhp(parseJson(input), o.syntax === 'short')};\n`
    case 'fromPhp': return JSON.stringify(fromPhp(input), null, 2)
    case 'serialize': return serialize(parseJson(input))
    default: return JSON.stringify(unserialize(input), null, 2)
  }
}

// ── JSON → PHP literal ──
function toPhp (v, short = true, indent = '    ', lvl = 0) {
  const pad = indent.repeat(lvl + 1), end = indent.repeat(lvl)
  const open = short ? '[' : 'array(', close = short ? ']' : ')'
  if (v === null) return 'null'
  if (typeof v === 'boolean') return v ? 'true' : 'false'
  if (typeof v === 'number') return String(v)
  if (typeof v === 'string') return `'${v.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
  const isList = Array.isArray(v)
  const entries = isList ? v.map((x, i) => [i, x]) : Object.entries(v)
  if (!entries.length) return open + close
  const body = entries.map(([k, x]) => pad + (isList ? '' : `${toPhp(String(k))} => `) + toPhp(x, short, indent, lvl + 1)).join(',\n')
  return `${open}\n${body},\n${end}${close}`
}

// ── PHP literal → JS ──
function fromPhp (src) {
  let i = 0
  const s = src.trim().replace(/^<\?php\s*/, '').replace(/^(return|\$\w+\s*=)\s*/, '').replace(/;\s*$/, '')
  const err = (m) => { throw new Error(`${m} at character ${i + 1}.`) }
  const ws = () => {
    for (;;) {
      while (/\s/.test(s[i])) i++
      if (s.startsWith('//', i) || s[i] === '#') { while (i < s.length && s[i] !== '\n') i++; continue }
      if (s.startsWith('/*', i)) { const e = s.indexOf('*/', i + 2); i = e < 0 ? s.length : e + 2; continue }
      break
    }
  }
  const value = () => {
    ws()
    if (s.startsWith('array', i) && /\s*\(/.test(s.slice(i + 5, i + 7))) { i += 5; ws(); i++; return arr(')') }
    if (s[i] === '[') { i++; return arr(']') }
    if (s[i] === "'" || s[i] === '"') return str()
    const m = /^-?(\d+\.?\d*([eE][+-]?\d+)?|\.\d+)/.exec(s.slice(i))
    if (m) { i += m[0].length; return Number(m[0]) }
    const w = /^[A-Za-z_]\w*/.exec(s.slice(i))
    if (w) {
      i += w[0].length
      const k = w[0].toLowerCase()
      if (k === 'true') return true
      if (k === 'false') return false
      if (k === 'null') return null
      err(`Unsupported constant “${w[0]}”`)
    }
    err(i >= s.length ? 'Unexpected end of input' : `Unexpected “${s[i]}”`)
  }
  const str = () => {
    const q = s[i++]; let out = ''
    while (i < s.length && s[i] !== q) {
      if (s[i] === '\\') {
        const n = s[i + 1]
        if (q === "'") { out += (n === "'" || n === '\\') ? n : '\\' + n; i += 2; continue }
        const map = { n: '\n', t: '\t', r: '\r', v: '\v', e: '\x1b', f: '\f', '\\': '\\', $: '$', '"': '"', 0: '\0' }
        if (n in map) { out += map[n]; i += 2; continue }
        if (n === 'u' && s[i + 2] === '{') { const e = s.indexOf('}', i); out += String.fromCodePoint(parseInt(s.slice(i + 3, e), 16)); i = e + 1; continue }
        out += '\\'; i++; continue
      }
      out += s[i++]
    }
    if (s[i] !== q) err('Unterminated string')
    i++
    return out
  }
  const arr = (close) => {
    const entries = []; let next = 0; let list = true
    for (;;) {
      ws()
      if (s[i] === close) { i++; break }
      let k, v = value()
      ws()
      if (s.startsWith('=>', i)) {
        i += 2; k = v; v = value()
        if (typeof k === 'number' && Number.isInteger(k)) { if (k !== next) list = false; next = Math.max(next, k + 1) }
        else if (typeof k === 'string' && /^(0|-?[1-9]\d*)$/.test(k)) { const n = Number(k); if (n !== next) list = false; next = Math.max(next, n + 1); k = n }
        else list = false
      } else { k = next++ }
      entries.push([k, v])
      ws()
      if (s[i] === ',') { i++; continue }
      if (s[i] === close) { i++; break }
      err(`Expected “,” or “${close}”`)
    }
    return list ? entries.map((e) => e[1]) : Object.fromEntries(entries.map(([k, v]) => [String(k), v]))
  }
  const out = value(); ws()
  if (i < s.length) err('Unexpected trailing content')
  return out
}

// ── serialize ──
const blen = (x) => new TextEncoder().encode(x).length
function serialize (v) {
  if (v === null) return 'N;'
  if (typeof v === 'boolean') return `b:${v ? 1 : 0};`
  if (typeof v === 'number') return Number.isInteger(v) ? `i:${v};` : `d:${v};`
  if (typeof v === 'string') return `s:${blen(v)}:"${v}";`
  const entries = Array.isArray(v) ? v.map((x, i) => [i, x]) : Object.entries(v)
  return `a:${entries.length}:{${entries.map(([k, x]) => (typeof k === 'number' || /^(0|-?[1-9]\d*)$/.test(k) ? `i:${k};` : serialize(k)) + serialize(x)).join('')}}`
}

// ── unserialize (works on UTF-8 bytes because s:N counts bytes) ──
function unserialize (text) {
  const b = new TextEncoder().encode(text.trim())
  const dec = new TextDecoder()
  let i = 0
  const err = (m) => { throw new Error(`${m} at byte ${i}.`) }
  const until = (ch) => { const s = i; while (i < b.length && b[i] !== ch.charCodeAt(0)) i++; if (i >= b.length) err(`Expected “${ch}”`); const r = dec.decode(b.slice(s, i)); i++; return r }
  const expect = (ch) => { if (b[i] !== ch.charCodeAt(0)) err(`Expected “${ch}”`); i++ }
  const val = () => {
    const t = String.fromCharCode(b[i]); i++
    if (t === 'N') { expect(';'); return null }
    expect(':')
    switch (t) {
      case 'b': return until(';') === '1'
      case 'i': return Number(until(';'))
      case 'd': { const x = until(';'); return x === 'INF' ? Infinity : x === '-INF' ? -Infinity : x === 'NAN' ? NaN : Number(x) }
      case 's': case 'S': { const n = Number(until(':')); expect('"'); const r = dec.decode(b.slice(i, i + n)); i += n; expect('"'); expect(';'); return r }
      case 'a': { const n = Number(until(':')); expect('{'); const r = members(n); expect('}'); return r }
      case 'O': case 'C': {
        until(':'); expect('"'); const cls = until('"'); expect(':')
        if (t === 'C') { const n = Number(until(':')); expect('{'); const d = dec.decode(b.slice(i, i + n)); i += n; expect('}'); return { __class: cls, __data: d } }
        const n = Number(until(':')); expect('{'); const r = members(n, true); expect('}')
        return { __class: cls, ...(Array.isArray(r) ? Object.fromEntries(r.map((x, k) => [k, x])) : r) }
      }
      case 'r': case 'R': return `<reference ${until(';')}>`
      default: i--; err(`Unknown type “${t}”`)
    }
  }
  const members = (n, obj = false) => {
    const e = []; let list = !obj
    for (let k = 0; k < n; k++) {
      let key = val()
      if (typeof key === 'string') key = key.replace(/^\0[^\0]*\0/, "") // strip protected/private markers
      if (key !== k) list = false
      e.push([key, val()])
    }
    return list ? e.map((x) => x[1]) : Object.fromEntries(e.map(([k, v]) => [String(k), v]))
  }
  const out = val()
  if (i < b.length) err('Unexpected trailing data')
  return out
}
</script>
