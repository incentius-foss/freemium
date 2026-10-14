<template>
  <TransformTool
    :transform="transform"
    :options="options"
    :sample="sample"
    accept=".js,.mjs,.cjs,.ts,.jsx,.tsx,.json,text/javascript,text/plain"
    :download="(o) => (o.mode === 'minify' ? 'script.min.js' : 'script.js')"
  />
</template>

<script setup>
import beautify from 'js-beautify'
import TransformTool from '@/components/TransformTool.vue'

const options = [
  { key: 'mode', type: 'segmented', label: 'Mode', default: 'beautify', options: [{ value: 'beautify', label: 'Beautify' }, { value: 'minify', label: 'Minify' }] },
  { key: 'indent', type: 'select', label: 'Indent', default: '2', options: [{ value: '2', label: '2 spaces' }, { value: '4', label: '4 spaces' }, { value: 'tab', label: 'Tabs' }] },
  { key: 'braceStyle', type: 'select', label: 'Braces', default: 'collapse', options: [{ value: 'collapse', label: 'Same line' }, { value: 'expand', label: 'New line' }, { value: 'end-expand', label: 'End expand' }] },
  { key: 'keepArrays', type: 'toggle', label: 'Keep array indentation', default: false },
]

const sample = "const greet=(name)=>{if(!name){return 'Hello, world'}// say hi\nreturn `Hello, ${name}!`};function sum(a,b){return a+b}console.log(greet('Freemium'),sum(1,2),/ab+c/i.test('abbc'))"

const WORD = /[\w$\u0080-￿]/
// Whitespace/comment stripper. Conservative: keeps one newline where the source had one
// (so automatic semicolon insertion still works) and understands strings, templates and regex.
function minify (src) {
  let out = ''
  let i = 0
  let pendingSpace = false
  let pendingNewline = false
  const lastSignificant = () => out.replace(/\s+$/, '').slice(-1)
  const regexAllowed = () => {
    const prev = lastSignificant()
    if (!prev) return true
    if (/[(,=:[!&|?{};+\-*%<>~^]/.test(prev)) return true
    const word = /([\w$]+)\s*$/.exec(out)
    return !!word && /^(return|typeof|instanceof|in|of|new|delete|void|throw|case|do|else|yield|await)$/.test(word[1])
  }
  const emit = (text) => {
    if (pendingNewline) out += '\n'
    else if (pendingSpace && WORD.test(out.slice(-1)) && WORD.test(text[0])) out += ' '
    else if (pendingSpace && /[+-]/.test(out.slice(-1)) && out.slice(-1) === text[0]) out += ' '
    pendingSpace = pendingNewline = false
    out += text
  }
  while (i < src.length) {
    const c = src[i]
    const n = src[i + 1]
    if (c === '/' && n === '/') { const e = src.indexOf('\n', i); i = e === -1 ? src.length : e; continue }
    if (c === '/' && n === '*') {
      const e = src.indexOf('*/', i + 2)
      const body = src.slice(i, e === -1 ? src.length : e + 2)
      if (body.startsWith('/*!')) emit(body)
      else if (body.includes('\n')) pendingNewline = !!out
      else pendingSpace = true
      i = e === -1 ? src.length : e + 2; continue
    }
    if (/\s/.test(c)) {
      while (i < src.length && /\s/.test(src[i])) {
        if (src[i] === '\n') pendingNewline = !!out
        i++
      }
      if (!pendingNewline) pendingSpace = true
      // A newline is only needed when ASI could apply; drop it after/before obvious continuations.
      if (pendingNewline && (/[{(,;:=&|?+\-*/%<>[!]$/.test(lastSignificant()) || /^[})\],;:.?=&|]/.test(src[i] || ''))) {
        pendingNewline = false
        pendingSpace = true
      }
      continue
    }
    if (c === '"' || c === "'" || c === '`') {
      let j = i + 1
      while (j < src.length && src[j] !== c) j += src[j] === '\\' ? 2 : 1
      emit(src.slice(i, j + 1)); i = j + 1; continue
    }
    if (c === '/' && regexAllowed()) {
      let j = i + 1
      let inClass = false
      while (j < src.length && (inClass || src[j] !== '/')) {
        if (src[j] === '\\') j++
        else if (src[j] === '[') inClass = true
        else if (src[j] === ']') inClass = false
        else if (src[j] === '\n') throw new Error('Unterminated regular expression literal')
        j++
      }
      j++
      while (j < src.length && /[a-z]/i.test(src[j])) j++
      emit(src.slice(i, j)); i = j; continue
    }
    emit(c); i++
  }
  return out.trim()
}

function transform (input, o) {
  if (o.mode === 'minify') return minify(input)
  return beautify.js(input, {
    indent_size: o.indent === 'tab' ? 1 : Number(o.indent),
    indent_char: o.indent === 'tab' ? '\t' : ' ',
    brace_style: o.braceStyle,
    keep_array_indentation: o.keepArrays,
    space_in_empty_paren: false,
    end_with_newline: false,
  })
}
</script>
