<template>
  <TransformTool
    :transform="transform"
    :options="options"
    :sample="sample"
    input-label="YAML"
    output-label="JSON"
    accept=".yaml,.yml,text/yaml,text/plain"
    :download="(o) => (o.minify ? 'data.min.json' : 'data.json')"
  />
</template>

<script setup>
import { load, loadAll } from 'js-yaml'
import TransformTool from '@/components/TransformTool.vue'

const options = [
  { key: 'indent', type: 'select', label: 'Indent', default: '2', options: [{ value: '2', label: '2 spaces' }, { value: '4', label: '4 spaces' }, { value: 'tab', label: 'Tabs' }] },
  { key: 'minify', type: 'toggle', label: 'Minify', default: false },
  { key: 'multi', type: 'toggle', label: 'Multiple documents (---)', default: false },
]

const sample = `# Service definition
apiVersion: apps/v1
kind: Deployment
metadata:
  name: freemium
  labels:
    app: web
spec:
  replicas: 3
  ports:
    - 80
    - 443
  enabled: true
  notes: |
    Multi-line
    text block`

function transform (input, o) {
  let data
  try {
    data = o.multi ? loadAll(input) : load(input)
  } catch (e) {
    if (/expected a single document/i.test(e.message)) throw new Error('This YAML has more than one document. Turn on “Multiple documents”.')
    throw new Error(e.message.split('\n')[0])
  }
  if (data === undefined) return ''
  if (o.minify) return JSON.stringify(data)
  return JSON.stringify(data, null, o.indent === 'tab' ? '\t' : Number(o.indent))
}
</script>
