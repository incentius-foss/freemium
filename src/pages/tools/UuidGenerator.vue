<template>
  <ToolPage>
    <template #options>
      <Segmented v-model="kind" label="ID type" :options="[{ value: 'v4', label: 'UUID v4' }, { value: 'v7', label: 'UUID v7' }, { value: 'ulid', label: 'ULID' }]" />
      <label class="opt">
        <span class="opt__label">Count</span>
        <input v-model.number="count" class="field opt__field" type="number" min="1" max="1000" />
      </label>
      <Toggle v-model="upper" label="Uppercase" />
      <Toggle v-if="kind !== 'ulid'" v-model="noHyphens" label="No hyphens" />
      <button class="btn btn--prominent btn--sm" type="button" @click="generate">
        <AppIcon name="dice" :size="16" />Generate
      </button>
    </template>

    <div class="split">
      <CodePane :model-value="output" label="Generated" readonly :download="`${kind}.txt`" />

      <section class="card decode" aria-labelledby="decode-title">
        <h2 id="decode-title" class="decode__title">Decode</h2>
        <div class="decode__field">
          <label class="sr-only" for="decode-input">UUID or ULID to decode</label>
          <input
            id="decode-input"
            v-model="toDecode"
            class="field t-mono"
            type="text"
            placeholder="Paste a UUID or ULID"
            spellcheck="false"
            autocomplete="off"
          />
        </div>
        <p v-if="decoded.error" class="decode__error" role="status">
          <AppIcon name="warning" :size="16" /><span>{{ decoded.error }}</span>
        </p>
        <ul v-else-if="decoded.rows" class="inset-list decode__list" role="list">
          <li v-for="row in decoded.rows" :key="row[0]" class="row">
            <span class="row__label t-subhead">{{ row[0] }}</span>
            <span class="row__value">{{ row[1] }}</span>
          </li>
        </ul>
        <p v-else class="t-footnote t-secondary decode__hint">
          Shows the version, variant and, for v1, v6, v7 and ULID, the embedded timestamp.
        </p>
      </section>
    </div>
  </ToolPage>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import ToolPage from '@/components/ToolPage.vue'
import CodePane from '@/components/CodePane.vue'
import AppIcon from '@/components/AppIcon.vue'
import Segmented from '@/components/ui/Segmented.vue'
import Toggle from '@/components/ui/Toggle.vue'
import { takeHandoff } from '@/composables/useHandoff'
import { load, save } from '@/composables/storage'

const saved = load('freemium:opts:uuid', {})
const kind = ref(saved.kind || 'v4')
const count = ref(saved.count ?? 10)
const upper = ref(!!saved.upper)
const noHyphens = ref(!!saved.noHyphens)
const output = ref('')
const toDecode = ref('')

const hex = (bytes) => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
const format = (h) => `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`

function uuidV4 () {
  if (crypto.randomUUID) return crypto.randomUUID()
  const b = crypto.getRandomValues(new Uint8Array(16))
  b[6] = (b[6] & 0x0f) | 0x40
  b[8] = (b[8] & 0x3f) | 0x80
  return format(hex(b))
}

// RFC 9562 v7: 48-bit Unix ms, then random. Within one millisecond the 12-bit rand_a acts as a
// counter so IDs from a single batch stay strictly sorted.
let v7Last = 0
let v7Seq = 0
function uuidV7 () {
  let ms = Date.now()
  if (ms <= v7Last) {
    v7Seq++
    if (v7Seq > 0xfff) { v7Last++; v7Seq = 0 }
    ms = v7Last
  } else {
    v7Last = ms
    v7Seq = crypto.getRandomValues(new Uint16Array(1))[0] & 0x7ff // leave headroom for increments
  }
  const b = crypto.getRandomValues(new Uint8Array(16))
  for (let i = 0; i < 6; i++) b[i] = Math.floor(ms / 2 ** (8 * (5 - i))) & 0xff
  b[6] = 0x70 | (v7Seq >> 8)
  b[7] = v7Seq & 0xff
  b[8] = (b[8] & 0x3f) | 0x80
  return format(hex(b))
}

// ULID: 48-bit ms + 80 random bits in Crockford base32; monotonic within a millisecond.
const B32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
let ulidLast = 0
let ulidRand = null
function ulid () {
  let ms = Date.now()
  if (ms <= ulidLast && ulidRand) {
    ms = ulidLast
    let i = ulidRand.length - 1
    while (i >= 0 && ulidRand[i] === 31) { ulidRand[i] = 0; i-- }
    if (i < 0) throw new Error('ULID random component overflowed in one millisecond')
    ulidRand[i]++
  } else {
    ulidLast = ms
    ulidRand = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b & 31)
  }
  let time = ''
  let t = ms
  for (let i = 0; i < 10; i++) { time = B32[t % 32] + time; t = Math.floor(t / 32) }
  return time + ulidRand.map((d) => B32[d]).join('')
}

function generate () {
  const n = Math.min(Math.max(Number(count.value) || 1, 1), 1000)
  const make = { v4: uuidV4, v7: uuidV7, ulid }[kind.value]
  const ids = []
  for (let i = 0; i < n; i++) {
    let id = make()
    if (kind.value !== 'ulid') {
      if (noHyphens.value) id = id.replace(/-/g, '')
      id = upper.value ? id.toUpperCase() : id.toLowerCase()
    } else if (!upper.value) {
      id = id.toLowerCase()
    }
    ids.push(id)
  }
  output.value = ids.join('\n')
}

watch([kind, count, upper, noHyphens], () => {
  save('freemium:opts:uuid', { kind: kind.value, count: count.value, upper: upper.value, noHyphens: noHyphens.value })
  generate()
})

// ── Decoding ─────────────────────────────────────────────────────
const fmtDate = (ms) => {
  const d = new Date(ms)
  if (Number.isNaN(d.getTime())) return 'Out of range'
  return `${d.toISOString()} (${d.toLocaleString()})`
}

function decodeUuid (h) {
  const version = parseInt(h[12], 16)
  const v = parseInt(h[16], 16)
  const variant = v < 8 ? 'NCS (reserved)' : v < 12 ? 'RFC 9562 / 4122' : v < 14 ? 'Microsoft (reserved)' : 'Future (reserved)'
  const rows = [['Type', 'UUID'], ['Canonical', format(h)]]
  if (/^0{32}$/.test(h)) return [...rows, ['Version', 'Nil UUID']]
  if (/^f{32}$/.test(h)) return [...rows, ['Version', 'Max UUID']]
  const names = { 1: 'Time-based (MAC)', 2: 'DCE security', 3: 'Name-based (MD5)', 4: 'Random', 5: 'Name-based (SHA-1)', 6: 'Reordered time', 7: 'Unix time-ordered', 8: 'Custom' }
  rows.push(['Version', `${version} — ${names[version] || 'Unknown'}`], ['Variant', variant])
  if (version === 1 || version === 6) {
    const ts = version === 1
      ? (BigInt('0x' + h.slice(13, 16)) << 48n) | (BigInt('0x' + h.slice(8, 12)) << 32n) | BigInt('0x' + h.slice(0, 8))
      : (BigInt('0x' + h.slice(0, 12)) << 12n) | BigInt('0x' + h.slice(13, 16))
    const ms = Number(ts / 10000n) - 12219292800000 // Gregorian (1582-10-15) → Unix epoch
    rows.push(['Timestamp', fmtDate(ms)], ['Clock sequence', String(parseInt(h.slice(16, 20), 16) & 0x3fff)], ['Node', h.slice(20).match(/../g).join(':')])
  }
  if (version === 7) {
    const ms = parseInt(h.slice(0, 12), 16)
    rows.push(['Timestamp', fmtDate(ms)], ['Unix ms', String(ms)])
  }
  return rows
}

function decodeUlid (s) {
  const u = s.toUpperCase().replace(/[IL]/g, '1').replace(/O/g, '0')
  if (!/^[0-7][0-9A-HJKMNP-TV-Z]{25}$/.test(u)) return null
  let ms = 0
  for (const c of u.slice(0, 10)) ms = ms * 32 + B32.indexOf(c)
  return [['Type', 'ULID'], ['Canonical', u], ['Timestamp', fmtDate(ms)], ['Unix ms', String(ms)], ['Randomness', u.slice(10)]]
}

const decoded = computed(() => {
  const s = toDecode.value.trim().replace(/^urn:uuid:/i, '').replace(/^\{|\}$/g, '')
  if (!s) return {}
  const h = s.replace(/-/g, '').toLowerCase()
  if (/^[0-9a-f]{32}$/.test(h)) return { rows: decodeUuid(h) }
  const u = decodeUlid(s)
  if (u) return { rows: u }
  return { error: 'Not a valid UUID (32 hex digits) or ULID (26 Crockford base32 characters).' }
})

onMounted(() => {
  const h = takeHandoff()
  if (h != null) toDecode.value = h.trim()
  generate()
})
</script>

<style scoped>
.opt { display: inline-flex; align-items: center; gap: 8px; font-size: 0.8125rem; color: var(--label-2); }
.opt__field { width: 84px; min-height: 32px; border-radius: 999px; font-size: 0.8125rem; }
@media (pointer: coarse) { .opt__field { min-height: 44px; } }

.decode { padding: 8px 0 12px; align-self: start; overflow: hidden; }
.decode__title { padding: 6px 16px 10px; font-size: 0.9375rem; font-weight: 600; letter-spacing: -0.015em; }
.decode__field { padding: 0 12px 12px; }
.decode__field .field { font-size: 0.875rem; letter-spacing: 0; }
.decode__list { border-radius: 0; border-top: 0.5px solid var(--separator); }
.decode__list .row { align-items: flex-start; }
.decode__list .row__label { flex: none; min-width: 110px; }
.decode__list .row__value { flex: 1; }
.decode__hint { padding: 0 16px; }
.decode__error { display: flex; gap: 6px; margin: 0; padding: 0 16px; color: var(--danger-text); font-size: 0.8125rem; font-weight: 500; }
</style>
