<template>
  <ToolPage fill>
    <template #options>
      <Segmented v-model="mode" label="Mode" :options="[{ value: 'generate', label: 'Generate' }, { value: 'read', label: 'Read' }]" />
      <template v-if="mode === 'generate'">
        <label class="opt">
          <span class="opt__label">Size</span>
          <select v-model.number="size" class="field opt__field">
            <option v-for="s in [128, 256, 512, 1024]" :key="s" :value="s">{{ s }} px</option>
          </select>
        </label>
        <label class="opt">
          <span class="opt__label">Error correction</span>
          <select v-model="level" class="field opt__field">
            <option value="L">Low (7%)</option>
            <option value="M">Medium (15%)</option>
            <option value="Q">Quartile (25%)</option>
            <option value="H">High (30%)</option>
          </select>
        </label>
        <label class="opt">
          <span class="opt__label">Foreground</span>
          <input v-model="fg" class="swatch" type="color" aria-label="Foreground color" />
        </label>
        <label class="opt">
          <span class="opt__label">Background</span>
          <input v-model="bg" class="swatch" type="color" aria-label="Background color" />
        </label>
      </template>
    </template>

    <!-- Generate -->
    <div v-if="mode === 'generate'" class="split">
      <CodePane
        v-model="text"
        label="Content"
        placeholder="Text, a URL, Wi-Fi config (WIFI:T:WPA;S:name;P:pass;;)…"
        sample="https://freemium.incentius.com"
        :mono="false"
        :accept="false"
        :error="genError"
      />
      <section class="card qr" aria-labelledby="qr-title">
        <header class="qr__bar">
          <h2 id="qr-title" class="qr__label">QR Code</h2>
          <span class="qr__spacer" />
          <button class="icon-btn icon-btn--sm" type="button" aria-label="Copy image" title="Copy image" :disabled="!hasCode" @click="copyImage">
            <AppIcon name="copy" :size="18" />
          </button>
          <button class="btn btn--sm" :class="hasCode ? 'btn--prominent' : ''" type="button" :disabled="!hasCode" @click="downloadPng">
            <AppIcon name="download" :size="16" />PNG
          </button>
        </header>
        <div class="qr__body">
          <canvas v-show="hasCode" ref="canvas" class="qr__canvas" role="img" :aria-label="`QR code encoding: ${text}`" />
          <div v-if="!hasCode" class="empty">
            <AppIcon name="qrcode" :size="44" :weight="1.4" />
            <p class="t-footnote t-secondary">Type something to generate a QR code.</p>
          </div>
          <p v-if="hasCode && lowContrast" class="warn" role="status">
            <AppIcon name="warning" :size="16" /> Low contrast between colors. Some scanners may fail; dark on light works best.
          </p>
        </div>
      </section>
    </div>

    <!-- Read -->
    <div v-else class="split">
      <section
        class="card qr"
        :class="{ 'qr--over': dragging }"
        aria-labelledby="scan-title"
        @dragover.prevent="dragging = true"
        @dragleave="dragging = false"
        @drop.prevent="onDrop"
      >
        <header class="qr__bar">
          <h2 id="scan-title" class="qr__label">Image</h2>
          <span class="qr__spacer" />
          <button class="icon-btn icon-btn--sm" type="button" aria-label="Clear image" title="Clear" :disabled="!scanSrc" @click="clearScan">
            <AppIcon name="clear" :size="18" />
          </button>
        </header>
        <div class="qr__body">
          <img v-if="scanSrc" :src="scanSrc" class="qr__scan" :alt="scanName ? `Scanned image ${scanName}` : 'Scanned image'" />
          <div v-else class="empty empty--dashed">
            <AppIcon name="qrcode" :size="44" :weight="1.4" />
            <p class="t-headline">Drop an image with a QR code</p>
            <p class="t-footnote t-secondary">Or paste a screenshot with ⌘V / Ctrl+V.</p>
            <button class="btn btn--prominent" type="button" @click="picker.click()">Choose Image…</button>
          </div>
          <input ref="picker" class="sr-only" type="file" accept="image/*" tabindex="-1" aria-hidden="true" @change="onPick" />
        </div>
      </section>
      <CodePane :model-value="scanResult" label="Decoded Text" readonly download="qr.txt" :error="scanError">
        <template #badge>
          <span v-if="scanning" class="t-caption t-secondary" role="status">Scanning…</span>
        </template>
        <template #actions>
          <a v-if="resultUrl" class="btn btn--sm" :href="resultUrl" target="_blank" rel="noopener noreferrer">
            <AppIcon name="arrowUpRight" :size="16" />Open Link
          </a>
        </template>
      </CodePane>
    </div>
  </ToolPage>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import QRious from 'qrious'
import jsQR from 'jsqr'
import ToolPage from '@/components/ToolPage.vue'
import CodePane from '@/components/CodePane.vue'
import AppIcon from '@/components/AppIcon.vue'
import Segmented from '@/components/ui/Segmented.vue'
import { takeHandoff } from '@/composables/useHandoff'
import { load, save } from '@/composables/storage'
import { toast } from '@/composables/useToast'

const saved = load('freemium:opts:qr-code', {})
const mode = ref(saved.mode || 'generate')
const size = ref(saved.size || 512)
const level = ref(saved.level || 'M')
const fg = ref(saved.fg || '#000000')
const bg = ref(saved.bg || '#ffffff')
watch([mode, size, level, fg, bg], () => save('freemium:opts:qr-code', { mode: mode.value, size: size.value, level: level.value, fg: fg.value, bg: bg.value }))

// ── Generate ─────────────────────────────────────────────────────
const text = ref('')
const canvas = ref(null)
const genError = ref('')
const hasCode = computed(() => !!text.value && !genError.value)

function render () {
  genError.value = ''
  if (!text.value || !canvas.value) return
  // QR version 40 tops out near 2,953 bytes at level L
  if (new TextEncoder().encode(text.value).length > 2900) { genError.value = 'Too much data for a QR code (about 2,900 bytes max).'; return }
  try {
    new QRious({ element: canvas.value, value: text.value, size: size.value, level: level.value, foreground: fg.value, background: bg.value, padding: Math.round(size.value / 16) })
  } catch (e) {
    genError.value = e?.message || 'Couldn’t generate a QR code for this content.'
  }
}
watch([text, size, level, fg, bg, mode], () => nextTick(render))

function luminance (hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const lowContrast = computed(() => {
  const [a, b] = [luminance(fg.value), luminance(bg.value)]
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) < 4
})

function downloadPng () {
  const a = document.createElement('a')
  a.href = canvas.value.toDataURL('image/png')
  a.download = 'qr-code.png'
  a.click()
}
function copyImage () {
  canvas.value.toBlob(async (blob) => {
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      toast('Image copied', { type: 'success' })
    } catch {
      toast('This browser can’t copy images. Use Download instead.', { type: 'warning', timeout: 4000 })
    }
  })
}

// ── Read ─────────────────────────────────────────────────────────
const picker = ref(null)
const dragging = ref(false)
const scanSrc = ref('')
const scanName = ref('')
const scanResult = ref('')
const scanError = ref('')
const scanning = ref(false)
const resultUrl = computed(() => (/^https?:\/\/\S+$/i.test(scanResult.value.trim()) ? scanResult.value.trim() : ''))

function clearScan () {
  if (scanSrc.value) URL.revokeObjectURL(scanSrc.value)
  scanSrc.value = ''; scanName.value = ''; scanResult.value = ''; scanError.value = ''
}

async function scan (file) {
  if (!file) return
  if (!file.type.startsWith('image/')) { scanError.value = `“${file.name}” isn’t an image.`; return }
  clearScan()
  scanSrc.value = URL.createObjectURL(file)
  scanName.value = file.name
  scanning.value = true
  try {
    const bitmap = await createImageBitmap(file)
    let value = null
    // Fast path: the platform barcode detector (Safari, Chrome on macOS/Android)
    if ('BarcodeDetector' in window) {
      try {
        const formats = await window.BarcodeDetector.getSupportedFormats()
        if (formats.includes('qr_code')) {
          const codes = await new window.BarcodeDetector({ formats: ['qr_code'] }).detect(bitmap)
          if (codes.length) value = codes[0].rawValue
        }
      } catch { /* fall back to jsQR */ }
    }
    if (value == null) {
      // Downscale very large photos; jsQR is O(pixels)
      const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
      const w = Math.round(bitmap.width * scale)
      const h = Math.round(bitmap.height * scale)
      const c = document.createElement('canvas')
      c.width = w; c.height = h
      const ctx = c.getContext('2d', { willReadFrequently: true })
      ctx.drawImage(bitmap, 0, 0, w, h)
      const code = jsQR(ctx.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: 'attemptBoth' })
      if (code) value = code.data
    }
    if (value == null) scanError.value = 'No QR code found. Try a sharper, closer image.'
    else scanResult.value = value
  } catch {
    scanError.value = 'Couldn’t read that image.'
  } finally {
    scanning.value = false
  }
}

function onPick (e) { scan(e.target.files[0]); e.target.value = '' }
function onDrop (e) { dragging.value = false; scan(e.dataTransfer.files[0]) }
function onPaste (e) {
  if (mode.value !== 'read') return
  const item = [...(e.clipboardData?.items || [])].find((i) => i.type.startsWith('image/'))
  if (item) { e.preventDefault(); scan(item.getAsFile()) }
}

onMounted(() => {
  window.addEventListener('paste', onPaste)
  const h = takeHandoff()
  if (h != null) { mode.value = 'generate'; text.value = h }
  nextTick(render)
})
onBeforeUnmount(() => {
  window.removeEventListener('paste', onPaste)
  if (scanSrc.value) URL.revokeObjectURL(scanSrc.value)
})
</script>

<style scoped>
.opt { display: inline-flex; align-items: center; gap: 8px; font-size: 0.8125rem; color: var(--label-2); }
.opt__field { width: auto; min-height: 32px; border-radius: 999px; font-size: 0.8125rem; }
@media (pointer: coarse) { .opt__field { min-height: 44px; } }
.swatch {
  width: 32px; height: 32px; padding: 0; border: 0; border-radius: 999px; background: none; cursor: pointer;
  box-shadow: 0 0 0 0.5px var(--separator-opaque);
}
.swatch::-webkit-color-swatch-wrapper { padding: 0; }
.swatch::-webkit-color-swatch { border: 0; border-radius: 999px; }
.swatch::-moz-color-swatch { border: 0; border-radius: 999px; }
@media (pointer: coarse) { .swatch { width: 44px; height: 44px; } }

.qr { display: flex; flex-direction: column; min-height: 260px; min-width: 0; overflow: hidden; transition: box-shadow 160ms ease; }
.qr--over { box-shadow: inset 0 0 0 2px var(--tint); }
.qr__bar { display: flex; align-items: center; gap: 8px; min-height: 46px; padding: 8px 8px 6px 16px; }
.qr__label { font-size: 0.9375rem; font-weight: 600; letter-spacing: -0.015em; }
.qr__spacer { flex: 1; }
.qr__body { flex: 1; min-height: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 0 12px 16px; }
.qr__canvas { width: min(100%, 320px); height: auto; aspect-ratio: 1; border-radius: 12px; image-rendering: pixelated; box-shadow: 0 0 0 0.5px var(--separator); }
.qr__scan { max-width: 100%; max-height: 50vh; object-fit: contain; border-radius: 12px; }
.empty { flex: 1; align-self: stretch; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 28px 16px; text-align: center; color: var(--label-2); }
.empty--dashed { border: 1.5px dashed var(--separator-opaque); border-radius: 16px; }
.empty .t-headline { color: var(--label); }
.empty .btn { margin-top: 8px; }
.warn { display: flex; align-items: center; gap: 6px; margin: 0; color: var(--warning-text); font-size: 0.8125rem; font-weight: 500; text-align: left; }
</style>
