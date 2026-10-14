<template>
  <TransformTool
    :transform="transform"
    :options="options"
    :swap="{ key: 'mode', values: ['escape', 'unescape'] }"
    :sample="sample"
    :download="(o) => (o.mode === 'escape' ? 'escaped.txt' : 'unescaped.txt')"
  />
</template>

<script setup>
import TransformTool from '@/components/TransformTool.vue'

const sample = 'She said: “Hello”\n\t→ path: C:\\Users\\dev\nemoji: 🚀 "quoted"'

const options = [
  { key: 'mode', type: 'segmented', label: 'Direction', default: 'escape', options: [{ value: 'escape', label: 'Escape' }, { value: 'unescape', label: 'Unescape' }] },
  {
    key: 'lang', type: 'select', label: 'Style', default: 'js', options: [
      { value: 'js', label: 'JavaScript / JSON' },
      { value: 'c', label: 'C / Java / Swift' },
      { value: 'python', label: 'Python' },
      { value: 'regex', label: 'Regular expression' },
    ],
  },
  { key: 'ascii', type: 'toggle', label: 'Escape non-ASCII', default: false },
  { key: 'single', type: 'toggle', label: 'Escape single quotes', default: false },
]

const SIMPLE = { '\\': '\\\\', '\n': '\\n', '\r': '\\r', '\t': '\\t', '\b': '\\b', '\f': '\\f', '\v': '\\v', '"': '\\"', '\0': '\\0' }

const hex4 = (n) => n.toString(16).padStart(4, '0')

function escapeChar (ch, { lang, ascii, single }) {
  if (ch === "'") return single ? "\\'" : ch
  if (ch in SIMPLE) {
    if (lang === 'js' && ch === '\v') return '\\u000b' // JSON has no \v
    return SIMPLE[ch]
  }
  const cp = ch.codePointAt(0)
  if (cp < 0x20 || cp === 0x7f) return lang === 'python' ? `\\x${cp.toString(16).padStart(2, '0')}` : `\\u${hex4(cp)}`
  if (ascii && cp > 0x7e) {
    if (cp > 0xffff) {
      if (lang === 'python') return `\\U${cp.toString(16).padStart(8, '0')}`
      if (lang === 'c') return `\\U${cp.toString(16).padStart(8, '0')}`
      // JS / JSON: surrogate pair
      const hi = Math.floor((cp - 0x10000) / 0x400) + 0xd800
      const lo = ((cp - 0x10000) % 0x400) + 0xdc00
      return `\\u${hex4(hi)}\\u${hex4(lo)}`
    }
    return `\\u${hex4(cp)}`
  }
  return ch
}

function unescape (s) {
  return s.replace(/\\(u\{([0-9a-fA-F]+)\}|u([0-9a-fA-F]{4})|U([0-9a-fA-F]{8})|x([0-9a-fA-F]{2})|([0-7]{1,3})|(.)|$)/gs, (m, _all, braced, u4, u8, x2, oct, ch) => {
    if (braced) return String.fromCodePoint(parseInt(braced, 16))
    if (u4) return String.fromCharCode(parseInt(u4, 16))
    if (u8) return String.fromCodePoint(parseInt(u8, 16))
    if (x2) return String.fromCharCode(parseInt(x2, 16))
    if (oct) return oct === '0' ? '\0' : String.fromCharCode(parseInt(oct, 8))
    if (ch === undefined) throw new Error('The text ends with a lone backslash.')
    return { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', v: '\v', a: '\x07', e: '\x1b' }[ch] ?? ch
  })
}

function transform (input, o) {
  if (o.lang === 'regex') {
    return o.mode === 'escape' ? input.replace(/[.*+?^${}()|[\]\\/-]/g, '\\$&') : input.replace(/\\([.*+?^${}()|[\]\\/-])/g, '$1')
  }
  if (o.mode === 'unescape') return unescape(input)
  let out = ''
  for (const ch of input) out += escapeChar(ch, o)
  return out
}

</script>
