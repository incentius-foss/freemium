<template>
  <ToolPage>
    <template #options>
      <label class="opt">
        <span class="opt__label">Time zone</span>
        <select v-model="zone" class="field opt__control" aria-label="Time zone">
          <option v-for="z in zones" :key="z" :value="z">{{ z }}</option>
        </select>
      </label>
    </template>

    <section class="now card" aria-labelledby="now-title">
      <div class="now__text">
        <h2 id="now-title" class="t-footnote t-secondary">Current Unix time</h2>
        <p class="now__value t-mono">{{ Math.floor(now / 1000) }}</p>
        <p class="t-footnote t-secondary t-mono">{{ now }} ms</p>
      </div>
      <div class="now__actions">
        <button class="btn btn--sm" type="button" :aria-pressed="paused" @click="paused = !paused">
          <AppIcon :name="paused ? 'play' : 'clock'" :size="16" />{{ paused ? 'Resume' : 'Pause' }}
        </button>
        <button class="btn btn--sm" type="button" @click="copyText(String(Math.floor(now / 1000)))">
          <AppIcon name="copy" :size="16" />Copy
        </button>
        <button class="btn btn--sm btn--prominent" type="button" @click="input = String(Math.floor(now / 1000))">
          Use Now
        </button>
      </div>
    </section>

    <section class="card input-card">
      <label class="label" for="ts-input">Timestamp or date</label>
      <input
        id="ts-input"
        v-model="input"
        class="field t-mono"
        type="text"
        placeholder="1760000000, 1760000000000, or 2026-10-14T10:00:00Z"
        spellcheck="false"
        autocomplete="off"
        aria-describedby="ts-hint"
      />
      <p id="ts-hint" class="hint t-footnote" :class="error ? 'hint--err' : 't-secondary'" role="status">
        <template v-if="error"><AppIcon name="warning" :size="14" />{{ error }}</template>
        <template v-else-if="detected">Detected: {{ detected }}</template>
        <template v-else>Seconds, milliseconds, microseconds and nanoseconds are detected by length.</template>
      </p>
    </section>

    <ul v-if="rows.length" class="inset-list" role="list" aria-label="Converted values">
      <li v-for="r in rows" :key="r.label" class="row">
        <span class="row__label t-subhead">{{ r.label }}</span>
        <span class="row__value">{{ r.value }}</span>
        <button class="icon-btn icon-btn--sm" type="button" :aria-label="`Copy ${r.label}`" title="Copy" @click="copyText(r.value)">
          <AppIcon name="copy" :size="16" />
        </button>
      </li>
    </ul>
  </ToolPage>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import ToolPage from '@/components/ToolPage.vue'
import AppIcon from '@/components/AppIcon.vue'
import { copyText } from '@/composables/clipboard'
import { takeHandoff } from '@/composables/useHandoff'
import { load, save } from '@/composables/storage'

const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone
const zones = (() => {
  let list = []
  try { list = Intl.supportedValuesOf('timeZone') } catch { list = [] }
  return Array.from(new Set([localZone, 'UTC', ...list]))
})()

const zone = ref(load('freemium:unix:zone', localZone))
watch(zone, (v) => save('freemium:unix:zone', v))

const now = ref(Date.now())
const paused = ref(false)
const input = ref(String(Math.floor(Date.now() / 1000)))
let timer = null

onMounted(() => {
  const handed = takeHandoff()
  if (handed != null) input.value = handed.trim()
  timer = setInterval(() => { if (!paused.value) now.value = Date.now() }, 1000)
})
onBeforeUnmount(() => clearInterval(timer))

const parsed = computed(() => {
  const s = input.value.trim()
  if (!s) return { date: null }
  if (/^-?\d+(\.\d+)?$/.test(s)) {
    const digits = s.replace(/^-/, '').split('.')[0].length
    const n = Number(s)
    if (digits <= 11) return { date: new Date(n * 1000), unit: 'seconds' }
    if (digits <= 14) return { date: new Date(n), unit: 'milliseconds' }
    if (digits <= 17) return { date: new Date(n / 1000), unit: 'microseconds' }
    return { date: new Date(n / 1e6), unit: 'nanoseconds' }
  }
  const t = Date.parse(s)
  if (Number.isNaN(t)) return { error: 'Couldn’t read that as a timestamp or date.' }
  return { date: new Date(t), unit: 'date string' }
})

const error = computed(() => parsed.value.error || (parsed.value.date && Number.isNaN(parsed.value.date.getTime()) ? 'That date is out of range.' : ''))
const detected = computed(() => parsed.value.unit || '')

function zonedParts (d, tz) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(d)
  const get = (t) => Number(parts.find((p) => p.type === t).value)
  return { y: get('year'), m: get('month'), d: get('day') }
}

function dayOfYear ({ y, m, d }) {
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / 86400000) + 1
}

function isoWeek ({ y, m, d }) {
  const date = new Date(Date.UTC(y, m - 1, d))
  const day = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - day)
  const yearStart = Date.UTC(date.getUTCFullYear(), 0, 1)
  return Math.ceil(((date - yearStart) / 86400000 + 1) / 7)
}

function relative (d) {
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
  const diff = (d.getTime() - now.value) / 1000
  const units = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60], ['second', 1]]
  for (const [unit, sec] of units) {
    if (Math.abs(diff) >= sec || unit === 'second') return rtf.format(Math.round(diff / sec), unit)
  }
  return ''
}

function rfc2822 (d) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const p = (n) => String(n).padStart(2, '0')
  return `${days[d.getUTCDay()]}, ${p(d.getUTCDate())} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())} +0000`
}

const rows = computed(() => {
  const d = parsed.value.date
  if (!d || error.value) return []
  const zp = zonedParts(d, zone.value)
  const full = new Intl.DateTimeFormat(undefined, { timeZone: zone.value, dateStyle: 'full', timeStyle: 'long' }).format(d)
  return [
    { label: zone.value === localZone ? 'Local' : zone.value, value: full },
    { label: 'UTC', value: d.toUTCString() },
    { label: 'ISO 8601', value: d.toISOString() },
    { label: 'RFC 2822', value: rfc2822(d) },
    { label: 'Relative', value: relative(d) },
    { label: 'Unix seconds', value: String(Math.floor(d.getTime() / 1000)) },
    { label: 'Unix milliseconds', value: String(d.getTime()) },
    { label: 'Day of year', value: String(dayOfYear(zp)) },
    { label: 'ISO week', value: String(isoWeek(zp)) },
  ]
})
</script>

<style scoped>
.opt { display: inline-flex; align-items: center; gap: 8px; font-size: 0.8125rem; color: var(--label-2); }
.opt__control { min-height: 32px; width: auto; max-width: 260px; font-size: 0.8125rem; border-radius: 999px; }
@media (pointer: coarse) { .opt__control { min-height: 44px; } }

.now { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px 16px; padding: 16px 18px; }
.now__value { font-size: 2.125rem; font-weight: 600; line-height: 1.2; letter-spacing: 0; font-variant-numeric: tabular-nums; }
.now__actions { display: flex; flex-wrap: wrap; gap: 8px; }

.input-card { padding: 14px 16px; }
.input-card .field { font-size: 1rem; }
.hint { display: flex; align-items: center; gap: 6px; margin-top: 8px; }
.hint--err { color: var(--danger-text); }
.row__value { flex: 2; }
@media (max-width: 560px) {
  .row { flex-wrap: wrap; }
  .row__label { flex-basis: 100%; }
  .row__value { text-align: left; }
}
</style>
