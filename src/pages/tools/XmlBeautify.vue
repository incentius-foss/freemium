<template>
  <TransformTool
    :transform="transform"
    :options="options"
    :sample="sample"
    accept=".xml,.svg,.plist,.rss,.atom,.xsd,.wsdl,text/xml,application/xml,text/plain"
    :download="(o) => (o.mode === 'minify' ? 'document.min.xml' : 'document.xml')"
  />
</template>

<script setup>
import vkbeautify from 'vkbeautify'
import TransformTool from '@/components/TransformTool.vue'

const options = [
  { key: 'mode', type: 'segmented', label: 'Mode', default: 'beautify', options: [{ value: 'beautify', label: 'Beautify' }, { value: 'minify', label: 'Minify' }] },
  { key: 'indent', type: 'select', label: 'Indent', default: '2', options: [{ value: '2', label: '2 spaces' }, { value: '4', label: '4 spaces' }, { value: 'tab', label: 'Tabs' }] },
  { key: 'comments', type: 'toggle', label: 'Keep comments when minifying', default: true },
  { key: 'validate', type: 'toggle', label: 'Validate', default: true },
]

const sample = '<?xml version="1.0" encoding="UTF-8"?><catalog><!-- Books --><book id="bk101"><author>Gambardella, Matthew</author><title>XML Developer\'s Guide</title><price currency="USD">44.95</price></book><book id="bk102"><author>Ralls, Kim</author><title>Midnight Rain</title><price currency="USD">5.95</price></book></catalog>'

function validate (input) {
  if (typeof DOMParser === 'undefined') return
  const doc = new DOMParser().parseFromString(input, 'application/xml')
  const err = doc.querySelector('parsererror')
  if (err) {
    const text = (err.textContent || 'Invalid XML').replace(/\s+/g, ' ').trim()
    throw new Error(text.replace(/^This page contains the following errors:\s*/i, '').replace(/Below is a rendering.*$/i, '').trim())
  }
}

function transform (input, o) {
  if (o.validate) validate(input)
  if (o.mode === 'minify') return vkbeautify.xmlmin(input, o.comments)
  return vkbeautify.xml(input, o.indent === 'tab' ? '\t' : Number(o.indent))
}
</script>
