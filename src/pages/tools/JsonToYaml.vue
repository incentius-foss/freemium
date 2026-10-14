<template>
  <TransformTool
    :transform="transform"
    :options="options"
    :sample="sample"
    input-label="JSON"
    output-label="YAML"
    accept=".json,application/json,text/plain"
    download="data.yaml"
  />
</template>

<script setup>
import { dump } from 'js-yaml'
import TransformTool from '@/components/TransformTool.vue'

const options = [
  { key: 'indent', type: 'select', label: 'Indent', default: '2', options: [{ value: '2', label: '2 spaces' }, { value: '4', label: '4 spaces' }] },
  { key: 'sortKeys', type: 'toggle', label: 'Sort keys', default: false },
  { key: 'multi', type: 'toggle', label: 'Array → documents (---)', default: false },
]

const sample = () => JSON.stringify({
  name: 'freemium', version: '1.0.0', private: true,
  scripts: { dev: 'quasar dev', build: 'quasar build' },
  tags: ['json', 'yaml'], owner: { name: 'Incentius', url: 'https://incentius.com' }, license: null,
}, null, 2)

function transform (input, o) {
  let data
  try { data = JSON.parse(input) } catch (e) { throw new Error(e.message) }
  const opts = { indent: Number(o.indent), sortKeys: o.sortKeys, lineWidth: -1, noRefs: true }
  if (o.multi) {
    if (!Array.isArray(data)) throw new Error('“Array → documents” needs a top-level JSON array.')
    return data.map((d) => dump(d, opts)).join('---\n')
  }
  return dump(data, opts)
}
</script>
