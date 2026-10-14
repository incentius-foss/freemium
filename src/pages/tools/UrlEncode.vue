<template>
  <TransformTool
    :transform="transform"
    :options="options"
    :swap="{ key: 'mode', values: ['encode', 'decode'] }"
    sample="https://example.com/search?q=liquid glass & café&lang=en-US#top"
    :download="(o) => (o.mode === 'encode' ? 'encoded.txt' : 'decoded.txt')"
  />
</template>

<script setup>
import TransformTool from '@/components/TransformTool.vue'

const options = [
  { key: 'mode', type: 'segmented', label: 'Direction', default: 'encode', options: [{ value: 'encode', label: 'Encode' }, { value: 'decode', label: 'Decode' }] },
  {
    key: 'scheme', type: 'select', label: 'Scheme', default: 'component', options: [
      { value: 'component', label: 'Component (encodeURIComponent)' },
      { value: 'uri', label: 'Full URL (encodeURI)' },
      { value: 'form', label: 'Form (spaces as +)' },
    ],
  },
  { key: 'perLine', type: 'toggle', label: 'Each line separately', default: false },
]

function encodeOne (s, scheme) {
  if (scheme === 'uri') return encodeURI(s)
  const out = encodeURIComponent(s)
  return scheme === 'form' ? out.replace(/%20/g, '+') : out
}

function decodeOne (s, scheme) {
  const src = scheme === 'form' ? s.replace(/\+/g, ' ') : s
  try {
    return scheme === 'uri' ? decodeURI(src) : decodeURIComponent(src)
  } catch {
    throw new Error('Malformed percent-encoding — look for a “%” that isn’t followed by two hex digits.')
  }
}

function transform (input, { mode, scheme, perLine }) {
  const fn = mode === 'encode' ? encodeOne : decodeOne
  return perLine ? input.split('\n').map((l) => fn(l, scheme)).join('\n') : fn(input, scheme)
}
</script>
