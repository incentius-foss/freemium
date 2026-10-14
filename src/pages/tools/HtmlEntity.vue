<template>
  <TransformTool
    :transform="transform"
    :options="options"
    :swap="{ key: 'mode', values: ['encode', 'decode'] }"
    sample='<a href="/search?q=tom&amp;jerry">Tom & Jerry’s “café” — © 2026</a>'
    :download="(o) => (o.mode === 'encode' ? 'escaped.html' : 'unescaped.txt')"
  />
</template>

<script setup>
import TransformTool from '@/components/TransformTool.vue'

const options = [
  { key: 'mode', type: 'segmented', label: 'Direction', default: 'encode', options: [{ value: 'encode', label: 'Encode' }, { value: 'decode', label: 'Decode' }] },
  {
    key: 'scope', type: 'select', label: 'Encode', default: 'minimal', options: [
      { value: 'minimal', label: 'Reserved only (& < > " \')' },
      { value: 'nonascii', label: 'Reserved + non-ASCII' },
      { value: 'all', label: 'Every character' },
    ],
  },
  { key: 'style', type: 'select', label: 'Format', default: 'named', options: [
    { value: 'named', label: 'Named (&amp;copy;)' },
    { value: 'decimal', label: 'Decimal (&amp;#169;)' },
    { value: 'hex', label: 'Hex (&amp;#xA9;)' },
  ] },
]

// Common named entities; anything else falls back to numeric.
const NAMED = {
  '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot', "'": 'apos', '\u00a0': 'nbsp', '©': 'copy', '®': 'reg', '™': 'trade',
  '€': 'euro', '£': 'pound', '¥': 'yen', '¢': 'cent', '§': 'sect', '°': 'deg', '±': 'plusmn', '×': 'times', '÷': 'divide',
  '–': 'ndash', '—': 'mdash', '‘': 'lsquo', '’': 'rsquo', '“': 'ldquo', '”': 'rdquo', '…': 'hellip', '•': 'bull',
  '«': 'laquo', '»': 'raquo', '¶': 'para', '·': 'middot', '½': 'frac12', '¼': 'frac14', '¾': 'frac34', '→': 'rarr',
  '←': 'larr', '↑': 'uarr', '↓': 'darr', '♥': 'hearts', 'é': 'eacute', 'è': 'egrave', 'à': 'agrave', 'ç': 'ccedil',
  'ñ': 'ntilde', 'ü': 'uuml', 'ö': 'ouml', 'ä': 'auml', 'ß': 'szlig',
}
const RESERVED = /[&<>"']/

function entity (ch, style) {
  if (style === 'named' && NAMED[ch]) return `&${NAMED[ch]};`
  const cp = ch.codePointAt(0)
  return style === 'hex' ? `&#x${cp.toString(16).toUpperCase()};` : `&#${cp};`
}

function decode (s) {
  // DOMParser decodes the full HTML5 named-entity table without executing anything.
  const doc = new DOMParser().parseFromString(`<!doctype html><body><textarea>${s.replace(/<\/textarea/gi, '&lt;/textarea')}</textarea>`, 'text/html')
  return doc.querySelector('textarea').value
}

function transform (input, { mode, scope, style }) {
  if (mode === 'decode') return decode(input)
  let out = ''
  for (const ch of input) {
    const encode = scope === 'all' ? !/\s/.test(ch) : RESERVED.test(ch) || (scope === 'nonascii' && ch.codePointAt(0) > 126)
    out += encode ? entity(ch, style) : ch
  }
  return out
}
</script>
