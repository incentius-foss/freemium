<template>
  <ToolPage>
    <section class="card entry" aria-labelledby="nb-input">
      <label id="nb-input" for="nb-value" class="label">Number</label>
      <div class="entry__row">
        <input
          id="nb-value"
          v-model="value"
          class="field entry__value t-mono"
          type="text"
          inputmode="text"
          spellcheck="false"
          autocomplete="off"
          placeholder="e.g. 255, 0xff, 0b1010"
          :aria-invalid="!!error"
          :aria-describedby="error ? 'nb-error' : undefined"
        />
        <label class="entry__base">
          <span class="sr-only">Input base</span>
          <select v-model.number="base" class="field">
            <option v-for="b in bases" :key="b" :value="b">{{ baseName(b) }}</option>
          </select>
        </label>
      </div>
      <p v-if="error" id="nb-error" class="entry__error" role="status"><AppIcon name="warning" :size="16" />{{ error }}</p>
      <p v-else class="t-caption t-secondary entry__hint">Prefixes 0x, 0b and 0o set the base automatically. Underscores and spaces are ignored. Any size works.</p>
    </section>

    <ul class="inset-list results" role="list" aria-label="Conversions">
      <li v-for="r in rows" :key="r.base" class="row">
        <span class="row__label">
          <span class="t-subhead t-semibold">{{ r.label }}</span>
          <span class="t-caption t-secondary"> base {{ r.base }}</span>
        </span>
        <code class="row__value">{{ r.text || '—' }}</code>
        <button class="icon-btn icon-btn--sm" type="button" :disabled="!r.text" :aria-label="`Copy ${r.label}`" title="Copy" @click="copyText(r.text)">
          <AppIcon name="copy" :size="16" />
        </button>
      </li>
    </ul>

    <section v-if="bits" class="card bits" aria-label="Bit details">
      <p class="t-footnote t-secondary">{{ bits }}</p>
    </section>
  </ToolPage>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import ToolPage from '@/components/ToolPage.vue'
import AppIcon from '@/components/AppIcon.vue'
import { copyText } from '@/composables/clipboard'
import { takeHandoff } from '@/composables/useHandoff'

const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz'
const bases = Array.from({ length: 35 }, (_, i) => i + 2)
const value = ref('255')
const base = ref(10)

const named = { 2: 'Binary', 8: 'Octal', 10: 'Decimal', 16: 'Hexadecimal', 32: 'Base32', 36: 'Base36' }
const baseName = (b) => (named[b] ? `${named[b]} (${b})` : `Base ${b}`)

onMounted(() => {
  const h = takeHandoff()
  if (h != null) value.value = h.trim()
})

function parseBig (text, b) {
  let s = text.trim().replace(/[_\s]/g, '').toLowerCase()
  let neg = false
  if (s.startsWith('-')) { neg = true; s = s.slice(1) }
  const prefix = /^0([xbo])/.exec(s)
  if (prefix) { b = { x: 16, b: 2, o: 8 }[prefix[1]]; s = s.slice(2) }
  if (!s) throw new Error('Enter a number.')
  let n = 0n
  const B = BigInt(b)
  for (const ch of s) {
    const d = DIGITS.indexOf(ch)
    if (d < 0 || d >= b) throw new Error(`“${ch}” isn’t a valid digit in base ${b}.`)
    n = n * B + BigInt(d)
  }
  return { n: neg ? -n : n, base: b }
}

const parsed = computed(() => {
  if (!value.value.trim()) return { n: null, error: '' }
  try { return { ...parseBig(value.value, base.value), error: '' } } catch (e) { return { n: null, error: e.message } }
})
const error = computed(() => parsed.value.error)

const rows = computed(() => [2, 8, 10, 16, 32, 36].map((b) => {
  const n = parsed.value.n
  let text = n == null ? '' : n.toString(b)
  if (n != null && b === 16) text = text.toUpperCase()
  return { base: b, label: named[b], text: n != null && b !== 10 ? group(text, b) : text }
}))

function group (text, b) {
  const neg = text.startsWith('-')
  const digits = neg ? text.slice(1) : text
  const size = b === 2 ? 4 : b === 16 ? 2 : 0
  if (!size || digits.length <= size) return text
  const padded = digits.padStart(Math.ceil(digits.length / size) * size, '0')
  return (neg ? '-' : '') + padded.match(new RegExp(`.{${size}}`, 'g')).join(' ')
}

const bits = computed(() => {
  const n = parsed.value.n
  if (n == null) return ''
  const abs = n < 0n ? -n : n
  const len = abs === 0n ? 1 : abs.toString(2).length
  const bytes = Math.ceil(len / 8)
  const fits = [8, 16, 32, 64].find((w) => (n < 0n ? len < w : len <= w))
  return `${len} bits · ${bytes} ${bytes === 1 ? 'byte' : 'bytes'}${fits ? ` · fits in ${n < 0n ? 'int' : 'uint'}${fits}` : ' · larger than 64 bits'}`
})
</script>

<style scoped>
.entry { padding: 14px 16px; }
.entry__row { display: flex; gap: 10px; flex-wrap: wrap; }
.entry__value { flex: 1 1 260px; font-size: 1.0625rem; min-height: 44px; }
.entry__base select { min-height: 44px; width: auto; }
.entry__hint, .entry__error { margin-top: 8px; }
.entry__error { display: flex; gap: 6px; align-items: flex-start; color: var(--danger-text); font-size: 0.8125rem; font-weight: 500; }
.results .row { gap: 8px; }
.results .row__label { flex: 0 0 auto; min-width: 140px; }
.results .row__value { flex: 1; user-select: all; }
.bits { padding: 12px 16px; }
</style>
