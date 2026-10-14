<template>
  <TransformTool
    :transform="transform"
    :options="options"
    :sample="sample"
    accept=".html,.htm,.svg,text/html,text/plain"
    output-label="JSX"
    :download="(o) => (o.wrap ? `${o.name || 'Component'}.jsx` : 'markup.jsx')"
  />
</template>

<script setup>
import TransformTool from '@/components/TransformTool.vue'

const options = [
  { key: 'wrap', type: 'toggle', label: 'Wrap in component', default: false },
  { key: 'name', type: 'text', label: 'Component name', default: 'MyComponent', placeholder: 'MyComponent', width: '160px' },
  { key: 'indent', type: 'select', label: 'Indent', default: '2', options: [{ value: '2', label: '2 spaces' }, { value: '4', label: '4 spaces' }] },
]

const sample = `<!-- Signup form -->
<form class="signup" onsubmit="handleSubmit(event)">
  <label for="email" class="label">Email</label>
  <input id="email" type="email" tabindex="1" maxlength="80" value="me@example.com" required autofocus>
  <textarea rows="3" readonly>Hello {name}</textarea>
  <div style="display: flex; margin-top: 8px; -webkit-user-select: none; --accent: #0088FF">
    <button type="submit" class="btn btn--primary" disabled>Sign up</button>
  </div>
  <svg width="16" height="16" viewBox="0 0 24 24"><path stroke-width="2" stroke-linecap="round" fill-rule="evenodd" d="M4 12h16"/></svg>
  <br>
</form>`

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'])

// HTML attribute → React prop, for names that aren't a simple dash-to-camel conversion.
const ATTR = {
  class: 'className', for: 'htmlFor', tabindex: 'tabIndex', readonly: 'readOnly', maxlength: 'maxLength',
  minlength: 'minLength', colspan: 'colSpan', rowspan: 'rowSpan', contenteditable: 'contentEditable',
  crossorigin: 'crossOrigin', autocomplete: 'autoComplete', autofocus: 'autoFocus', autoplay: 'autoPlay',
  enctype: 'encType', frameborder: 'frameBorder', srcset: 'srcSet', srcdoc: 'srcDoc', usemap: 'useMap',
  accesskey: 'accessKey', novalidate: 'noValidate', spellcheck: 'spellCheck', datetime: 'dateTime',
  'http-equiv': 'httpEquiv', 'accept-charset': 'acceptCharset', cellpadding: 'cellPadding', cellspacing: 'cellSpacing',
  allowfullscreen: 'allowFullScreen', playsinline: 'playsInline', inputmode: 'inputMode', charset: 'charSet',
  formaction: 'formAction', formmethod: 'formMethod', formnovalidate: 'formNoValidate', formtarget: 'formTarget',
  hreflang: 'hrefLang', marginheight: 'marginHeight', marginwidth: 'marginWidth', referrerpolicy: 'referrerPolicy',
  enterkeyhint: 'enterKeyHint', fetchpriority: 'fetchPriority', popovertarget: 'popoverTarget',
  'xlink:href': 'xlinkHref', 'xml:lang': 'xmlLang', 'xml:space': 'xmlSpace', 'xmlns:xlink': 'xmlnsXlink',
  viewbox: 'viewBox', preserveaspectratio: 'preserveAspectRatio',
}
const BOOLEAN = new Set(['allowfullscreen', 'async', 'autofocus', 'autoplay', 'checked', 'controls', 'default', 'defer',
  'disabled', 'formnovalidate', 'hidden', 'inert', 'loop', 'multiple', 'muted', 'novalidate', 'open', 'playsinline',
  'readonly', 'required', 'reversed', 'selected', 'itemscope'])

const camel = (s) => s.replace(/[-:]([a-z])/g, (_, c) => c.toUpperCase())

function propName (name) {
  const lower = name.toLowerCase()
  if (ATTR[lower]) return ATTR[lower]
  if (lower.startsWith('data-') || lower.startsWith('aria-')) return lower
  if (/^on[a-z]+$/.test(lower)) return 'on' + lower.charAt(2).toUpperCase() + lower.slice(3)
  return camel(name)
}

const quoteJs = (s) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`

function styleObject (css) {
  const entries = []
  for (const decl of css.split(';')) {
    const i = decl.indexOf(':')
    if (i < 0) continue
    const prop = decl.slice(0, i).trim()
    const value = decl.slice(i + 1).trim()
    if (!prop) continue
    let key
    if (prop.startsWith('--')) key = quoteJs(prop)
    else {
      key = camel(prop.toLowerCase())
      if (/^-(webkit|moz|o)-/i.test(prop)) key = key.charAt(0).toUpperCase() + key.slice(1)
      if (/^-ms-/i.test(prop)) key = key.charAt(0).toLowerCase() + key.slice(1)
    }
    const num = /^-?\d+(\.\d+)?$/.test(value) && value !== '0' ? value : null
    entries.push(`${key}: ${num ?? quoteJs(value)}`)
  }
  return `{{ ${entries.join(', ')} }}`
}

function attrJsx (el, attr) {
  const tag = el.localName.toLowerCase()
  let name = propName(attr.name)
  const value = attr.value
  if (attr.name === 'style') return `style=${styleObject(value)}`
  if (/^on[A-Z]/.test(name)) return `${name}={(event) => { ${value.trim().replace(/;\s*$/, '')} }}`
  if ((tag === 'input' || tag === 'select') && name === 'value') name = 'defaultValue'
  if (tag === 'input' && name === 'checked') name = 'defaultChecked'
  if (tag === 'option' && name === 'selected') return null // React sets selection on <select>
  if (BOOLEAN.has(attr.name.toLowerCase()) && (value === '' || value.toLowerCase() === attr.name.toLowerCase())) {
    return name
  }
  if (/^\d+(\.\d+)?$/.test(value) && /^(tabIndex|maxLength|minLength|rowSpan|colSpan|rows|cols|size|span)$/.test(name)) {
    return `${name}={${value}}`
  }
  return value.includes('"') ? `${name}={${quoteJs(value)}}` : `${name}="${value}"`
}

const escapeText = (t) => t.replace(/[{}<>]/g, (c) => `{'${c}'}`)

function render (node, depth, unit) {
  const pad = unit.repeat(depth)
  if (node.nodeType === 8) return `${pad}{/* ${node.data.trim().replace(/\*\//g, '* /')} */}`
  if (node.nodeType === 3) {
    const text = node.data.replace(/\s+/g, ' ')
    if (!text.trim()) return null
    // JSX drops whitespace at line breaks; keep meaningful spaces next to inline siblings.
    const lead = text.startsWith(' ') && node.previousSibling ? "{' '}" : ''
    const trail = text.endsWith(' ') && node.nextSibling ? "{' '}" : ''
    return pad + lead + escapeText(text.trim()) + trail
  }
  if (node.nodeType !== 1) return null
  const tag = node.namespaceURI === 'http://www.w3.org/2000/svg' ? node.localName : node.localName.toLowerCase()
  const attrs = Array.from(node.attributes).map((a) => attrJsx(node, a)).filter(Boolean)
  const open = attrs.length ? `<${tag} ${attrs.join(' ')}` : `<${tag}`

  // Raw-text elements: keep their content verbatim in a template literal.
  if (tag === 'script' || tag === 'style') {
    const body = node.textContent
    return body.trim() ? `${pad}${open}>{\`${body.replace(/`/g, '\\`').replace(/\$\{/g, '\\${')}\`}</${tag}>` : `${pad}${open} />`
  }
  if (tag === 'textarea') {
    const body = node.textContent
    return body ? `${pad}${open} defaultValue={${quoteJs(body)}} />` : `${pad}${open} />`
  }
  const children = Array.from(node.childNodes).map((c) => render(c, depth + 1, unit)).filter((c) => c != null)
  if (VOID.has(tag) || !children.length) return `${pad}${open} />`
  if (children.length === 1 && node.childNodes.length === 1 && node.firstChild.nodeType === 3) {
    const line = `${pad}${open}>${children[0].trim()}</${tag}>`
    if (line.length <= 100) return line
  }
  return `${pad}${open}>\n${children.join('\n')}\n${pad}</${tag}>`
}

function transform (input, o) {
  const unit = ' '.repeat(Number(o.indent) || 2)
  const isDocument = /<html[\s>]|<body[\s>]|<!doctype/i.test(input)
  let nodes
  if (isDocument) {
    const doc = new DOMParser().parseFromString(input, 'text/html')
    nodes = [doc.documentElement]
  } else {
    const tpl = document.createElement('template')
    tpl.innerHTML = input
    nodes = Array.from(tpl.content.childNodes)
  }
  const baseDepth = o.wrap ? 2 : 0
  const parts = nodes.map((n) => render(n, baseDepth + (nodes.length > 1 ? 1 : 0), unit)).filter((p) => p != null)
  if (!parts.length) throw new Error('No HTML elements found.')
  const pad = unit.repeat(baseDepth)
  const jsx = parts.length > 1 ? `${pad}<>\n${parts.join('\n')}\n${pad}</>` : parts[0]
  if (!o.wrap) return jsx
  const Name = (o.name || '').split(/[^\w$]+/).filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('').replace(/^\d+/, '') || 'MyComponent'
  return `export default function ${Name}() {\n${unit}return (\n${jsx}\n${unit});\n}\n`
}
</script>
