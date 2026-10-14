<template>
  <ToolPage>
    <div class="split">
      <CodePane
        v-model="token"
        label="Encoded token"
        placeholder="Paste a JWT (eyJ…). A leading “Bearer ” is ignored."
        :sample="sample"
        :accept="false"
        :error="decodeError"
      />
      <div class="stack">
        <CodePane :model-value="headerJson" label="Header" readonly class="pane-sm">
          <template #badge>
            <span v-if="header?.alg" class="badge">{{ header.alg }}</span>
          </template>
        </CodePane>
        <CodePane :model-value="payloadJson" label="Payload" readonly />
      </div>
    </div>

    <div v-if="payload" class="split">
      <section class="card block" aria-labelledby="claims-title">
        <h2 id="claims-title" class="t-headline block__title">Time claims</h2>
        <ul v-if="timeClaims.length" class="inset-list nested" role="list">
          <li v-for="c in timeClaims" :key="c.key" class="row">
            <span class="row__label">
              <span class="t-subhead t-semibold">{{ c.label }}</span>
              <span class="t-caption t-secondary"> · {{ c.key }}</span>
            </span>
            <span class="row__value">{{ c.date }}</span>
          </li>
        </ul>
        <p v-else class="t-footnote t-secondary">This token has no exp, iat or nbf claims.</p>
        <p v-if="status" class="status" role="status">
          <span class="badge" :class="status.ok ? 'badge--ok' : 'badge--err'">
            <AppIcon :name="status.ok ? 'checkCircle' : 'warning'" :size="14" />{{ status.text }}
          </span>
        </p>
      </section>

      <section class="card block" aria-labelledby="verify-title">
        <h2 id="verify-title" class="t-headline block__title">Verify signature</h2>
        <template v-if="isHmac">
          <label class="label" for="jwt-secret">Secret ({{ header.alg }})</label>
          <input
            id="jwt-secret"
            v-model="secret"
            class="field t-mono"
            type="text"
            placeholder="your-256-bit-secret (the sample’s secret)"
            spellcheck="false"
            autocomplete="off"
          />
          <div class="verify-row">
            <Toggle v-model="secretBase64" label="Secret is Base64-encoded" />
          </div>
          <p class="status" role="status">
            <span v-if="!secret" class="t-footnote t-secondary">Enter the secret to check the signature.</span>
            <span v-else-if="verified === true" class="badge badge--ok"><AppIcon name="checkCircle" :size="14" />Signature verified</span>
            <span v-else-if="verified === false" class="badge badge--err"><AppIcon name="warning" :size="14" />Invalid signature</span>
            <span v-else-if="verifyError" class="badge badge--err"><AppIcon name="warning" :size="14" />{{ verifyError }}</span>
          </p>
        </template>
        <p v-else class="t-footnote t-secondary">
          Signatures using {{ header?.alg || 'this algorithm' }} need a public key. This tool verifies HMAC tokens (HS256, HS384, HS512).
        </p>
        <p class="label sig-label">Signature</p>
        <p class="sig t-mono">{{ signature || '—' }}</p>
      </section>
    </div>
  </ToolPage>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import ToolPage from '@/components/ToolPage.vue'
import CodePane from '@/components/CodePane.vue'
import AppIcon from '@/components/AppIcon.vue'
import Toggle from '@/components/ui/Toggle.vue'
import { takeHandoff } from '@/composables/useHandoff'

const sample = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkZyZWVtaXVtIiwiaWF0IjoxNzYwMDAwMDAwLCJleHAiOjIwMDAwMDAwMDB9.VLRn6ZMdboICyb8cKV_oVgh4fVLRf6j2TKZo9v7rMG8'

const token = ref('')
const secret = ref('')
const secretBase64 = ref(false)
const verified = ref(null)
const verifyError = ref('')

onMounted(() => {
  const handed = takeHandoff()
  if (handed != null) token.value = handed.trim()
})

function b64urlToBytes (s) {
  let b = s.replace(/-/g, '+').replace(/_/g, '/')
  b += '='.repeat((4 - (b.length % 4)) % 4)
  const bin = atob(b)
  return Uint8Array.from(bin, (c) => c.charCodeAt(0))
}
function bytesToB64url (bytes) {
  return btoa(Array.from(new Uint8Array(bytes), (b) => String.fromCharCode(b)).join('')).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function decodePart (s, name) {
  try {
    return JSON.parse(new TextDecoder().decode(b64urlToBytes(s)))
  } catch {
    throw new Error(`The ${name} isn’t valid Base64url-encoded JSON.`)
  }
}

const parts = computed(() => token.value.trim().replace(/^Bearer\s+/i, '').split('.'))
const decoded = computed(() => {
  if (!token.value.trim()) return {}
  if (parts.value.length !== 3) return { error: `A JWT has 3 parts separated by dots; this has ${parts.value.length}.` }
  try {
    return { header: decodePart(parts.value[0], 'header'), payload: decodePart(parts.value[1], 'payload') }
  } catch (e) {
    return { error: e.message }
  }
})

const decodeError = computed(() => decoded.value.error || '')
const header = computed(() => decoded.value.header || null)
const payload = computed(() => decoded.value.payload || null)
const signature = computed(() => (decoded.value.header ? parts.value[2] : ''))
const headerJson = computed(() => (header.value ? JSON.stringify(header.value, null, 2) : ''))
const payloadJson = computed(() => (payload.value ? JSON.stringify(payload.value, null, 2) : ''))

const fmt = (sec) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'long' }).format(new Date(sec * 1000))
const timeClaims = computed(() => {
  const p = payload.value || {}
  return [['exp', 'Expires'], ['iat', 'Issued at'], ['nbf', 'Not before']]
    .filter(([k]) => typeof p[k] === 'number')
    .map(([key, label]) => ({ key, label, date: fmt(p[key]) }))
})

const status = computed(() => {
  const p = payload.value
  if (!p) return null
  const nowSec = Date.now() / 1000
  if (typeof p.nbf === 'number' && nowSec < p.nbf) return { ok: false, text: 'Not valid yet' }
  if (typeof p.exp === 'number') return nowSec < p.exp ? { ok: true, text: 'Not expired' } : { ok: false, text: 'Expired' }
  return null
})

const isHmac = computed(() => /^HS(256|384|512)$/.test(header.value?.alg || ''))

let verifyRun = 0
watch([token, secret, secretBase64], async () => {
  const id = ++verifyRun
  verified.value = null
  verifyError.value = ''
  if (!isHmac.value || !secret.value || !header.value) return
  try {
    const hash = `SHA-${header.value.alg.slice(2)}`
    const keyBytes = secretBase64.value ? b64urlToBytes(secret.value.trim()) : new TextEncoder().encode(secret.value)
    const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash }, false, ['sign'])
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${parts.value[0]}.${parts.value[1]}`))
    if (id === verifyRun) verified.value = bytesToB64url(sig) === parts.value[2]
  } catch (e) {
    if (id === verifyRun) verifyError.value = secretBase64.value ? 'The secret isn’t valid Base64.' : (e.message || 'Couldn’t verify')
  }
}, { immediate: true })
</script>

<style scoped>
.stack { display: grid; gap: 16px; grid-template-rows: auto 1fr; min-width: 0; }
.pane-sm { min-height: 180px; }
.pane-sm :deep(.pane__text) { min-height: 90px; }
.block { padding: 16px; display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.block__title { margin-bottom: 4px; }
.nested { background: var(--bg-3); }
.nested > * + * { box-shadow: inset 0 0.5px 0 0 var(--separator); }
.row__label { display: flex; align-items: baseline; flex-wrap: wrap; gap: 0 2px; }
.status { margin-top: 4px; min-height: 22px; }
.verify-row { margin-top: 2px; }
.sig-label { margin-top: 8px; }
.sig { font-size: 0.75rem; color: var(--label-2); word-break: break-all; }
</style>
