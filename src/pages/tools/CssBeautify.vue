<template>
  <TransformTool
    :transform="transform"
    :options="options"
    :sample="sample"
    accept=".css,.scss,.less,.sass,text/css,text/plain"
    :download="(o) => `styles${o.mode === 'minify' ? '.min' : ''}.${o.lang}`"
  />
</template>

<script setup>
import beautify from 'js-beautify'
import TransformTool from '@/components/TransformTool.vue'

const options = [
  { key: 'mode', type: 'segmented', label: 'Mode', default: 'beautify', options: [{ value: 'beautify', label: 'Beautify' }, { value: 'minify', label: 'Minify' }] },
  { key: 'lang', type: 'segmented', label: 'Language', default: 'css', options: [{ value: 'css', label: 'CSS' }, { value: 'scss', label: 'SCSS' }, { value: 'less', label: 'LESS' }] },
  { key: 'indent', type: 'select', label: 'Indent', default: '2', options: [{ value: '2', label: '2 spaces' }, { value: '4', label: '4 spaces' }, { value: 'tab', label: 'Tabs' }] },
  { key: 'comments', type: 'toggle', label: 'Keep comments when minifying', default: false },
]

const sample = "@font-face{font-family:Chunkfive;src:url('Chunkfive.otf')}body,.usertext{color:#F0F0F0;background:#600;font-family:Chunkfive,sans}/* print styles */@import url('print.css');@media print{a[href^=http]:after{content:attr(href)}}"

// Minifier that keeps strings, url() and SCSS/LESS line comments intact.
function minify (src, keepComments) {
  let out = ''
  let i = 0
  while (i < src.length) {
    const c = src[i]
    if (c === '"' || c === "'") {
      let j = i + 1
      while (j < src.length && src[j] !== c) j += src[j] === '\\' ? 2 : 1
      out += src.slice(i, j + 1); i = j + 1; continue
    }
    if (c === '/' && src[i + 1] === '*') {
      const end = src.indexOf('*/', i + 2)
      const stop = end === -1 ? src.length : end + 2
      if (keepComments || src[i + 2] === '!') out += src.slice(i, stop)
      i = stop; continue
    }
    if (c === '/' && src[i + 1] === '/' && (i === 0 || /[\s;{}]/.test(src[i - 1]))) {
      // SCSS/LESS line comment (not inside url(), which is handled because of the preceding-char check)
      const end = src.indexOf('\n', i)
      i = end === -1 ? src.length : end; continue
    }
    if (/\s/.test(c)) {
      while (i < src.length && /\s/.test(src[i])) i++
      const prev = out[out.length - 1]
      const next = src[i]
      if (prev && next && !/[{};:,>~+(]/.test(prev) && !/[{};:,>~)!]/.test(next)) out += ' '
      continue
    }
    out += c; i++
  }
  return out.replace(/;}/g, '}').trim()
}

function transform (input, o) {
  if (o.mode === 'minify') return minify(input, o.comments)
  return beautify.css(input, {
    indent_size: o.indent === 'tab' ? 1 : Number(o.indent),
    indent_char: o.indent === 'tab' ? '\t' : ' ',
    selector_separator_newline: true,
    newline_between_rules: true,
    space_around_combinator: true,
  })
}
</script>
