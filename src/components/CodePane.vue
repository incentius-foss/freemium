<template>
  <teleport to="body" :disabled="!maximized">
    <div v-if="maximized" class="pane-scrim" aria-hidden="true" @click="maximized = false" />
    <section
      class="pane card"
      :class="{ 'pane--drop': dragging, 'pane--error': !!error, 'pane--max': maximized }"
      :aria-label="label"
      :role="maximized ? 'dialog' : undefined"
      :aria-modal="maximized || undefined"
      @dragover.prevent="onDragOver"
      @dragleave="dragging = false"
      @drop.prevent="onDrop"
      @keydown="onKeydown"
    >
      <header class="pane__bar">
        <h2 :id="labelId" class="pane__label">{{ label }}</h2>
        <slot name="badge" />
        <span class="pane__spacer" />
        <div class="pane__actions">
          <slot name="actions" />
          <template v-if="!readonly">
            <button v-if="sample" class="btn btn--plain btn--sm" type="button" @click="useSample">
              <AppIcon name="sparkles" :size="16" />Sample
            </button>
            <button class="icon-btn icon-btn--sm" type="button" aria-label="Paste from clipboard" title="Paste" @click="paste">
              <AppIcon name="paste" :size="18" />
            </button>
            <button v-if="accept !== false" class="icon-btn icon-btn--sm" type="button" aria-label="Open file" title="Open file" @click="openFile">
              <AppIcon name="docOpen" :size="18" />
            </button>
            <button class="icon-btn icon-btn--sm" type="button" aria-label="Clear" title="Clear" :disabled="!modelValue" @click="update('')">
              <AppIcon name="clear" :size="18" />
            </button>
            <input ref="fileInput" class="sr-only" type="file" :accept="accept || undefined" tabindex="-1" aria-hidden="true" @change="onFile" />
          </template>
          <template v-else>
            <button v-if="download" class="icon-btn icon-btn--sm" type="button" aria-label="Download" title="Download" :disabled="!modelValue" @click="save">
              <AppIcon name="download" :size="18" />
            </button>
            <button class="btn btn--sm" :class="modelValue ? 'btn--prominent' : ''" type="button" :disabled="!modelValue" @click="copy">
              <AppIcon name="copy" :size="16" />Copy
            </button>
          </template>
        </div>
      </header>

      <div v-if="findOpen" class="find" role="search" :aria-label="`Find in ${label}`">
        <AppIcon name="search" :size="15" class="find__icon" />
        <input
          ref="findInput"
          v-model="findQuery"
          class="find__field"
          type="text"
          placeholder="Find"
          :aria-label="`Find in ${label}`"
          spellcheck="false"
          @keydown.enter.prevent="$event.shiftKey ? step(-1) : step(1)"
          @keydown.esc.prevent.stop="closeFind"
        />
        <span class="find__count t-caption" aria-live="polite">{{ findStatus }}</span>
        <button
          class="find__case"
          type="button"
          :aria-pressed="findCase"
          aria-label="Match case"
          title="Match case"
          @click="findCase = !findCase"
        >Aa</button>
        <button class="icon-btn icon-btn--sm" type="button" aria-label="Previous match" title="Previous (⇧↩)" :disabled="!matches.length" @click="step(-1)">
          <AppIcon name="chevronUp" :size="16" />
        </button>
        <button class="icon-btn icon-btn--sm" type="button" aria-label="Next match" title="Next (↩)" :disabled="!matches.length" @click="step(1)">
          <AppIcon name="chevronDown" :size="16" />
        </button>
        <button class="icon-btn icon-btn--sm" type="button" aria-label="Close find" title="Close (esc)" @click="closeFind">
          <AppIcon name="xmark" :size="15" />
        </button>
      </div>

      <div class="pane__body">
        <slot>
          <div class="pane__editor">
            <!-- Match highlights render behind the transparent textarea, kept in scroll sync -->
            <div
              v-if="highlightHtml"
              ref="backdrop"
              class="pane__text pane__hl"
              :class="{ 'pane__text--nowrap': !wrap, 'pane__text--prose': !mono }"
              aria-hidden="true"
              v-html="highlightHtml"
            />
            <textarea
              ref="textarea"
              class="pane__text"
              :class="{ 'pane__text--nowrap': !wrap, 'pane__text--prose': !mono, 'pane__text--overlay': !!highlightHtml }"
              :value="modelValue"
              :readonly="readonly"
              :placeholder="placeholder"
              :aria-labelledby="labelId"
              :aria-describedby="error ? errorId : undefined"
              :aria-invalid="!!error"
              spellcheck="false"
              autocapitalize="off"
              autocomplete="off"
              autocorrect="off"
              @input="update($event.target.value)"
              @scroll="syncScroll"
            />
          </div>
        </slot>
      </div>

      <footer class="pane__foot">
        <p v-if="error" :id="errorId" class="pane__error" role="status">
          <AppIcon name="warning" :size="16" />
          <span>{{ error }}</span>
        </p>
        <p v-else class="pane__stats t-caption t-secondary">
          <slot name="status">{{ stats }}</slot>
        </p>
        <template v-if="!$slots.default">
          <button class="icon-btn icon-btn--sm" type="button" :aria-pressed="findOpen" aria-label="Find" title="Find (⌘F)" @click="findOpen ? closeFind() : openFind()">
            <AppIcon name="search" :size="16" />
          </button>
          <button class="icon-btn icon-btn--sm" type="button" :aria-pressed="wrap" aria-label="Wrap lines" title="Wrap lines" @click="wrap = !wrap">
            <AppIcon name="wrap" :size="16" />
          </button>
        </template>
        <button
          class="icon-btn icon-btn--sm"
          type="button"
          :aria-label="maximized ? 'Exit full window' : 'Expand to full window'"
          :title="maximized ? 'Exit full window (esc)' : 'Expand to full window'"
          @click="maximized = !maximized"
        >
          <AppIcon :name="maximized ? 'collapse' : 'expand'" :size="16" />
        </button>
      </footer>
    </section>
  </teleport>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { copyText, readClipboard, downloadText, readFileAsText } from '@/composables/clipboard'

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: 'Input' },
  readonly: { type: Boolean, default: false },
  placeholder: { type: String, default: '' },
  sample: { type: [String, Function], default: null },
  accept: { type: [String, Boolean], default: '' }, // file input accept; false hides "Open file"
  download: { type: String, default: '' }, // filename for Download; empty hides it
  error: { type: String, default: '' },
  mono: { type: Boolean, default: true },
})
const emit = defineEmits(['update:modelValue', 'file'])

const uid = Math.random().toString(36).slice(2, 8)
const labelId = `pane-${uid}`
const errorId = `pane-err-${uid}`
const fileInput = ref(null)
const textarea = ref(null)
const backdrop = ref(null)
const findInput = ref(null)
const dragging = ref(false)
const wrap = ref(true)
const maximized = ref(false)

const stats = computed(() => {
  const v = props.modelValue || ''
  if (!v) return props.readonly ? 'Output appears as you type' : 'Type, paste, or drop a file'
  const lines = v.split('\n').length
  const bytes = new TextEncoder().encode(v).length
  return `${lines.toLocaleString()} ${lines === 1 ? 'line' : 'lines'} · ${v.length.toLocaleString()} chars · ${formatBytes(bytes)}`
})

function formatBytes (n) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

function update (v) { emit('update:modelValue', v) }
function useSample () { update(typeof props.sample === 'function' ? props.sample() : props.sample) }
async function paste () {
  const text = await readClipboard()
  if (text != null) update(text)
}
function copy () { copyText(props.modelValue) }
function save () { downloadText(props.modelValue, props.download) }
function openFile () { fileInput.value?.click() }

async function loadFile (file) {
  if (!file) return
  emit('file', file)
  if (props.accept && !/text|json|yaml|yml|csv|xml|html|htm|css|js|sql|md|svg|txt|pem|crt|cer/.test(props.accept)) return
  try { update(await readFileAsText(file)) } catch { /* handled by consumer */ }
}
function onFile (e) { loadFile(e.target.files[0]); e.target.value = '' }
function onDragOver () { if (!props.readonly) dragging.value = true }
function onDrop (e) {
  dragging.value = false
  if (props.readonly) return
  const file = e.dataTransfer.files[0]
  if (file) loadFile(file)
  else update(e.dataTransfer.getData('text'))
}

// ── Find ─────────────────────────────────────────────────────────
const MAX_MATCHES = 2000
const findOpen = ref(false)
const findQuery = ref('')
const findCase = ref(false)
const current = ref(0)

const matches = computed(() => {
  const q = findQuery.value
  const text = props.modelValue || ''
  if (!findOpen.value || !q) return []
  const hay = findCase.value ? text : text.toLowerCase()
  const needle = findCase.value ? q : q.toLowerCase()
  const out = []
  let i = hay.indexOf(needle)
  while (i !== -1 && out.length < MAX_MATCHES) {
    out.push(i)
    i = hay.indexOf(needle, i + needle.length)
  }
  return out
})

const findStatus = computed(() => {
  if (!findQuery.value) return ''
  if (!matches.value.length) return 'No results'
  const more = matches.value.length >= MAX_MATCHES ? '+' : ''
  return `${current.value + 1} of ${matches.value.length}${more}`
})

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const highlightHtml = computed(() => {
  if (!matches.value.length) return ''
  const text = props.modelValue
  const len = findQuery.value.length
  let html = ''
  let last = 0
  matches.value.forEach((pos, n) => {
    html += escapeHtml(text.slice(last, pos))
    html += `<mark${n === current.value ? ' class="is-current"' : ''}>${escapeHtml(text.slice(pos, pos + len))}</mark>`
    last = pos + len
  })
  // trailing newline keeps the backdrop's height in step with the textarea
  return html + escapeHtml(text.slice(last)) + '\n'
})

watch([findQuery, findCase], () => { current.value = 0; reveal() })
watch(() => props.modelValue, () => { if (current.value >= matches.value.length) current.value = 0 })

function step (dir) {
  const n = matches.value.length
  if (!n) return
  current.value = (current.value + dir + n) % n
  reveal()
}

function reveal () {
  nextTick(() => {
    const mark = backdrop.value?.querySelector('mark.is-current')
    const ta = textarea.value
    if (!mark || !ta) return
    const top = mark.offsetTop - ta.clientHeight / 3
    const left = mark.offsetLeft - ta.clientWidth / 3
    ta.scrollTop = Math.max(0, top)
    if (!wrap.value) ta.scrollLeft = Math.max(0, left)
    syncScroll()
  })
}

function syncScroll () {
  if (!backdrop.value || !textarea.value) return
  backdrop.value.scrollTop = textarea.value.scrollTop
  backdrop.value.scrollLeft = textarea.value.scrollLeft
}

async function openFind () {
  findOpen.value = true
  const ta = textarea.value
  if (ta && ta.selectionStart !== ta.selectionEnd) findQuery.value = ta.value.slice(ta.selectionStart, ta.selectionEnd)
  await nextTick()
  findInput.value?.focus()
  findInput.value?.select()
}
function closeFind () {
  findOpen.value = false
  textarea.value?.focus()
}

function onKeydown (e) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f' && !e.shiftKey) {
    if (!textarea.value) return
    e.preventDefault()
    openFind()
  } else if (e.key === 'Escape' && maximized.value && !findOpen.value) {
    maximized.value = false
  }
}

watch(maximized, () => nextTick(() => textarea.value?.focus()))

defineExpose({ focus: () => textarea.value?.focus(), openFile, openFind })
</script>

<style scoped>
.pane {
  display: flex; flex-direction: column; min-height: 260px; min-width: 0; overflow: hidden;
  transition: box-shadow 160ms ease;
}
.pane--drop { box-shadow: inset 0 0 0 2px var(--tint); }
/* Full-window view: a sheet over the page */
.pane--max {
  position: fixed; z-index: 85;
  inset: calc(env(safe-area-inset-top) + var(--inset)) calc(env(safe-area-inset-right) + var(--inset)) calc(env(safe-area-inset-bottom) + var(--inset)) calc(env(safe-area-inset-left) + var(--inset));
  border-radius: var(--radius-window);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
  animation: pane-in 320ms var(--ease);
}
.pane-scrim { position: fixed; inset: 0; z-index: 84; background: rgba(0, 0, 0, 0.3); }
@keyframes pane-in { from { opacity: 0; transform: scale(0.98); } }

.pane__bar {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  padding: 8px 8px 6px 16px; min-height: 46px;
}
.pane__label { margin: 0; font-size: 0.9375rem; font-weight: 600; letter-spacing: -0.015em; }
.pane__spacer { flex: 1; }
.pane__actions { display: flex; align-items: center; gap: 2px; }
.pane__actions .btn--plain { color: var(--tint-text); }

.find {
  display: flex; align-items: center; gap: 4px; margin: 0 8px 6px; padding: 2px 4px 2px 10px;
  border-radius: 999px; background: var(--fill-3);
}
.find__icon { color: var(--label-2); flex: none; }
.find__field { flex: 1; min-width: 60px; min-height: 30px; border: 0; background: none; color: var(--label); font-size: 0.875rem; padding: 0 4px; }
.find__field:focus-visible { box-shadow: none !important; }
.find:focus-within { box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--tint) 55%, transparent); }
.find__count { color: var(--label-2); white-space: nowrap; padding: 0 4px; }
.find__case {
  min-width: 30px; height: 26px; padding: 0 6px; border: 0; border-radius: 8px; background: none;
  color: var(--label-2); font-size: 0.8125rem; font-weight: 600;
}
.find__case:hover { background: var(--fill-3); }
.find__case[aria-pressed="true"] { background: var(--tint); color: var(--on-tint); }

.pane__body { flex: 1; min-height: 0; display: flex; flex-direction: column; padding: 0 6px; }
.pane__editor { position: relative; flex: 1; min-height: 0; display: flex; }
.pane__text {
  flex: 1; width: 100%; min-height: 180px; resize: none; border: 0; padding: 10px 10px; margin: 0;
  border-radius: var(--radius-field); background: transparent; color: var(--label);
  font-family: var(--font-mono); font-size: 0.8125rem; line-height: 1.6; letter-spacing: 0;
  white-space: pre-wrap; overflow-wrap: anywhere; tab-size: 2; overflow: auto;
  scrollbar-gutter: stable; /* identical wrap width for textarea and highlight layer */
}
.pane__text--prose { font-family: var(--font-sans); font-size: 0.9375rem; letter-spacing: -0.01em; }
.pane__text--nowrap { white-space: pre; overflow-wrap: normal; overflow-x: auto; }
.pane__text::placeholder { color: var(--label-3); }
.pane__text:focus-visible { box-shadow: none !important; }
.pane__text[readonly] { cursor: text; }
.pane__text--overlay { position: relative; z-index: 1; }
.pane__hl {
  position: absolute; inset: 0; z-index: 0; color: transparent; pointer-events: none;
  overflow: hidden;
}
.pane__hl :deep(mark) { color: transparent; background: color-mix(in srgb, var(--yellow) 45%, transparent); border-radius: 3px; }
.pane__hl :deep(mark.is-current) { background: var(--orange); box-shadow: 0 0 0 1px var(--orange); }
.pane:focus-within { box-shadow: var(--shadow-card), inset 0 0 0 1px color-mix(in srgb, var(--tint) 55%, transparent); }
.pane--max:focus-within { box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35), inset 0 0 0 1px color-mix(in srgb, var(--tint) 55%, transparent); }

.pane__foot {
  display: flex; align-items: center; gap: 2px; min-height: 36px;
  padding: 4px 8px 6px 16px; border-top: 0.5px solid var(--separator);
}
.pane__stats, .pane__error { flex: 1; margin: 0; min-width: 0; }
.pane__error {
  display: flex; align-items: flex-start; gap: 6px; color: var(--danger-text);
  font-size: 0.8125rem; font-weight: 500; overflow-wrap: anywhere;
}
.pane__error :deep(svg) { margin-top: 1px; }
.pane__foot .icon-btn[aria-pressed="true"] { color: var(--tint-text); }
@media (max-width: 639px) { .pane:not(.pane--max) { min-height: 220px; } .pane:not(.pane--max) .pane__text { min-height: 160px; max-height: 50vh; } }
</style>
