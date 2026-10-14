<template>
  <TransformTool
    :transform="transform"
    :options="options"
    :sample="sample"
    input-label="JSON"
    output-label="Types"
    accept=".json,application/json,text/plain"
    :download="(o) => `${(o.rootName || 'Root').trim() || 'Root'}.${ext[o.lang]}`"
  />
</template>

<script setup>
import TransformTool from '@/components/TransformTool.vue'

const options = [
  {
    key: 'lang', type: 'select', label: 'Language', default: 'typescript',
    options: [
      { value: 'typescript', label: 'TypeScript' },
      { value: 'swift', label: 'Swift (Codable)' },
      { value: 'go', label: 'Go (struct)' },
      { value: 'kotlin', label: 'Kotlin (kotlinx)' },
      { value: 'rust', label: 'Rust (serde)' },
    ],
  },
  { key: 'rootName', type: 'text', label: 'Root name', default: 'Root', placeholder: 'Root', width: '140px' },
]
const ext = { typescript: 'ts', swift: 'swift', go: 'go', kotlin: 'kt', rust: 'rs' }

const sample = () => JSON.stringify({
  id: 42, login: 'ada', 'display-name': 'Ada Lovelace', verified: true, rating: 4.8,
  profile: { bio: 'First programmer', website: null },
  repos: [
    { name: 'engine', stars: 1200, topics: ['math', 'history'] },
    { name: 'notes', stars: 87, topics: [], archived: true },
  ],
}, null, 2)

function transform (input, o) {
  let data
  try { data = JSON.parse(input) } catch (e) { throw new Error(e.message) }
  if (data === null || typeof data !== 'object') throw new Error('Expected a JSON object or array to describe.')
  return jsonToCode(data, o.lang, o.rootName || 'Root')
}

// ── Infer a type tree from JSON, merging array items so optional keys are detected ──
function infer (v) {
  if (v === null) return { kind: 'null' }
  if (Array.isArray(v)) return { kind: 'array', of: v.length ? v.map(infer).reduce(merge) : { kind: 'any' } }
  if (typeof v === 'object') {
    const fields = new Map()
    for (const [k, x] of Object.entries(v)) fields.set(k, { type: infer(x), optional: false })
    return { kind: 'object', fields }
  }
  if (typeof v === 'number') return { kind: Number.isInteger(v) ? 'int' : 'float' }
  if (typeof v === 'boolean') return { kind: 'bool' }
  return { kind: 'string' }
}

function merge (a, b) {
  if (a.kind === 'null' && b.kind === 'null') return a
  if (a.kind === 'null') return { ...b, nullable: true }
  if (b.kind === 'null') return { ...a, nullable: true }
  const nullable = a.nullable || b.nullable
  if (a.kind === b.kind) {
    if (a.kind === 'array') return { kind: 'array', of: merge(a.of, b.of), nullable }
    if (a.kind === 'object') {
      const fields = new Map()
      for (const [k, f] of a.fields) {
        const g = b.fields.get(k)
        fields.set(k, g ? { type: merge(f.type, g.type), optional: f.optional || g.optional } : { ...f, optional: true })
      }
      for (const [k, g] of b.fields) if (!a.fields.has(k)) fields.set(k, { ...g, optional: true })
      return { kind: 'object', fields, nullable }
    }
    return { ...a, nullable }
  }
  if ((a.kind === 'int' && b.kind === 'float') || (a.kind === 'float' && b.kind === 'int')) return { kind: 'float', nullable }
  if (a.kind === 'any') return a
  return { kind: 'any', nullable }
}

const pascal = (s) => (s.replace(/[^A-Za-z0-9]+(.)?/g, (_, c) => (c ? c.toUpperCase() : '')).replace(/^./, (c) => c.toUpperCase()).replace(/^(\d)/, '_$1')) || 'Field'
const camel = (s) => { const p = pascal(s); return p[0].toLowerCase() + p.slice(1) }
const snake = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '').toLowerCase().replace(/^(\d)/, '_$1') || 'field'
const singular = (s) => (/ies$/i.test(s) ? s.replace(/ies$/i, 'y') : /(ss|us)$/i.test(s) ? s : s.replace(/s$/i, ''))

// Assign names to every object type (depth-first, deduplicated).
function collect (root, rootName) {
  const structs = []
  const used = new Set()
  const unique = (n) => { let x = n; let i = 2; while (used.has(x)) x = `${n}${i++}`; used.add(x); return x }
  const visit = (t, name) => {
    if (t.kind === 'array') return visit(t.of, singular(name))
    if (t.kind !== 'object') return
    t.name = unique(pascal(name))
    structs.push(t)
    for (const [k, f] of t.fields) visit(f.type, k)
  }
  visit(root, rootName)
  return structs
}

const langs = {
  typescript: {
    type (t) {
      const base = { string: 'string', int: 'number', float: 'number', bool: 'boolean', null: 'null', any: 'unknown', object: t.name, array: t.of && `${wrapTs(this.type(t.of))}[]` }[t.kind]
      return t.nullable ? `${base} | null` : base
    },
    struct (s) {
      const body = [...s.fields].map(([k, f]) => `  ${/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)}${f.optional ? '?' : ''}: ${this.type(f.type)};`)
      return `export interface ${s.name} {\n${body.join('\n')}\n}`
    },
    root (t, name) { return t.kind === 'object' ? '' : `export type ${pascal(name)} = ${this.type(t)};` },
  },
  swift: {
    type (t) {
      const base = { string: 'String', int: 'Int', float: 'Double', bool: 'Bool', null: 'String?', any: 'AnyCodable', object: t.name, array: t.of && `[${this.type(t.of)}]` }[t.kind]
      return t.nullable && t.kind !== 'null' ? `${base}?` : base
    },
    struct (s) {
      const props = []; const keys = []; let needKeys = false
      for (const [k, f] of s.fields) {
        const name = camel(k)
        let ty = this.type(f.type)
        if (f.optional && !ty.endsWith('?')) ty += '?'
        props.push(`    let ${name}: ${ty}`)
        keys.push(name === k ? `        case ${name}` : `        case ${name} = ${JSON.stringify(k)}`)
        if (name !== k) needKeys = true
      }
      return `struct ${s.name}: Codable {\n${props.join('\n')}${needKeys ? `\n\n    enum CodingKeys: String, CodingKey {\n${keys.join('\n')}\n    }` : ''}\n}`
    },
    root (t, name) { return t.kind === 'object' ? '' : `typealias ${pascal(name)} = ${this.type(t)}` },
  },
  go: {
    type (t) {
      const base = { string: 'string', int: 'int64', float: 'float64', bool: 'bool', null: 'interface{}', any: 'interface{}', object: t.name, array: t.of && `[]${this.type(t.of)}` }[t.kind]
      return (t.nullable || t.optional) && ['string', 'int', 'float', 'bool', 'object'].includes(t.kind) ? `*${base}` : base
    },
    struct (s) {
      const rows = [...s.fields].map(([k, f]) => [pascal(k), this.type(f.optional ? { ...f.type, optional: true } : f.type), `\`json:"${k}${f.optional ? ',omitempty' : ''}"\``])
      const w0 = Math.max(...rows.map((r) => r[0].length), 0); const w1 = Math.max(...rows.map((r) => r[1].length), 0)
      return `type ${s.name} struct {\n${rows.map(([a, b, c]) => `\t${a.padEnd(w0)} ${b.padEnd(w1)} ${c}`).join('\n')}\n}`
    },
    root (t, name) { return t.kind === 'object' ? '' : `type ${pascal(name)} ${this.type(t)}` },
  },
  kotlin: {
    type (t) {
      const base = { string: 'String', int: 'Long', float: 'Double', bool: 'Boolean', null: 'String', any: 'JsonElement', object: t.name, array: t.of && `List<${this.type(t.of)}>` }[t.kind]
      return t.nullable || t.kind === 'null' ? `${base}?` : base
    },
    struct (s) {
      const props = [...s.fields].map(([k, f]) => {
        const name = camel(k)
        let ty = this.type(f.type)
        if (f.optional && !ty.endsWith('?')) ty += '?'
        return `    ${name === k ? '' : `@SerialName(${JSON.stringify(k)}) `}val ${name}: ${ty}${ty.endsWith('?') ? ' = null' : ''},`
      })
      return `@Serializable\ndata class ${s.name}(\n${props.join('\n')}\n)`
    },
    root (t, name) { return t.kind === 'object' ? '' : `typealias ${pascal(name)} = ${this.type(t)}` },
  },
  rust: {
    type (t) {
      const base = { string: 'String', int: 'i64', float: 'f64', bool: 'bool', null: 'serde_json::Value', any: 'serde_json::Value', object: t.name, array: t.of && `Vec<${this.type(t.of)}>` }[t.kind]
      return t.nullable && t.kind !== 'null' && t.kind !== 'any' ? `Option<${base}>` : base
    },
    struct (s) {
      const props = [...s.fields].map(([k, f]) => {
        const name = snake(k)
        let ty = this.type(f.type)
        if (f.optional && !ty.startsWith('Option<')) ty = `Option<${ty}>`
        const attrs = []
        if (name !== k) attrs.push(`rename = ${JSON.stringify(k)}`)
        if (f.optional) attrs.push('default, skip_serializing_if = "Option::is_none"')
        return `${attrs.length ? `    #[serde(${attrs.join(', ')})]\n` : ''}    pub ${name}: ${ty},`
      })
      return `#[derive(Debug, Clone, Serialize, Deserialize)]\npub struct ${s.name} {\n${props.join('\n')}\n}`
    },
    root (t, name) { return t.kind === 'object' ? '' : `pub type ${pascal(name)} = ${this.type(t)};` },
  },
}
const wrapTs = (s) => (/[|]/.test(s) ? `(${s})` : s)
const headers = {
  typescript: '',
  swift: 'import Foundation\n\n',
  go: 'package main\n\n',
  kotlin: 'import kotlinx.serialization.SerialName\nimport kotlinx.serialization.Serializable\nimport kotlinx.serialization.json.JsonElement\n\n',
  rust: 'use serde::{Deserialize, Serialize};\n\n',
}

function jsonToCode (json, lang, rootName = 'Root') {
  const tree = infer(json)
  const name = rootName.trim() || 'Root'
  const structs = collect(tree, name)
  const L = langs[lang]
  const parts = []
  // A root array's element takes the root name, so the alias becomes e.g. ItemList.
  const root = L.root(tree, tree.kind === 'array' ? `${pascal(name)}List` : name)
  if (root) parts.push(root)
  parts.push(...structs.map((s) => L.struct(s)))
  let out = headers[lang] + parts.join('\n\n') + '\n'
  if (lang === 'swift' && out.includes('AnyCodable')) out += '\n// AnyCodable: mixed-type values. Replace with a concrete type or add an AnyCodable package.\n'
  return out
}
</script>
