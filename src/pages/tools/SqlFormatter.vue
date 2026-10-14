<template>
  <TransformTool
    :transform="transform"
    :options="options"
    :sample="sample"
    accept=".sql,text/plain"
    :download="(o) => (o.mode === 'minify' ? 'query.min.sql' : 'query.sql')"
  />
</template>

<script setup>
import { format } from 'sql-formatter'
import TransformTool from '@/components/TransformTool.vue'

const dialects = [
  ['sql', 'Standard SQL'], ['postgresql', 'PostgreSQL'], ['mysql', 'MySQL'], ['mariadb', 'MariaDB'],
  ['sqlite', 'SQLite'], ['transactsql', 'SQL Server (T-SQL)'], ['plsql', 'Oracle PL/SQL'], ['bigquery', 'BigQuery'],
  ['snowflake', 'Snowflake'], ['redshift', 'Redshift'], ['spark', 'Spark'], ['hive', 'Hive'], ['trino', 'Trino / Presto'],
  ['duckdb', 'DuckDB'], ['clickhouse', 'ClickHouse'], ['db2', 'Db2'], ['db2i', 'Db2 for IBM i'],
  ['singlestoredb', 'SingleStore'], ['tidb', 'TiDB'], ['n1ql', 'N1QL (Couchbase)'],
].map(([value, label]) => ({ value, label }))

const options = [
  { key: 'mode', type: 'segmented', label: 'Mode', default: 'format', options: [{ value: 'format', label: 'Format' }, { value: 'minify', label: 'Minify' }] },
  { key: 'language', type: 'select', label: 'Dialect', default: 'sql', options: dialects },
  { key: 'keywordCase', type: 'select', label: 'Keywords', default: 'upper', options: [{ value: 'upper', label: 'UPPERCASE' }, { value: 'lower', label: 'lowercase' }, { value: 'preserve', label: 'As written' }] },
  { key: 'indent', type: 'select', label: 'Indent', default: '2', options: [{ value: '2', label: '2 spaces' }, { value: '4', label: '4 spaces' }, { value: 'tab', label: 'Tabs' }] },
]

const sample = "select u.id, u.name, count(o.id) as orders from users u left join orders o on o.user_id = u.id where u.created_at > '2024-01-01' and u.active = true group by u.id, u.name having count(o.id) > 3 order by orders desc limit 20;"

function transform (input, o) {
  let out
  try {
    out = format(input, {
      language: o.language,
      keywordCase: o.keywordCase,
      tabWidth: o.indent === 'tab' ? 2 : Number(o.indent),
      useTabs: o.indent === 'tab',
    })
  } catch (e) {
    throw new Error(String(e.message || e).split('\n')[0])
  }
  if (o.mode === 'minify') {
    // Collapse whitespace outside string literals and quoted identifiers
    return out.split(/('(?:[^']|'')*'|"(?:[^"]|"")*"|`[^`]*`)/).map((part, i) => (i % 2 ? part : part.replace(/--[^\n]*/g, '').replace(/\s+/g, ' ').replace(/\(\s+/g, '(').replace(/\s+([),])/g, '$1').replace(/\s*;\s*/g, '; '))).join('').trim()
  }
  return out
}
</script>
