<template>
  <ToolPage>
    <section class="card expr" aria-labelledby="cron-title">
      <h2 id="cron-title" class="sr-only">Cron expression</h2>
      <label class="label" for="cron-input">Expression (5 fields, or 6 with seconds first)</label>
      <input
        id="cron-input"
        v-model="expression"
        class="field expr__input t-mono"
        type="text"
        spellcheck="false"
        autocomplete="off"
        autocapitalize="off"
        :aria-invalid="!!error"
        aria-describedby="cron-desc"
      />
      <div v-if="fieldNames.length" class="expr__legend t-caption t-secondary" aria-hidden="true">
        <span v-for="(f, i) in fieldNames" :key="i">{{ f }}</span>
      </div>
      <p id="cron-desc" class="expr__desc" role="status">
        <span v-if="error" class="expr__err"><AppIcon name="warning" :size="16" />{{ error }}</span>
        <span v-else-if="description" class="t-title3">“{{ description }}”</span>
      </p>
      <div class="examples" role="group" aria-label="Examples">
        <button
          v-for="ex in examples"
          :key="ex.value"
          class="chip"
          type="button"
          :aria-pressed="expression.trim() === ex.value"
          :title="ex.value"
          @click="expression = ex.value"
        >
          {{ ex.label }}
        </button>
      </div>
    </section>

    <div v-if="!error && parsed" class="split">
      <section class="card block" aria-labelledby="fields-title">
        <h2 id="fields-title" class="t-headline block__title">Fields</h2>
        <ul class="inset-list nested" role="list">
          <li v-for="f in breakdown" :key="f.name" class="row field-row">
            <span class="row__label">
              <span class="t-subhead t-semibold">{{ f.name }}</span>
              <code class="t-caption t-secondary raw">{{ f.raw }}</code>
            </span>
            <span class="row__value">{{ f.values }}</span>
          </li>
        </ul>
      </section>

      <section class="card block" aria-labelledby="runs-title">
        <h2 id="runs-title" class="t-headline block__title">Next 10 runs <span class="t-footnote t-secondary">({{ zone }})</span></h2>
        <ol class="inset-list nested" role="list">
          <li v-for="(r, i) in runs" :key="i" class="row">
            <span class="badge" aria-hidden="true">{{ i + 1 }}</span>
            <span class="row__label t-subhead">{{ r.date }}</span>
            <span class="t-footnote t-secondary">{{ r.relative }}</span>
          </li>
        </ol>
      </section>
    </div>
  </ToolPage>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import * as cronNs from 'cron-parser'
import ToolPage from '@/components/ToolPage.vue'
import AppIcon from '@/components/AppIcon.vue'
import { takeHandoff } from '@/composables/useHandoff'
import { load, save } from '@/composables/storage'

const Parser = cronNs.CronExpressionParser || cronNs.default?.CronExpressionParser
const zone = Intl.DateTimeFormat().resolvedOptions().timeZone

const examples = [
  { label: 'Every minute', value: '* * * * *' },
  { label: 'Every 5 minutes', value: '*/5 * * * *' },
  { label: 'Hourly', value: '0 * * * *' },
  { label: 'Every 6 hours', value: '0 */6 * * *' },
  { label: 'Work hours', value: '*/15 9-17 * * 1-5' },
  { label: 'Daily at midnight', value: '0 0 * * *' },
  { label: 'Weekdays at 9:30', value: '30 9 * * MON-FRI' },
  { label: 'Sundays', value: '0 0 * * 0' },
  { label: 'First of month', value: '0 0 1 * *' },
  { label: 'Last day of month', value: '0 18 L * *' },
  { label: 'Second Monday', value: '0 10 * * 1#2' },
  { label: 'New Year', value: '0 0 1 1 *' },
  { label: 'Every 10 seconds', value: '*/10 * * * * *' },
]

const expression = ref(load('freemium:cron', '*/15 9-17 * * 1-5'))
watch(expression, (v) => save('freemium:cron', v))
onMounted(() => {
  const handed = takeHandoff()
  if (handed != null) expression.value = handed.trim()
})

const MACROS = {
  '@yearly': '0 0 1 1 *', '@annually': '0 0 1 1 *', '@monthly': '0 0 1 * *', '@weekly': '0 0 * * 0',
  '@daily': '0 0 * * *', '@midnight': '0 0 * * *', '@hourly': '0 * * * *',
}
const expanded = computed(() => {
  const e = expression.value.trim().replace(/\s+/g, ' ')
  return MACROS[e.toLowerCase()] || e
})
const parts = computed(() => expanded.value.split(' ').filter(Boolean))
const hasSeconds = computed(() => parts.value.length === 6)

const result = computed(() => {
  if (!expanded.value) return { error: 'Enter a cron expression.' }
  if (parts.value.length < 5 || parts.value.length > 6) return { error: `Expected 5 or 6 fields, found ${parts.value.length}.` }
  try {
    return { parsed: Parser.parse(expanded.value, { tz: zone }) }
  } catch (e) {
    return { error: e.message || String(e) }
  }
})
const error = computed(() => result.value.error || '')
const parsed = computed(() => result.value.parsed || null)

const fieldNames = computed(() => {
  if (parts.value.length < 5) return []
  return [...(hasSeconds.value ? ['second'] : []), 'minute', 'hour', 'day (month)', 'month', 'day (week)']
})

// ── Human-readable description ────────────────────────────────────
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MONTH_ABBR = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const DAY_ABBR = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const ordinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}
const listJoin = (items) => (items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`)

function toNum (token, kind) {
  const t = token.toUpperCase()
  if (kind === 'month' && MONTH_ABBR.includes(t)) return MONTH_ABBR.indexOf(t) + 1
  if (kind === 'dow' && DAY_ABBR.includes(t)) return DAY_ABBR.indexOf(t)
  return Number(token)
}
function label (token, kind) {
  const n = toNum(token, kind)
  if (kind === 'month') return MONTHS[n - 1] || token
  if (kind === 'dow') return DAYS[n] || token
  return String(n)
}

// Describes one field: returns { every: bool, text } where text reads after "every"/"at".
function describe (raw, unit, kind) {
  if (raw === '*' || raw === '?') return { every: true, text: `every ${unit}` }
  const items = raw.split(',').map((item) => {
    const [range, step] = item.split('/')
    if (range === '*' && step) return `every ${ordinal(Number(step))} ${unit}`
    if (range.includes('-')) {
      const [a, b] = range.split('-')
      const span = `${label(a, kind)} through ${label(b, kind)}`
      return step ? `every ${ordinal(Number(step))} ${unit} from ${span}` : span
    }
    if (step) return `every ${ordinal(Number(step))} ${unit} starting at ${label(range, kind)}`
    return label(range, kind)
  })
  return { every: items.every((i) => i.startsWith('every')), text: listJoin(items) }
}

function describeDow (raw) {
  if (raw === '*' || raw === '?') return ''
  const special = raw.split(',').map((item) => {
    let m = /^(\w+)#(\d)$/.exec(item)
    if (m) return `the ${ordinal(Number(m[2]))} ${label(m[1], 'dow')} of the month`
    m = /^(\w+)L$/i.exec(item)
    if (m) return `the last ${label(m[1], 'dow')} of the month`
    return null
  })
  if (special.every(Boolean)) return `on ${listJoin(special)}`
  const d = describe(raw, 'day-of-week', 'dow')
  return d.every ? d.text : `on ${d.text}`
}

function describeDom (raw) {
  if (raw === '*' || raw === '?') return ''
  if (raw.toUpperCase() === 'L') return 'on the last day of the month'
  const w = /^(\d+)W$/i.exec(raw)
  if (w) return `on the weekday nearest day ${w[1]} of the month`
  const d = describe(raw, 'day-of-month', 'dom')
  return d.every ? d.text : `on day-of-month ${d.text}`
}

const pad = (n) => String(n).padStart(2, '0')

const description = computed(() => {
  if (error.value) return ''
  const p = parts.value
  const [sec, min, hour, dom, month, dow] = hasSeconds.value ? p : [null, ...p]
  const out = []
  const simple = (v) => /^\d+$/.test(v)

  if (sec != null && sec !== '0') {
    const s = describe(sec, 'second', 'sec')
    out.push(s.every ? `At ${s.text}` : `At second ${s.text}`)
  }

  if (simple(min) && simple(hour)) {
    out.push(`${out.length ? 'at' : 'At'} ${pad(hour)}:${pad(min)}`)
  } else {
    const m = describe(min, 'minute', 'min')
    const lead = out.length ? '' : 'At '
    if (!(out.length && min === '*')) out.push(m.every ? `${lead}${m.text}` : `${lead}minute ${m.text}`)
    const h = describe(hour, 'hour', 'hour')
    if (hour !== '*') out.push(h.every ? `past ${h.text}` : `past hour ${h.text}`)
  }

  const domText = describeDom(dom)
  const dowText = describeDow(dow)
  if (domText && dowText) out.push(`${domText} and ${dowText}`)
  else if (domText || dowText) out.push(domText || dowText)

  if (month !== '*' && month !== '?') {
    const mo = describe(month, 'month', 'month')
    out.push(`in ${mo.text}`)
  }
  return `${out.join(' ')}.`
})

// ── Field breakdown and next runs ─────────────────────────────────
function summarize (values, kind) {
  const nums = values.filter((v) => typeof v === 'number')
  const named = (v) => (kind === 'month' ? MONTH_ABBR[v - 1] : kind === 'dow' ? DAY_ABBR[v % 7] : v)
  const list = nums.map(named)
  const extra = values.filter((v) => typeof v !== 'number')
  const shown = list.length > 14 ? `${list.slice(0, 12).join(', ')} … ${list[list.length - 1]}` : list.join(', ')
  const count = list.length > 14 ? ` (${list.length} values)` : ''
  return [shown + count, ...extra].filter(Boolean).join(', ')
}

const breakdown = computed(() => {
  if (!parsed.value) return []
  const f = parsed.value.fields
  const p = parts.value
  const off = hasSeconds.value ? 1 : 0
  const rows = [
    { name: 'Minute', raw: p[off], values: summarize(f.minute.values) },
    { name: 'Hour', raw: p[off + 1], values: summarize(f.hour.values) },
    { name: 'Day of month', raw: p[off + 2], values: p[off + 2].toUpperCase() === 'L' ? 'last day' : summarize(f.dayOfMonth.values) },
    { name: 'Month', raw: p[off + 3], values: summarize(f.month.values, 'month') },
    { name: 'Day of week', raw: p[off + 4], values: /[#L]/i.test(p[off + 4]) ? p[off + 4] : summarize([...new Set(f.dayOfWeek.values.map((v) => (v === 7 ? 0 : v)))].sort(), 'dow') },
  ]
  if (hasSeconds.value) rows.unshift({ name: 'Second', raw: p[0], values: summarize(f.second.values) })
  return rows
})

const runs = computed(() => {
  if (!parsed.value) return []
  const it = Parser.parse(expanded.value, { tz: zone })
  const fmt = new Intl.DateTimeFormat(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: hasSeconds.value ? '2-digit' : undefined })
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
  const out = []
  try {
    for (let i = 0; i < 10; i++) {
      const d = it.next().toDate()
      const diff = (d - Date.now()) / 1000
      const [unit, sec] = [['day', 86400], ['hour', 3600], ['minute', 60], ['second', 1]].find(([, s]) => Math.abs(diff) >= s) || ['second', 1]
      out.push({ date: fmt.format(d), relative: rtf.format(Math.round(diff / sec), unit) })
    }
  } catch { /* fewer than 10 future runs */ }
  return out
})
</script>

<style scoped>
.expr { padding: 16px; }
.expr__input { font-size: 1.375rem; min-height: 52px; letter-spacing: 0.04em; }
.expr__legend { display: flex; gap: 14px; flex-wrap: wrap; margin: 6px 4px 0; }
.expr__desc { margin: 14px 4px 0; min-height: 1.5em; }
.expr__err { display: inline-flex; align-items: center; gap: 6px; color: var(--danger-text); font-weight: 500; font-size: 0.9375rem; }
.examples { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; }
.chip {
  min-height: 30px; padding: 0 12px; border-radius: 999px; background: var(--fill-3);
  color: var(--label); font-size: 0.8125rem;
}
.chip:hover { background: var(--fill-2); }
.chip[aria-pressed="true"] { background: var(--tint); color: var(--on-tint); font-weight: 600; }
@media (pointer: coarse) { .chip { min-height: 44px; } }

.block { padding: 16px; min-width: 0; }
.block__title { margin-bottom: 10px; }
.nested { background: var(--bg-3); margin: 0; padding: 0; }
.nested > * + * { box-shadow: inset 0 0.5px 0 0 var(--separator); }
.row__label { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
.raw { font-family: var(--font-mono); }
.field-row .row__value { flex: 1.4; font-family: var(--font-sans); font-size: 0.8125rem; }
</style>
