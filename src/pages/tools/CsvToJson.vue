<template>
  <TransformTool
    :transform="transform"
    :options="options"
    :sample="sample"
    input-label="CSV"
    output-label="JSON"
    accept=".csv,.tsv,text/csv,text/plain"
    download="data.json"
  />
</template>

<script setup>
import TransformTool from '@/components/TransformTool.vue'

const options = [
  {
    key: 'delimiter', type: 'select', label: 'Delimiter', default: 'auto',
    options: [{ value: 'auto', label: 'Auto-detect' }, { value: ',', label: 'Comma' }, { value: '\t', label: 'Tab' }, { value: ';', label: 'Semicolon' }, { value: '|', label: 'Pipe' }],
  },
  { key: 'header', type: 'toggle', label: 'First row is header', default: true },
  { key: 'infer', type: 'toggle', label: 'Infer numbers & booleans', default: true },
]

const sample = `id,name,email,active,score
1,Ada Lovelace,ada@example.com,true,98.5
2,"Hopper, Grace",grace@example.com,false,87
3,Alan Turing,"alan@example.com",true,`

function detect (text) {
  const firstLines = text.split(/\r?\n/).slice(0, 5)
  let best = ','
  let bestScore = -1
  for (const d of [',', '\t', ';', '|']) {
    const counts = firstLines.map((l) => l.split(d).length - 1)
    const score = counts[0] > 0 && counts.every((c) => c === counts[0]) ? counts[0] * 10 : counts[0]
    if (score > bestScore) { best = d; bestScore = score }
  }
  return best
}

// RFC 4180: quoted fields, "" escapes, newlines inside quotes.
function parse (text, d) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ } else quoted = false
      } else field += c
    } else if (c === '"' && field === '') quoted = true
    else if (c === d) { row.push(field); field = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field); rows.push(row); row = []; field = ''
    } else field += c
  }
  if (quoted) throw new Error('Unclosed quote — a field starts with " but never ends.')
  if (field !== '' || row.length) { row.push(field); rows.push(row) }
  return rows.filter((r) => !(r.length === 1 && r[0] === ''))
}

function infer (v) {
  if (v === '') return null
  if (v === 'true') return true
  if (v === 'false') return false
  if (/^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/.test(v) && Number.isFinite(Number(v))) return Number(v)
  return v
}

function transform (input, o) {
  const d = o.delimiter === 'auto' ? detect(input) : o.delimiter
  const rows = parse(input, d)
  const cell = (v) => (o.infer ? infer(v) : v)
  if (!o.header) return JSON.stringify(rows.map((r) => r.map(cell)), null, 2)
  const [head, ...body] = rows
  const keys = head.map((h, i) => h.trim() || `column${i + 1}`)
  return JSON.stringify(body.map((r) => Object.fromEntries(keys.map((k, i) => [k, cell(r[i] ?? '')]))), null, 2)
}
</script>
