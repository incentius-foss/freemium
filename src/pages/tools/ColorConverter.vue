<template>
  <ToolPage>
    <section class="card input-card">
      <label class="label" for="color-input">Color</label>
      <div class="input-row">
        <label class="picker" :style="{ '--c': color ? cssColor : 'transparent' }" title="Pick a color">
          <span class="sr-only">Pick a color</span>
          <input type="color" :value="color ? hex6 : '#000000'" @input="input = $event.target.value" />
        </label>
        <input
          id="color-input"
          v-model="input"
          class="field t-mono"
          type="text"
          placeholder="#0088FF, rgb(0 136 255), hsl(208 100% 50%), oklch(…), rebeccapurple"
          spellcheck="false"
          autocomplete="off"
          autocapitalize="off"
          :aria-invalid="!!error"
          aria-describedby="color-status"
        />
      </div>
      <p id="color-status" class="status t-footnote" role="status">
        <span v-if="error" class="status--err"><AppIcon name="warning" :size="14" />{{ error }}</span>
        <span v-else class="t-secondary">Accepts any CSS color: hex, rgb, hsl, hwb, lab, oklch or a named color.</span>
      </p>
    </section>

    <div v-if="color" class="split">
      <section class="card swatch-card" aria-labelledby="swatch-title">
        <h2 id="swatch-title" class="sr-only">Preview and contrast</h2>
        <div class="swatch" :style="{ '--c': cssColor }">
          <span class="swatch__sample" style="color: #fff">Aa White text</span>
          <span class="swatch__sample" style="color: #000">Aa Black text</span>
        </div>
        <ul class="inset-list nested contrast" role="list" aria-label="WCAG contrast">
          <li v-for="c in contrast" :key="c.label" class="row">
            <span class="row__label t-subhead">vs {{ c.label }} <span class="t-mono t-semibold">{{ c.ratio.toFixed(2) }}:1</span></span>
            <span class="badges">
              <span v-for="b in c.checks" :key="b.name" class="badge" :class="b.pass ? 'badge--ok' : 'badge--err'">
                <AppIcon :name="b.pass ? 'check' : 'xmark'" :size="12" :weight="2.6" />{{ b.name }}
              </span>
            </span>
          </li>
        </ul>
        <p class="t-caption t-secondary note">AA needs 4.5:1 (3:1 for large or bold text); AAA needs 7:1.</p>
      </section>

      <ul class="inset-list" role="list" aria-label="Color formats">
        <li v-for="r in rows" :key="r.label" class="row">
          <span class="row__label t-subhead">{{ r.label }}</span>
          <span class="row__value">{{ r.value }}</span>
          <button class="icon-btn icon-btn--sm" type="button" :aria-label="`Copy ${r.label}`" title="Copy" @click="copyText(r.value)">
            <AppIcon name="copy" :size="16" />
          </button>
        </li>
      </ul>
    </div>
  </ToolPage>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import ToolPage from '@/components/ToolPage.vue'
import AppIcon from '@/components/AppIcon.vue'
import { copyText } from '@/composables/clipboard'
import { takeHandoff } from '@/composables/useHandoff'
import { load, save } from '@/composables/storage'

const input = ref(load('freemium:color', '#0088FF'))
watch(input, (v) => save('freemium:color', v))
onMounted(() => {
  const handed = takeHandoff()
  if (handed != null) input.value = handed.trim()
})

// ── Parsing ────────────────────────────────────────────────────────
const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))

function parseAlpha (a) {
  if (a == null || a === '') return 1
  return clamp(a.endsWith('%') ? parseFloat(a) / 100 : parseFloat(a))
}
function parseHue (h) {
  const n = parseFloat(h)
  if (h.endsWith('turn')) return n * 360
  if (h.endsWith('rad')) return (n * 180) / Math.PI
  if (h.endsWith('grad')) return n * 0.9
  return n
}
function hslToRgb (h, s, l) {
  h = ((h % 360) + 360) % 360
  const k = (n) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [f(0), f(8), f(4)]
}

function parseManual (str) {
  const s = str.trim().toLowerCase()
  let m = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(s)
  if (m) {
    let h = m[1]
    if (h.length <= 4) h = [...h].map((c) => c + c).join('')
    const n = (i) => parseInt(h.slice(i, i + 2), 16) / 255
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) : 1 }
  }
  m = /^(rgba?|hsla?|hwb)\((.*)\)$/.exec(s)
  if (!m) return null
  const args = m[2].replace(/\s*\/\s*/, ' / ').split(/[\s,]+/).filter(Boolean)
  const slash = args.indexOf('/')
  let alpha = null
  if (slash >= 0) { alpha = args[slash + 1]; args.splice(slash) } else if (args.length === 4) alpha = args.pop()
  if (args.length !== 3) return null
  const fn = m[1]
  if (fn.startsWith('rgb')) {
    const [r, g, b] = args.map((v) => clamp(v.endsWith('%') ? parseFloat(v) / 100 : parseFloat(v) / 255))
    return [r, g, b].some(Number.isNaN) ? null : { r, g, b, a: parseAlpha(alpha) }
  }
  const h = parseHue(args[0])
  const x = clamp(parseFloat(args[1]) / 100)
  const y = clamp(parseFloat(args[2]) / 100)
  if ([h, x, y].some(Number.isNaN)) return null
  let rgb
  if (fn === 'hwb') {
    if (x + y >= 1) { const gray = x / (x + y); rgb = [gray, gray, gray] } else rgb = hslToRgb(h, 1, 0.5).map((c) => c * (1 - x - y) + x)
  } else rgb = hslToRgb(h, x, y)
  return { r: rgb[0], g: rgb[1], b: rgb[2], a: parseAlpha(alpha) }
}

// Anything else the browser understands (named, lab, oklch, color()) via a 1×1 canvas.
let ctx = null
function parseWithCanvas (str) {
  if (typeof CSS === 'undefined' || !CSS.supports('color', str)) return null
  if (!ctx) {
    const c = document.createElement('canvas')
    c.width = c.height = 1
    ctx = c.getContext('2d', { willReadFrequently: true })
  }
  ctx.clearRect(0, 0, 1, 1)
  ctx.fillStyle = '#000'
  ctx.fillStyle = str
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
  return { r: r / 255, g: g / 255, b: b / 255, a: a / 255 }
}

const color = computed(() => {
  const s = input.value.trim()
  if (!s) return null
  return parseManual(s) || parseWithCanvas(s)
})
const error = computed(() => (input.value.trim() && !color.value ? 'That isn’t a color this browser can read.' : ''))

// ── Conversions ────────────────────────────────────────────────────
const to255 = (v) => Math.round(clamp(v) * 255)
const hx = (v) => to255(v).toString(16).padStart(2, '0').toUpperCase()
const r3 = (v, d = 3) => Number(v.toFixed(d))

function rgbToHsl ({ r, g, b }) {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const d = max - min
  let h = 0
  let s = 0
  if (d) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
    h *= 60
  }
  return { h, s, l }
}

function rgbToOklch ({ r, g, b }) {
  const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  const [R, G, B] = [lin(r), lin(g), lin(b)]
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B)
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B)
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B)
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const Bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  const C = Math.sqrt(A * A + Bb * Bb)
  let H = (Math.atan2(Bb, A) * 180) / Math.PI
  if (H < 0) H += 360
  return { L, C, H: C < 0.0001 ? 0 : H }
}

const luminance = ({ r, g, b }) => {
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

const hex6 = computed(() => (color.value ? `#${hx(color.value.r)}${hx(color.value.g)}${hx(color.value.b)}` : ''))
const cssColor = computed(() => {
  const c = color.value
  return c ? `rgb(${to255(c.r)} ${to255(c.g)} ${to255(c.b)} / ${r3(c.a, 2)})` : 'transparent'
})

const rows = computed(() => {
  const c = color.value
  if (!c) return []
  const a = r3(c.a, 2)
  const alpha = a < 1 ? ` / ${a}` : ''
  const { h, s, l } = rgbToHsl(c)
  const max = Math.max(c.r, c.g, c.b)
  const min = Math.min(c.r, c.g, c.b)
  const ok = rgbToOklch(c)
  const pct = (v) => `${r3(v * 100, 1)}%`
  const argb = `${hx(c.a)}${hx(c.r)}${hx(c.g)}${hx(c.b)}`
  return [
    { label: 'HEX', value: hex6.value },
    { label: 'HEX8', value: `${hex6.value}${hx(c.a)}` },
    { label: 'RGB', value: `rgb(${to255(c.r)} ${to255(c.g)} ${to255(c.b)}${alpha})` },
    { label: 'HSL', value: `hsl(${r3(h, 1)} ${pct(s)} ${pct(l)}${alpha})` },
    { label: 'HWB', value: `hwb(${r3(h, 1)} ${pct(min)} ${pct(1 - max)}${alpha})` },
    { label: 'OKLCH', value: `oklch(${r3(ok.L * 100, 2)}% ${r3(ok.C, 4)} ${r3(ok.H, 2)}${alpha})` },
    { label: 'SwiftUI', value: `Color(red: ${r3(c.r)}, green: ${r3(c.g)}, blue: ${r3(c.b)}, opacity: ${a})` },
    { label: 'UIKit', value: `UIColor(red: ${r3(c.r)}, green: ${r3(c.g)}, blue: ${r3(c.b)}, alpha: ${a})` },
    { label: 'Jetpack Compose', value: `Color(0x${argb})` },
    { label: 'Android XML', value: `#${argb}` },
  ]
})

const contrast = computed(() => {
  const c = color.value
  if (!c) return []
  const L = luminance(c)
  const make = (label, other) => {
    const ratio = (Math.max(L, other) + 0.05) / (Math.min(L, other) + 0.05)
    return {
      label,
      ratio,
      checks: [
        { name: 'AA', pass: ratio >= 4.5 },
        { name: 'AA Large', pass: ratio >= 3 },
        { name: 'AAA', pass: ratio >= 7 },
      ],
    }
  }
  return [make('white', 1), make('black', 0)]
})
</script>

<style scoped>
.input-card { padding: 14px 16px; }
.input-row { display: flex; gap: 10px; align-items: center; }
.input-row .field { font-size: 1rem; }
.picker {
  position: relative; flex: none; width: var(--hit); height: var(--hit); border-radius: 999px; cursor: pointer;
  background:
    linear-gradient(var(--c), var(--c)),
    repeating-conic-gradient(#ccc 0 25%, #fff 0 50%) 0 0 / 10px 10px;
  box-shadow: inset 0 0 0 1px var(--separator);
}
.picker:focus-within { box-shadow: var(--focus-ring); }
.picker input { position: absolute; inset: 0; opacity: 0; width: 100%; height: 100%; cursor: pointer; }
.status { margin-top: 8px; }
.status--err { display: inline-flex; align-items: center; gap: 6px; color: var(--danger-text); font-weight: 500; }

.swatch-card { padding: 12px; display: flex; flex-direction: column; gap: 12px; min-width: 0; }
.swatch {
  min-height: 160px; border-radius: 14px; display: flex; flex-direction: column; justify-content: flex-end; gap: 4px; padding: 16px;
  box-shadow: inset 0 0 0 0.5px var(--separator);
  background:
    linear-gradient(var(--c), var(--c)),
    repeating-conic-gradient(#ccc 0 25%, #fff 0 50%) 0 0 / 16px 16px;
}
.swatch__sample { font-size: 1.25rem; font-weight: 600; }
.nested { background: var(--bg-3); }
.nested > * + * { box-shadow: inset 0 0.5px 0 0 var(--separator); }
.contrast .row { flex-wrap: wrap; }
.badges { display: flex; flex-wrap: wrap; gap: 4px; }
.note { margin: 0 4px; }
@media (max-width: 560px) {
  .row { flex-wrap: wrap; }
  .row__label { flex-basis: 100%; }
}
</style>
