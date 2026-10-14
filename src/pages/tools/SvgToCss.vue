<template>
  <TransformTool
    :transform="transform"
    :options="options"
    :sample="sample"
    input-label="SVG"
    output-label="CSS"
    accept=".svg,image/svg+xml"
    download="svg-background.css"
  >
    <template #below="{ output }">
      <section v-if="dataUri(output)" class="preview card" aria-label="Preview">
        <h2 class="t-subhead t-semibold">Preview</h2>
        <div class="preview__row">
          <div class="preview__swatch preview__swatch--light" :style="{ backgroundImage: `url(&quot;${dataUri(output)}&quot;)` }" role="img" aria-label="SVG on a light background" />
          <div class="preview__swatch preview__swatch--dark" :style="{ backgroundImage: `url(&quot;${dataUri(output)}&quot;)` }" role="img" aria-label="SVG on a dark background" />
          <p class="t-footnote t-secondary">{{ size(output) }}</p>
        </div>
      </section>
    </template>
  </TransformTool>
</template>

<script setup>
import TransformTool from '@/components/TransformTool.vue'

const options = [
  { key: 'encoding', type: 'segmented', label: 'Encoding', default: 'url', options: [{ value: 'url', label: 'URL-encoded' }, { value: 'base64', label: 'Base64' }] },
  {
    key: 'output', type: 'select', label: 'Output', default: 'background',
    options: [{ value: 'background', label: 'background-image' }, { value: 'mask', label: 'mask-image' }, { value: 'uri', label: 'Data URI only' }],
  },
]

const sample = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0088FF" stroke-width="2" stroke-linecap="round">
  <path d="m8 7-5 5 5 5M16 7l5 5-5 5"/>
</svg>`

// Only the characters that break a CSS url("…") or the data URI get escaped (smaller than encodeURIComponent).
function urlEncode (svg) {
  return svg
    .replace(/"/g, "'")
    .replace(/%/g, '%25')
    .replace(/#/g, '%23')
    .replace(/</g, '%3C')
    .replace(/>/g, '%3E')
    .replace(/\{/g, '%7B')
    .replace(/\}/g, '%7D')
    .replace(/\s+/g, ' ')
}

function transform (input, o) {
  let svg = input.trim().replace(/<\?xml[^>]*>\s*/i, '').replace(/<!--[\s\S]*?-->/g, '')
  if (!/^<svg[\s>]/i.test(svg)) throw new Error('Input must start with an <svg> element.')
  if (!/xmlns=/.test(svg)) svg = svg.replace(/^<svg/i, '<svg xmlns="http://www.w3.org/2000/svg"')
  svg = svg.replace(/>\s+</g, '><')
  const uri = o.encoding === 'base64'
    ? `data:image/svg+xml;base64,${btoa(String.fromCharCode(...new TextEncoder().encode(svg)))}`
    : `data:image/svg+xml,${urlEncode(svg)}`
  if (o.output === 'uri') return uri
  if (o.output === 'mask') return `-webkit-mask-image: url("${uri}");\nmask-image: url("${uri}");\nbackground-color: currentColor;`
  return `background-image: url("${uri}");`
}

function dataUri (output) {
  const m = /data:image\/svg\+xml[^"]*/.exec(output || '')
  return m ? m[0] : ''
}
function size (output) {
  return `${new TextEncoder().encode(output).length.toLocaleString()} bytes of CSS`
}
</script>

<style scoped>
.preview { padding: 14px 16px; }
.preview__row { display: flex; align-items: center; gap: 12px; margin-top: 10px; flex-wrap: wrap; }
.preview__swatch {
  width: 96px; height: 96px; border-radius: 14px;
  background-repeat: no-repeat; background-position: center; background-size: 60%;
  box-shadow: inset 0 0 0 0.5px var(--separator);
}
.preview__swatch--light { background-color: #fff; }
.preview__swatch--dark { background-color: #1c1c1e; }
</style>
