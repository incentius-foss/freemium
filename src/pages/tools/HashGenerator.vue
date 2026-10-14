<template>
  <ToolPage>
    <template #options>
      <Segmented v-model="format" label="Output encoding" :options="[{ value: 'hex', label: 'Hex' }, { value: 'base64', label: 'Base64' }]" />
      <Toggle v-model="upper" label="Uppercase" />
      <label class="opt">
        <span class="opt__label">HMAC key</span>
        <input v-model="hmacKey" class="field opt__field" type="text" placeholder="Optional" spellcheck="false" autocomplete="off" />
      </label>
    </template>

    <div class="split">
      <CodePane
        v-model="input"
        label="Input"
        placeholder="Type or paste text, or drop any file…"
        sample="The quick brown fox jumps over the lazy dog"
        accept="*/*"
        @file="onFile"
        @update:model-value="file = null"
      >
        <template v-if="file" #default>
          <div class="file">
            <AppIcon name="docText" :size="32" />
            <div class="file__text">
              <p class="t-headline">{{ file.name }}</p>
              <p class="t-footnote t-secondary">{{ formatBytes(file.size) }} · hashing the file's raw bytes</p>
            </div>
            <button class="btn btn--sm" type="button" @click="file = null">Use Text Instead</button>
          </div>
        </template>
      </CodePane>

      <section class="results card" aria-labelledby="hash-results">
        <header class="results__bar">
          <h2 id="hash-results" class="results__title">{{ hmacKey ? 'HMAC Digests' : 'Digests' }}</h2>
          <span v-if="busy" class="t-caption t-secondary" role="status">Hashing…</span>
        </header>
        <label class="compare">
          <span class="sr-only">Compare with an expected hash</span>
          <AppIcon name="checkCircle" :size="16" />
          <input v-model="expected" class="field" type="text" placeholder="Paste an expected hash to compare" spellcheck="false" autocomplete="off" />
        </label>
        <ul class="inset-list results__list" role="list">
          <li v-for="row in rows" :key="row.name" class="row">
            <span class="row__label">
              <span class="t-subhead t-semibold">{{ row.name }}</span>
              <span v-if="isMatch(row.value)" class="badge badge--ok"><AppIcon name="check" :size="12" />Match</span>
              <span class="hash t-mono" :class="{ 'hash--empty': !row.value }">{{ row.value || '—' }}</span>
            </span>
            <button class="icon-btn icon-btn--sm" type="button" :disabled="!row.value" :aria-label="`Copy ${row.name}`" title="Copy" @click="copyText(row.value, `${row.name} copied`)">
              <AppIcon name="copy" :size="16" />
            </button>
          </li>
        </ul>
        <p v-if="expected.trim() && !rows.some((r) => isMatch(r.value))" class="nomatch t-footnote" role="status">
          <AppIcon name="xmark" :size="14" /> No digest matches the expected hash.
        </p>
      </section>
    </div>
  </ToolPage>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import CryptoJS from 'crypto-js'
import ToolPage from '@/components/ToolPage.vue'
import CodePane from '@/components/CodePane.vue'
import AppIcon from '@/components/AppIcon.vue'
import Segmented from '@/components/ui/Segmented.vue'
import Toggle from '@/components/ui/Toggle.vue'
import { copyText } from '@/composables/clipboard'
import { takeHandoff } from '@/composables/useHandoff'
import { load, save } from '@/composables/storage'

const input = ref('')
const file = ref(null) // { name, size, bytes }
const hmacKey = ref('')
const expected = ref('')
const prefs = load('freemium:opts:hash-generator', {})
const format = ref(prefs.format || 'hex')
const upper = ref(!!prefs.upper)
const rows = ref([])
const busy = ref(false)

watch([format, upper], () => save('freemium:opts:hash-generator', { format: format.value, upper: upper.value }))

// ── SHA-3 (FIPS 202) ─────────────────────────────────────────────
// crypto-js's "SHA3" is pre-standard Keccak (different padding), so SHA-3 is implemented here
// and crypto-js's version is offered under its real name, Keccak-256.
// FIPS 202 SHA-3 using 32-bit lane halves (fast, no BigInt).
const RC = [1,0,32898,0,32906,2147483648,2147516416,2147483648,32907,0,2147483649,0,2147516545,2147483648,32777,2147483648,138,0,136,0,2147516425,0,2147483658,0,2147516555,0,139,2147483648,32905,2147483648,32771,2147483648,32770,2147483648,128,2147483648,32778,0,2147483658,2147483648,2147516545,2147483648,32896,2147483648,2147483649,0,2147516424,2147483648]
function keccakF (s) {
  const c = new Uint32Array(10)
  for (let r = 0; r < 48; r += 2) {
    for (let x = 0; x < 10; x++) c[x] = s[x] ^ s[x + 10] ^ s[x + 20] ^ s[x + 30] ^ s[x + 40]
    for (let x = 0; x < 10; x += 2) {
      const x1 = (x + 2) % 10, x4 = (x + 8) % 10
      const hi = c[x1 + 1], lo = c[x1]
      const dl = c[x4] ^ ((lo << 1) | (hi >>> 31)), dh = c[x4 + 1] ^ ((hi << 1) | (lo >>> 31))
      for (let y = 0; y < 50; y += 10) { s[x + y] ^= dl; s[x + y + 1] ^= dh }
    }
    // rho + pi
    let curL = s[2], curH = s[3]
    for (let t = 0; t < 24; t++) {
      const sh = ROT[t], pi = PI[t]
      const tl = s[2 * pi], th = s[2 * pi + 1]
      let nl, nh
      if (sh < 32) { nl = (curL << sh) | (curH >>> (32 - sh)); nh = (curH << sh) | (curL >>> (32 - sh)) } else { nl = (curH << (sh - 32)) | (curL >>> (64 - sh)); nh = (curL << (sh - 32)) | (curH >>> (64 - sh)) }
      s[2 * pi] = nl; s[2 * pi + 1] = nh; curL = tl; curH = th
    }
    // chi
    for (let y = 0; y < 50; y += 10) {
      for (let x = 0; x < 10; x++) c[x] = s[y + x]
      for (let x = 0; x < 10; x++) s[y + x] ^= ~c[(x + 2) % 10] & c[(x + 4) % 10]
    }
    s[0] ^= RC[r]; s[1] ^= RC[r + 1]
  }
}
const ROT = [1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 2, 14, 27, 41, 56, 8, 25, 43, 62, 18, 39, 61, 20, 44]
const PI = [10, 7, 11, 17, 18, 3, 5, 16, 8, 21, 24, 4, 15, 23, 19, 13, 12, 2, 20, 14, 22, 9, 6, 1]
function sha3 (bytes, bits, pad = 0x06) {
  const rate = 200 - 2 * (bits / 8)
  const s = new Uint32Array(50)
  const len = bytes.length
  const blocks = Math.floor(len / rate) + 1
  const buf = new Uint8Array(blocks * rate)
  buf.set(bytes); buf[len] ^= pad; buf[buf.length - 1] ^= 0x80
  const view = new DataView(buf.buffer)
  for (let b = 0; b < blocks; b++) {
    for (let i = 0; i < rate / 4; i++) s[i] ^= view.getUint32(b * rate + i * 4, true)
    keccakF(s)
  }
  const out = new Uint8Array(bits / 8)
  const sv = new DataView(s.buffer)
  for (let i = 0; i < out.length; i++) out[i] = sv.getUint8(i) // little-endian host assumed
  return out
}

function hmacBytes (hash, blockSize, key, msg) {
  let k = new TextEncoder().encode(key)
  if (k.length > blockSize) k = hash(k)
  const ipad = new Uint8Array(blockSize + msg.length)
  const opad = new Uint8Array(blockSize + blockSize) // inner digest appended below
  for (let i = 0; i < blockSize; i++) { ipad[i] = (k[i] || 0) ^ 0x36; opad[i] = (k[i] || 0) ^ 0x5c }
  ipad.set(msg, blockSize)
  const inner = hash(ipad)
  const outer = new Uint8Array(blockSize + inner.length)
  outer.set(opad.subarray(0, blockSize)); outer.set(inner, blockSize)
  return hash(outer)
}

const toWordArray = (bytes) => CryptoJS.lib.WordArray.create(bytes)
const bytesToHex = (b) => Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('')
const bytesToB64 = (b) => btoa(Array.from(b, (x) => String.fromCharCode(x)).join(''))

const CJS = [
  ['MD5', 'MD5', 'HmacMD5'],
  ['SHA-1', 'SHA1', 'HmacSHA1'],
  ['SHA-224', 'SHA224', 'HmacSHA224'],
  ['SHA-256', 'SHA256', 'HmacSHA256'],
  ['SHA-384', 'SHA384', 'HmacSHA384'],
  ['SHA-512', 'SHA512', 'HmacSHA512'],
]
const SPONGE = [
  ['SHA3-256', (b) => sha3(b, 256), 136],
  ['SHA3-512', (b) => sha3(b, 512), 72],
  ['Keccak-256', (b) => sha3(b, 256, 0x01), 136],
]

function compute (bytes) {
  const key = hmacKey.value
  const enc = (s) => (upper.value && format.value === 'hex' ? s.toUpperCase() : s)
  const out = []
  const wa = toWordArray(bytes)
  for (const [name, fn, hmac] of CJS) {
    const d = key ? CryptoJS[hmac](wa, key) : CryptoJS[fn](wa)
    out.push({ name, value: enc(d.toString(format.value === 'hex' ? CryptoJS.enc.Hex : CryptoJS.enc.Base64)) })
  }
  for (const [name, fn, block] of SPONGE) {
    const d = key ? hmacBytes(fn, block, key, bytes) : fn(bytes)
    out.push({ name, value: enc(format.value === 'hex' ? bytesToHex(d) : bytesToB64(d)) })
  }
  const r = key ? CryptoJS.HmacRIPEMD160(wa, key) : CryptoJS.RIPEMD160(wa)
  out.push({ name: 'RIPEMD-160', value: enc(r.toString(format.value === 'hex' ? CryptoJS.enc.Hex : CryptoJS.enc.Base64)) })
  return out
}

let timer = null
function schedule () {
  clearTimeout(timer)
  const empty = !file.value && !input.value
  if (empty) { rows.value = [...CJS.map(([n]) => n), ...SPONGE.map(([n]) => n), 'RIPEMD-160'].map((name) => ({ name, value: '' })); return }
  busy.value = true
  timer = setTimeout(() => {
    const bytes = file.value ? file.value.bytes : new TextEncoder().encode(input.value)
    rows.value = compute(bytes)
    busy.value = false
  }, file.value && file.value.size > 1e6 ? 30 : 80)
}
watch([input, file, hmacKey, format, upper], schedule)

async function onFile (f) {
  if (f.size > 200 * 1024 * 1024) return
  const bytes = new Uint8Array(await f.arrayBuffer())
  file.value = { name: f.name, size: f.size, bytes }
}

function isMatch (value) {
  const e = expected.value.trim()
  return !!value && !!e && value.toLowerCase() === e.toLowerCase()
}

function formatBytes (n) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

onMounted(() => {
  const h = takeHandoff()
  if (h != null) input.value = h
  schedule()
})
</script>

<style scoped>
.opt { display: inline-flex; align-items: center; gap: 8px; font-size: 0.8125rem; color: var(--label-2); }
.opt__field { width: 200px; min-height: 32px; border-radius: 999px; font-size: 0.8125rem; }
@media (pointer: coarse) { .opt__field { min-height: 44px; } }

.file { flex: 1; display: flex; align-items: center; gap: 14px; padding: 20px 12px; color: var(--label-2); flex-wrap: wrap; }
.file__text { flex: 1; min-width: 160px; color: var(--label); }

.results { display: flex; flex-direction: column; min-width: 0; overflow: hidden; background: var(--bg-2); }
.results__bar { display: flex; align-items: center; gap: 8px; min-height: 46px; padding: 8px 16px 6px; }
.results__title { font-size: 0.9375rem; font-weight: 600; letter-spacing: -0.015em; flex: 1; }
.compare { position: relative; display: block; margin: 0 12px 10px; color: var(--label-2); }
.compare svg { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); }
.compare .field { padding-left: 32px; border-radius: 999px; font-size: 0.8125rem; font-family: var(--font-mono); letter-spacing: 0; }
.results__list { border-radius: 0; border-top: 0.5px solid var(--separator); }
.results__list .row { align-items: center; }
.results__list .row__label { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px; }
.hash { flex-basis: 100%; font-size: 0.8125rem; color: var(--label-2); word-break: break-all; user-select: all; }
.hash--empty { color: var(--label-3); user-select: none; }
.nomatch { display: flex; align-items: center; gap: 6px; margin: 0; padding: 10px 16px; color: var(--danger-text); border-top: 0.5px solid var(--separator); }
</style>
