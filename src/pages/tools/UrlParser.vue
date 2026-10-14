<template>
  <ToolPage>
    <template #options>
      <Toggle v-model="decode" label="Decode values" />
      <button class="btn btn--sm" type="button" @click="useSample">
        <AppIcon name="sparkles" :size="16" />Sample
      </button>
    </template>

    <section class="card input-card">
      <label class="label" for="url-input">URL</label>
      <textarea
        id="url-input"
        v-model="input"
        class="field t-mono url-input"
        rows="2"
        placeholder="https://user:pass@example.com:8080/path/page?query=1#section"
        spellcheck="false"
        autocomplete="off"
        autocapitalize="off"
        :aria-invalid="!!error"
        aria-describedby="url-status"
      />
      <div class="input-actions">
        <p id="url-status" class="status t-footnote" role="status">
          <span v-if="error" class="status--err"><AppIcon name="warning" :size="14" />{{ error }}</span>
          <span v-else-if="url" class="t-secondary">Edit the parameters below and the URL updates.</span>
        </p>
        <button class="btn btn--sm" :class="url ? 'btn--prominent' : ''" type="button" :disabled="!url" @click="copyText(input)">
          <AppIcon name="copy" :size="16" />Copy URL
        </button>
      </div>
    </section>

    <div v-if="url" class="split">
      <ul class="inset-list" role="list" aria-label="URL parts">
        <li v-for="r in rows" :key="r.label" class="row">
          <span class="row__label t-subhead">{{ r.label }}</span>
          <span class="row__value" :class="{ 'row__value--empty': !r.value }">{{ r.value || '—' }}</span>
          <button class="icon-btn icon-btn--sm" type="button" :aria-label="`Copy ${r.label}`" title="Copy" :disabled="!r.value" @click="copyText(r.value)">
            <AppIcon name="copy" :size="16" />
          </button>
        </li>
      </ul>

      <section class="card params" aria-labelledby="params-title">
        <header class="params__bar">
          <h2 id="params-title" class="t-headline">Query parameters <span class="t-footnote t-secondary">{{ params.length }}</span></h2>
          <button class="btn btn--sm btn--plain" type="button" @click="addParam">
            <AppIcon name="plus" :size="16" />Add
          </button>
        </header>
        <p v-if="!params.length" class="t-footnote t-secondary params__empty">No query parameters.</p>
        <ul v-else class="params__list" role="list">
          <li v-for="(p, i) in params" :key="p.id" class="param">
            <input
              v-model="p.key"
              class="field t-mono"
              type="text"
              placeholder="key"
              :aria-label="`Parameter ${i + 1} name`"
              spellcheck="false"
              @input="rebuild"
            />
            <span class="param__eq" aria-hidden="true">=</span>
            <input
              v-model="p.value"
              class="field t-mono"
              type="text"
              placeholder="value"
              :aria-label="`Parameter ${i + 1} value`"
              spellcheck="false"
              @input="rebuild"
            />
            <button class="icon-btn icon-btn--sm" type="button" :aria-label="`Remove parameter ${p.key || i + 1}`" title="Remove" @click="removeParam(i)">
              <AppIcon name="minus" :size="16" />
            </button>
          </li>
        </ul>
      </section>
    </div>
  </ToolPage>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import ToolPage from '@/components/ToolPage.vue'
import AppIcon from '@/components/AppIcon.vue'
import Toggle from '@/components/ui/Toggle.vue'
import { copyText } from '@/composables/clipboard'
import { takeHandoff } from '@/composables/useHandoff'

const SAMPLE = 'https://user:secret@api.example.com:8443/v1/search/results?q=liquid%20glass&page=2&tags=ios&tags=design#top'

const input = ref(sessionGet() || SAMPLE)
const decode = ref(true)
const params = ref([])
let seq = 0
let internal = false

function sessionGet () { try { return sessionStorage.getItem('freemium:input:url-parser') } catch { return null } }

const parsed = computed(() => {
  const s = input.value.trim()
  if (!s) return {}
  try {
    return { url: new URL(s) }
  } catch {
    return { error: /^[a-z][\w+.-]*:/i.test(s) ? 'This URL is malformed.' : 'Add a scheme such as https:// to parse this URL.' }
  }
})
const url = computed(() => parsed.value.url || null)
const error = computed(() => parsed.value.error || '')

function safeDecode (v) {
  if (!decode.value) return v
  try { return decodeURIComponent(v.replace(/\+/g, ' ')) } catch { return v }
}

const rows = computed(() => {
  const u = url.value
  if (!u) return []
  return [
    { label: 'Protocol', value: u.protocol },
    { label: 'Username', value: safeDecode(u.username) },
    { label: 'Password', value: safeDecode(u.password) },
    { label: 'Host', value: u.hostname },
    { label: 'Port', value: u.port || (u.protocol === 'https:' ? '443 (default)' : u.protocol === 'http:' ? '80 (default)' : '') },
    { label: 'Path', value: safeDecode(u.pathname) },
    { label: 'Query', value: decode.value ? safeDecode(u.search) : u.search },
    { label: 'Fragment', value: safeDecode(u.hash) },
    { label: 'Origin', value: u.origin === 'null' ? '' : u.origin },
  ]
})

watch(input, (v) => {
  try { sessionStorage.setItem('freemium:input:url-parser', v) } catch { /* ignore */ }
  if (internal) { internal = false; return }
  params.value = url.value ? [...url.value.searchParams].map(([key, value]) => ({ id: ++seq, key, value })) : []
}, { immediate: true })

function rebuild () {
  const u = url.value
  if (!u) return
  const next = new URL(u.href)
  const sp = new URLSearchParams()
  params.value.forEach((p) => { if (p.key || p.value) sp.append(p.key, p.value) })
  next.search = sp.toString()
  if (next.href === input.value) return
  internal = true
  input.value = next.href
}

function addParam () {
  params.value.push({ id: ++seq, key: '', value: '' })
}
function removeParam (i) {
  params.value.splice(i, 1)
  rebuild()
}
function useSample () { input.value = SAMPLE }

onMounted(() => {
  const handed = takeHandoff()
  if (handed != null) input.value = handed.trim()
})
</script>

<style scoped>
.input-card { padding: 14px 16px; }
.url-input { font-size: 0.9375rem; resize: vertical; word-break: break-all; }
.input-actions { display: flex; align-items: center; gap: 12px; margin-top: 8px; }
.status { flex: 1; margin: 0; }
.status--err { display: inline-flex; align-items: center; gap: 6px; color: var(--danger-text); font-weight: 500; }
.row__value { flex: 2; }
.row__value--empty { color: var(--label-3); }

.params { padding: 12px 12px 14px; min-width: 0; }
.params__bar { display: flex; align-items: center; justify-content: space-between; padding: 0 4px 8px; }
.params__empty { padding: 4px; }
.params__list { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.param { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1.4fr) auto; align-items: center; gap: 6px; }
.param .field { font-size: 0.8125rem; min-height: 34px; }
@media (pointer: coarse) { .param .field { min-height: 44px; } }
.param__eq { color: var(--label-3); font-family: var(--font-mono); }
@media (max-width: 560px) {
  .row { flex-wrap: wrap; }
  .row__label { flex-basis: 100%; }
  .row__value { text-align: left; }
}
</style>
