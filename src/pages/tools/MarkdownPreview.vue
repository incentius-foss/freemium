<template>
  <TransformTool
    :transform="transform"
    :options="options"
    :sample="sample"
    input-label="Markdown"
    accept=".md,.markdown,text/markdown,text/plain"
    placeholder="# Write Markdown here…"
  >
    <template #output="{ output, error }">
      <section class="card preview" aria-labelledby="md-preview-title">
        <header class="preview__bar">
          <h2 id="md-preview-title" class="t-subhead t-semibold">Preview</h2>
          <span class="preview__spacer" />
          <button class="icon-btn icon-btn--sm" type="button" aria-label="Download HTML" title="Download HTML" :disabled="!output" @click="downloadText(output, 'document.html', 'text/html')">
            <AppIcon name="download" :size="18" />
          </button>
          <button class="btn btn--sm" :class="output ? 'btn--prominent' : ''" type="button" :disabled="!output" @click="copyText(output, 'HTML copied')">
            <AppIcon name="copy" :size="16" />Copy HTML
          </button>
        </header>
        <p v-if="error" class="preview__error" role="status"><AppIcon name="warning" :size="16" />{{ error }}</p>
        <!-- Sanitized with DOMPurify before rendering -->
        <article v-else-if="output" class="prose" v-html="output" />
        <p v-else class="preview__empty t-footnote t-secondary">The rendered document appears here.</p>
      </section>
    </template>
  </TransformTool>
</template>

<script setup>
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import TransformTool from '@/components/TransformTool.vue'
import AppIcon from '@/components/AppIcon.vue'
import { copyText, downloadText } from '@/composables/clipboard'

const options = [
  { key: 'breaks', type: 'toggle', label: 'Line breaks as <br>', default: false },
]

const sample = `# Freemium

A **developer toolbox** that runs *entirely* in your browser.

## Features

- [x] JSON, YAML and CSV converters
- [x] JWT debugger
- [ ] Your next favorite tool

| Tool | Category |
| --- | --- |
| Regex Tester | Inspect |
| Hash Generator | Generate |

> Nothing you paste leaves your device.

\`\`\`js
const greeting = 'Hello, Freemium'
console.log(greeting)
\`\`\`

Visit [the repository](https://github.com/incentius-foss/freemium).
`

function transform (input, o) {
  const html = marked.parse(input, { gfm: true, breaks: o.breaks, async: false })
  // GFM task-list checkboxes get an accessible name that carries their state.
  return DOMPurify.sanitize(html).replace(/<input([^>]*type="checkbox"[^>]*)>/g, (m, attrs) =>
    `<input${attrs} aria-label="${/checked/.test(attrs) ? 'Done' : 'Not done'}">`)
}
</script>

<style scoped>
.preview { display: flex; flex-direction: column; min-width: 0; min-height: 260px; overflow: hidden; }
.preview__bar { display: flex; align-items: center; gap: 4px; padding: 8px 8px 6px 16px; min-height: 46px; }
.preview__spacer { flex: 1; }
.preview__empty { padding: 10px 16px; }
.preview__error { display: flex; gap: 6px; padding: 10px 16px; color: var(--danger-text); font-size: 0.8125rem; }

.prose {
  flex: 1; overflow: auto; padding: 4px 20px 20px;
  font-size: 1rem; line-height: 1.6; letter-spacing: -0.01em; color: var(--label); overflow-wrap: anywhere;
}
.prose :deep(h1) { font-size: 1.75rem; font-weight: 700; line-height: 1.2; margin: 0.6em 0 0.4em; }
.prose :deep(h2) { font-size: 1.375rem; font-weight: 700; line-height: 1.25; margin: 1.2em 0 0.4em; padding-bottom: 0.25em; border-bottom: 0.5px solid var(--separator); }
.prose :deep(h3) { font-size: 1.125rem; font-weight: 600; margin: 1.1em 0 0.3em; }
.prose :deep(h4), .prose :deep(h5), .prose :deep(h6) { font-size: 1rem; font-weight: 600; margin: 1em 0 0.3em; }
.prose :deep(p) { margin: 0.6em 0; }
.prose :deep(ul), .prose :deep(ol) { margin: 0.6em 0; padding-left: 1.5em; }
.prose :deep(li) { margin: 0.2em 0; }
.prose :deep(li:has(> input[type="checkbox"])) { list-style: none; margin-left: -1.4em; }
.prose :deep(input[type="checkbox"]) { margin-right: 0.4em; accent-color: var(--tint); }
.prose :deep(a) { color: var(--tint-text); text-decoration: underline; text-underline-offset: 2px; }
.prose :deep(blockquote) { margin: 0.8em 0; padding: 0.2em 1em; border-left: 3px solid var(--separator-opaque); color: var(--label-2); }
.prose :deep(code) { font-family: var(--font-mono); font-size: 0.85em; padding: 0.1em 0.35em; border-radius: 6px; background: var(--fill-3); letter-spacing: 0; }
.prose :deep(pre) { margin: 0.8em 0; padding: 12px 14px; border-radius: var(--radius-field); background: var(--bg-3); overflow: auto; }
.prose :deep(pre code) { padding: 0; background: none; font-size: 0.8125rem; }
.prose :deep(table) { border-collapse: collapse; margin: 0.8em 0; font-size: 0.9375rem; display: block; overflow-x: auto; }
.prose :deep(th), .prose :deep(td) { padding: 6px 12px; border: 0.5px solid var(--separator); text-align: left; }
.prose :deep(th) { background: var(--fill-4); font-weight: 600; }
.prose :deep(hr) { border: 0; border-top: 0.5px solid var(--separator); margin: 1.5em 0; }
.prose :deep(img) { max-width: 100%; border-radius: 8px; }
</style>
