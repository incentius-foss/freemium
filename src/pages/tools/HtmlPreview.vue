<template>
  <ToolPage fill>
    <template #options>
      <Segmented
        v-model="width"
        label="Preview width"
        :options="[
          { value: 'phone', label: 'Phone' },
          { value: 'tablet', label: 'Tablet' },
          { value: 'full', label: 'Full' },
        ]"
      />
      <Toggle v-model="allowScripts" label="Run scripts" />
      <button class="btn btn--sm" type="button" @click="editor.openFile()">
        <AppIcon name="docOpen" :size="16" />Open HTML File…
      </button>
      <span v-if="fileName" class="badge" :title="fileName"><AppIcon name="docText" :size="14" />{{ fileName }}</span>
    </template>

    <div class="split">
      <CodePane
        ref="editor"
        v-model="html"
        label="HTML"
        :sample="sample"
        accept=".html,.htm,text/html,text/plain"
        placeholder="<h1>Hello</h1> — or drop an .html file here"
        @file="(f) => (fileName = f.name)"
      />
      <section ref="previewEl" class="card preview" :class="{ 'preview--max': previewMax }" aria-labelledby="preview-title" @keydown.esc="previewMax = false">
        <header class="preview__bar">
          <h2 id="preview-title" class="t-subhead t-semibold">Preview</h2>
          <span class="badge" :class="allowScripts ? '' : 'badge--ok'">
            <AppIcon :name="allowScripts ? 'play' : 'shield'" :size="14" />
            {{ allowScripts ? 'Sandboxed, scripts on' : 'Sandboxed, scripts off' }}
          </span>
          <span class="preview__size t-caption t-secondary">{{ widthLabel }}</span>
          <button
            class="icon-btn icon-btn--sm"
            type="button"
            :aria-label="previewMax ? 'Exit full window' : 'Expand preview to full window'"
            :title="previewMax ? 'Exit full window (esc)' : 'Expand to full window'"
            @click="previewMax = !previewMax"
          >
            <AppIcon :name="previewMax ? 'collapse' : 'expand'" :size="16" />
          </button>
          <button class="icon-btn icon-btn--sm" type="button" aria-label="View preview full screen" title="Full screen" @click="enterFullscreen">
            <AppIcon name="fullscreen" :size="16" />
          </button>
        </header>
        <div class="preview__stage">
          <iframe
            :key="allowScripts ? 'js' : 'nojs'"
            class="preview__frame"
            :style="{ width: frameWidth }"
            :sandbox="allowScripts ? 'allow-scripts' : ''"
            :srcdoc="srcdoc"
            title="Rendered HTML preview"
            referrerpolicy="no-referrer"
          />
        </div>
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

const sample = `<!doctype html>
<html>
<head>
  <style>
    body { font-family: system-ui, sans-serif; margin: 32px; color: #1d1d1f; }
    .card { padding: 20px; border-radius: 16px; background: #f2f2f7; }
    button { padding: 8px 16px; border: 0; border-radius: 999px; background: #0088ff; color: #fff; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Hello, Freemium</h1>
    <p>This preview runs in a sandboxed frame.</p>
    <button onclick="this.textContent = 'Scripts are on'">Click me</button>
  </div>
</body>
</html>`

const html = ref(sessionGet() || '')
const debounced = ref(html.value)
const width = ref(load('freemium:htmlpreview:width', 'full'))
// Scripts run by default. The frame still has an opaque origin (no allow-same-origin),
// so page scripts can't reach this app, its storage, or cookies.
const allowScripts = ref(load('freemium:htmlpreview:scripts', true))
watch(allowScripts, (v) => save('freemium:htmlpreview:scripts', v))
const editor = ref(null)
const previewEl = ref(null)
const previewMax = ref(false)
const fileName = ref('')

// True full screen for the rendered page; falls back to the in-app full-window view
// where the Fullscreen API isn't available (e.g. iPhone Safari).
function enterFullscreen () {
  const el = previewEl.value
  if (el?.requestFullscreen) el.requestFullscreen().catch(() => { previewMax.value = true })
  else if (el?.webkitRequestFullscreen) el.webkitRequestFullscreen()
  else previewMax.value = true
}

function sessionGet () { try { return sessionStorage.getItem('freemium:input:html-preview') } catch { return null } }

let t = null
watch(html, (v) => {
  clearTimeout(t)
  t = setTimeout(() => { debounced.value = v }, 200)
  try { sessionStorage.setItem('freemium:input:html-preview', v.length < 200000 ? v : '') } catch { /* ignore */ }
})
watch(width, (v) => save('freemium:htmlpreview:width', v))

// With scripts off the sandbox would block them anyway; dropping them avoids console noise.
const srcdoc = computed(() => (allowScripts.value ? debounced.value : debounced.value
  .replace(/<script\b[\s\S]*?<\/script\s*>/gi, '')
  .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')))

const frameWidth = computed(() => ({ phone: '390px', tablet: '820px', full: '100%' }[width.value]))
const widthLabel = computed(() => ({ phone: '390 px', tablet: '820 px', full: 'Fit' }[width.value]))

onMounted(() => {
  const handed = takeHandoff()
  if (handed != null) { html.value = handed; debounced.value = handed }
})
</script>

<style scoped>
.preview { display: flex; flex-direction: column; min-width: 0; min-height: 360px; overflow: hidden; }
.preview__bar { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; padding: 12px 16px 8px; }
.preview__size { margin-left: auto; }
.preview--max {
  position: fixed; z-index: 85;
  inset: calc(env(safe-area-inset-top) + var(--inset)) calc(env(safe-area-inset-right) + var(--inset)) calc(env(safe-area-inset-bottom) + var(--inset)) calc(env(safe-area-inset-left) + var(--inset));
  border-radius: var(--radius-window); box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
}
.preview:fullscreen { border-radius: 0; background: var(--bg-2); }
.preview:fullscreen .preview__stage { margin: 0; border-radius: 0; }
.preview:fullscreen .preview__frame { border-radius: 0; }
.preview__stage {
  flex: 1; min-height: 0; display: flex; justify-content: center; overflow: auto;
  margin: 0 8px 8px; border-radius: var(--radius-field); background: var(--bg-3);
}
.preview__frame {
  flex: none; max-width: none; height: 100%; min-height: 320px; border: 0;
  background: #fff; border-radius: var(--radius-field);
  transition: width var(--dur) var(--ease);
}
</style>
