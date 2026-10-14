<template>
  <TransformTool
    :transform="transform"
    :options="options"
    :sample="sample"
    accept=".json,application/json,text/plain"
    :download="(o) => (o.mode === 'minify' ? 'data.min.json' : 'data.json')"
  />
</template>

<script setup>
import TransformTool from '@/components/TransformTool.vue'

const options = [
  { key: 'mode', type: 'segmented', label: 'Mode', default: 'format', options: [{ value: 'format', label: 'Format' }, { value: 'minify', label: 'Minify' }] },
  { key: 'indent', type: 'select', label: 'Indent', default: '2', options: [{ value: '2', label: '2 spaces' }, { value: '4', label: '4 spaces' }, { value: 'tab', label: 'Tabs' }] },
  { key: 'sortKeys', type: 'toggle', label: 'Sort keys', default: false },
]

const sample = () => JSON.stringify({
  id: 1024, name: 'Freemium', private: true, tags: ['json', 'tools'],
  owner: { login: 'incentius', url: 'https://incentius.com' }, stars: 42.5, license: null,
})

function sortDeep (v) {
  if (Array.isArray(v)) return v.map(sortDeep)
  if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortDeep(v[k])]))
  return v
}

// JSON.parse errors only give an offset; turn it into "line X, column Y".
function locate (input, message) {
  const m = /position (\d+)/i.exec(message)
  if (!m) return message
  const pos = Number(m[1])
  const before = input.slice(0, pos).split('\n')
  return `${message.replace(/ in JSON at position \d+.*$/i, '')} — line ${before.length}, column ${before[before.length - 1].length + 1}`
}

function transform (input, o) {
  let data
  try { data = JSON.parse(input) } catch (e) { throw new Error(locate(input, e.message)) }
  if (o.sortKeys) data = sortDeep(data)
  if (o.mode === 'minify') return JSON.stringify(data)
  return JSON.stringify(data, null, o.indent === 'tab' ? '\t' : Number(o.indent))
}
</script>
