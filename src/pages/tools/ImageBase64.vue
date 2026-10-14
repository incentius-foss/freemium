<template>
  <ToolPage fill>
    <template #options>
      <Segmented v-model="mode" label="Direction" :options="[{ value: 'encode', label: 'Image → Base64' }, { value: 'decode', label: 'Base64 → Image' }]" />
      <Segmented
        v-if="mode === 'encode'"
        v-model="outFormat"
        label="Output format"
        :options="[
          { value: 'datauri', label: 'Data URI' },
          { value: 'base64', label: 'Base64' },
          { value: 'css', label: 'CSS' },
          { value: 'html', label: 'HTML' },
          { value: 'markdown', label: 'Markdown' },
        ]"
      />
    </template>

    <!-- Encode -->
    <div v-if="mode === 'encode'" class="split">
      <section
        class="card drop"
        :class="{ 'drop--over': dragging }"
        aria-labelledby="drop-title"
        @dragover.prevent="dragging = true"
        @dragleave="dragging = false"
        @drop.prevent="onDrop"
      >
        <header class="drop__bar">
          <h2 id="drop-title" class="drop__label">Image</h2>
          <span class="drop__spacer" />
          <button class="btn btn--plain btn--sm" type="button" @click="useSample"><AppIcon name="sparkles" :size="16" />Sample</button>
          <button class="icon-btn icon-btn--sm" type="button" aria-label="Clear image" title="Clear" :disabled="!image" @click="image = null">
            <AppIcon name="clear" :size="18" />
          </button>
        </header>
        <div class="drop__body">
          <template v-if="image">
            <div class="preview checker">
              <img :src="image.dataUri" :alt="`Preview of ${image.name}`" />
            </div>
            <ul class="inset-list meta" role="list">
              <li class="row"><span class="row__label t-subhead">File</span><span class="row__value">{{ image.name }}</span></li>
              <li class="row"><span class="row__label t-subhead">Type</span><span class="row__value">{{ image.type || 'unknown' }}</span></li>
              <li v-if="image.width" class="row"><span class="row__label t-subhead">Dimensions</span><span class="row__value">{{ image.width }} × {{ image.height }} px</span></li>
              <li class="row"><span class="row__label t-subhead">Size</span><span class="row__value">{{ formatBytes(image.size) }} → {{ formatBytes(image.dataUri.length) }} as Base64 (+{{ overhead }}%)</span></li>
            </ul>
          </template>
          <div v-else class="empty">
            <AppIcon name="photo" :size="44" :weight="1.4" />
            <p class="t-headline">Drop an image here</p>
            <p class="t-footnote t-secondary">PNG, JPEG, GIF, WebP, SVG, AVIF or ICO. You can also paste with ⌘V / Ctrl+V.</p>
            <button class="btn btn--prominent" type="button" @click="picker.click()">Choose Image…</button>
          </div>
          <input ref="picker" class="sr-only" type="file" accept="image/*" tabindex="-1" aria-hidden="true" @change="onPick" />
        </div>
      </section>

      <CodePane :model-value="encoded" label="Output" readonly :download="downloadName" :error="encodeError" />
    </div>

    <!-- Decode -->
    <div v-else class="split">
      <CodePane
        v-model="b64Input"
        label="Base64 or Data URI"
        placeholder="Paste data:image/png;base64,… or raw Base64"
        :accept="false"
        :error="decoded.error"
      />
      <section class="card drop" aria-labelledby="decoded-title">
        <header class="drop__bar">
          <h2 id="decoded-title" class="drop__label">Preview</h2>
          <span class="drop__spacer" />
          <button class="btn btn--sm" :class="decoded.src ? 'btn--prominent' : ''" type="button" :disabled="!decoded.src" @click="downloadDecoded">
            <AppIcon name="download" :size="16" />Download
          </button>
        </header>
        <div class="drop__body">
          <template v-if="decoded.src">
            <div class="preview checker">
              <img :src="decoded.src" :alt="`Decoded ${decoded.mime} image`" @load="onDecodedLoad" @error="decodedBroken = true" />
            </div>
            <p v-if="decodedBroken" class="broken" role="status">
              <AppIcon name="warning" :size="16" /> The data decoded, but the browser can’t display it as an image.
            </p>
            <ul class="inset-list meta" role="list">
              <li class="row"><span class="row__label t-subhead">Type</span><span class="row__value">{{ decoded.mime }}</span></li>
              <li v-if="decodedSize.w" class="row"><span class="row__label t-subhead">Dimensions</span><span class="row__value">{{ decodedSize.w }} × {{ decodedSize.h }} px</span></li>
              <li class="row"><span class="row__label t-subhead">Size</span><span class="row__value">{{ formatBytes(decoded.bytes.length) }}</span></li>
            </ul>
          </template>
          <div v-else class="empty">
            <AppIcon name="photo" :size="44" :weight="1.4" />
            <p class="t-footnote t-secondary">The decoded image appears here.</p>
          </div>
        </div>
      </section>
    </div>
  </ToolPage>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import ToolPage from '@/components/ToolPage.vue'
import CodePane from '@/components/CodePane.vue'
import AppIcon from '@/components/AppIcon.vue'
import Segmented from '@/components/ui/Segmented.vue'
import { takeHandoff } from '@/composables/useHandoff'
import { load, save } from '@/composables/storage'
import { toast } from '@/composables/useToast'

const saved = load('freemium:opts:image-base64', {})
const mode = ref(saved.mode || 'encode')
const outFormat = ref(saved.outFormat || 'datauri')
watch([mode, outFormat], () => save('freemium:opts:image-base64', { mode: mode.value, outFormat: outFormat.value }))

const picker = ref(null)
const dragging = ref(false)
const image = ref(null) // { name, type, size, dataUri, width, height }
const encodeError = ref('')

function formatBytes (n) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}

function readImage (file) {
  if (!file) return
  if (!file.type.startsWith('image/') && !/\.(svg|ico|avif|heic)$/i.test(file.name)) {
    encodeError.value = `“${file.name}” isn’t an image.`
    return
  }
  encodeError.value = ''
  const reader = new FileReader()
  reader.onload = () => {
    const dataUri = reader.result
    const img = new Image()
    const info = { name: file.name, type: file.type, size: file.size, dataUri, width: 0, height: 0 }
    img.onload = () => { image.value = { ...info, width: img.naturalWidth, height: img.naturalHeight } }
    img.onerror = () => { image.value = info }
    img.src = dataUri
  }
  reader.onerror = () => { encodeError.value = 'Couldn’t read that file.' }
  reader.readAsDataURL(file)
}

function onPick (e) { readImage(e.target.files[0]); e.target.value = '' }
function onDrop (e) { dragging.value = false; readImage(e.dataTransfer.files[0]) }
function onPaste (e) {
  if (mode.value !== 'encode') return
  const item = [...(e.clipboardData?.items || [])].find((i) => i.type.startsWith('image/'))
  if (item) { e.preventDefault(); readImage(item.getAsFile()) }
}

async function useSample () {
  try {
    const res = await fetch('/icons/app-icon.svg')
    const blob = await res.blob()
    readImage(new File([blob], 'app-icon.svg', { type: 'image/svg+xml' }))
  } catch {
    toast('Couldn’t load the sample image.', { type: 'warning' })
  }
}

const overhead = computed(() => (image.value ? Math.round((image.value.dataUri.length / image.value.size - 1) * 100) : 0))
const encoded = computed(() => {
  if (!image.value) return ''
  const uri = image.value.dataUri
  const alt = image.value.name.replace(/\.[^.]+$/, '').replace(/"/g, '')
  switch (outFormat.value) {
    case 'base64': return uri.slice(uri.indexOf(',') + 1)
    case 'css': return `background-image: url("${uri}");`
    case 'html': return `<img src="${uri}" alt="${alt}"${image.value.width ? ` width="${image.value.width}" height="${image.value.height}"` : ''} />`
    case 'markdown': return `![${alt}](${uri})`
    default: return uri
  }
})
const downloadName = computed(() => ({ css: 'image.css', html: 'image.html', markdown: 'image.md' }[outFormat.value] || 'image-base64.txt'))

// ── Decode ───────────────────────────────────────────────────────
const b64Input = ref('')
const decodedBroken = ref(false)
const decodedSize = ref({ w: 0, h: 0 })
let objectUrl = null

function sniff (b) {
  const s = (i, str) => [...str].every((c, k) => b[i + k] === c.charCodeAt(0))
  if (b[0] === 0x89 && s(1, 'PNG')) return 'image/png'
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg'
  if (s(0, 'GIF8')) return 'image/gif'
  if (s(0, 'RIFF') && s(8, 'WEBP')) return 'image/webp'
  if (s(4, 'ftypavif') || s(4, 'ftypavis')) return 'image/avif'
  if (b[0] === 0 && b[1] === 0 && b[2] === 1 && b[3] === 0) return 'image/x-icon'
  if (s(0, 'BM')) return 'image/bmp'
  const head = new TextDecoder().decode(b.slice(0, 256)).trimStart()
  if (/^(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*<svg[\s>]/i.test(head)) return 'image/svg+xml'
  return null
}

const decoded = computed(() => {
  const raw = b64Input.value.trim()
  if (!raw) return {}
  let mime = null
  let data = raw
  const m = /^data:([\w/+.-]+)?(;[\w=-]+)*?(;base64)?,/i.exec(raw)
  if (m) {
    mime = m[1] || null
    data = raw.slice(m[0].length)
    if (!m[3]) {
      // Not Base64 (e.g. URL-encoded SVG): decode the percent-encoding instead.
      try { const text = decodeURIComponent(data); return finish(new TextEncoder().encode(text), mime || 'image/svg+xml') } catch { return { error: 'The data URI isn’t Base64 and couldn’t be URL-decoded.' } }
    }
  }
  data = data.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/')
  data += '='.repeat((4 - (data.length % 4)) % 4)
  let bin
  try { bin = atob(data) } catch { return { error: 'This isn’t valid Base64. Check for stray characters.' } }
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
  const detected = sniff(bytes)
  if (!detected && !mime) return { error: 'Decoded fine, but the bytes don’t look like a known image format.' }
  return finish(bytes, detected || mime)
})

function finish (bytes, mime) {
  if (objectUrl) URL.revokeObjectURL(objectUrl)
  objectUrl = URL.createObjectURL(new Blob([bytes], { type: mime }))
  return { src: objectUrl, mime, bytes }
}

watch(decoded, () => { decodedBroken.value = false; decodedSize.value = { w: 0, h: 0 } })
function onDecodedLoad (e) { decodedSize.value = { w: e.target.naturalWidth, h: e.target.naturalHeight } }

function downloadDecoded () {
  const ext = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp', 'image/avif': 'avif', 'image/x-icon': 'ico', 'image/bmp': 'bmp', 'image/svg+xml': 'svg' }[decoded.value.mime] || 'bin'
  const a = document.createElement('a')
  a.href = decoded.value.src
  a.download = `image.${ext}`
  a.click()
}

onMounted(() => {
  window.addEventListener('paste', onPaste)
  const h = takeHandoff()
  if (h != null) { mode.value = 'decode'; b64Input.value = h }
})
onBeforeUnmount(() => {
  window.removeEventListener('paste', onPaste)
  if (objectUrl) URL.revokeObjectURL(objectUrl)
})
</script>

<style scoped>
.drop { display: flex; flex-direction: column; min-height: 260px; min-width: 0; overflow: hidden; transition: box-shadow 160ms ease; }
.drop--over { box-shadow: inset 0 0 0 2px var(--tint); }
.drop__bar { display: flex; align-items: center; gap: 8px; min-height: 46px; padding: 8px 8px 6px 16px; }
.drop__label { font-size: 0.9375rem; font-weight: 600; letter-spacing: -0.015em; }
.drop__spacer { flex: 1; }
.drop__bar .btn--plain { color: var(--tint-text); }
.drop__body { flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: auto; }
.empty {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
  margin: 0 12px 12px; padding: 28px 16px; text-align: center; color: var(--label-2);
  border: 1.5px dashed var(--separator-opaque); border-radius: 16px;
}
.empty .t-headline { color: var(--label); }
.empty .btn { margin-top: 8px; }
.preview { flex: 1; min-height: 160px; margin: 0 12px; border-radius: 14px; display: grid; place-items: center; overflow: hidden; padding: 12px; }
.preview img { max-width: 100%; max-height: 42vh; object-fit: contain; }
/* Transparency checkerboard, standard image-editor convention */
.checker {
  background-color: var(--bg-3);
  background-image: linear-gradient(45deg, var(--fill-3) 25%, transparent 25%, transparent 75%, var(--fill-3) 75%), linear-gradient(45deg, var(--fill-3) 25%, transparent 25%, transparent 75%, var(--fill-3) 75%);
  background-size: 16px 16px; background-position: 0 0, 8px 8px;
}
.meta { margin-top: 12px; border-radius: 0; border-top: 0.5px solid var(--separator); }
.meta .row__value { flex: 1; }
.broken { display: flex; gap: 6px; align-items: center; margin: 8px 16px 0; color: var(--warning-text); font-size: 0.8125rem; font-weight: 500; }
</style>
