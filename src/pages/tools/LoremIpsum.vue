<template>
  <ToolPage fill>
    <template #options>
      <OptionControls v-model="opts" :options="options" />
      <button class="btn btn--sm btn--prominent" type="button" @click="seed++">
        <AppIcon name="dice" :size="16" />Regenerate
      </button>
    </template>

    <CodePane
      class="lorem-pane"
      :model-value="output"
      label="Placeholder text"
      :download="opts.html ? 'lorem.html' : 'lorem.txt'"
      readonly
    >
      <template #badge>
        <span class="badge">{{ summary }}</span>
      </template>
    </CodePane>
  </ToolPage>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import ToolPage from '@/components/ToolPage.vue'
import CodePane from '@/components/CodePane.vue'
import OptionControls from '@/components/OptionControls.vue'
import AppIcon from '@/components/AppIcon.vue'
import { load, save } from '@/composables/storage'

const options = [
  { key: 'unit', type: 'segmented', label: 'Unit', default: 'paragraphs', options: [{ value: 'paragraphs', label: 'Paragraphs' }, { value: 'sentences', label: 'Sentences' }, { value: 'words', label: 'Words' }] },
  { key: 'count', type: 'number', label: 'Count', default: 3, min: 1, max: 500 },
  { key: 'classic', type: 'toggle', label: 'Start with “Lorem ipsum”', default: true },
  { key: 'html', type: 'toggle', label: 'Wrap in <p> tags', default: false },
]

const KEY = 'freemium:opts:lorem-ipsum'
const defaults = Object.fromEntries(options.map((o) => [o.key, o.default]))
const opts = ref({ ...defaults, ...load(KEY, {}) })
watch(opts, (v) => save(KEY, v), { deep: true })
const seed = ref(0)

const WORDS = ('lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ' +
  'enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in ' +
  'reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui ' +
  'officia deserunt mollit anim id est laborum curabitur pretium tincidunt lacus nulla gravida orci a odio nullam varius turpis ' +
  'et commodo pharetra est eros bibendum elit nec luctus magna felis sollicitudin mauris integer dignissim viverra metus ' +
  'vestibulum ante primis faucibus ultrices posuere cubilia curae aliquam erat volutpat maecenas mattis sem quis tortor ' +
  'scelerisque sagittis semper justo vitae mollis felis porta proin quam').split(' ')
const CLASSIC = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'

const rand = (n) => Math.floor(Math.random() * n)
const pick = () => WORDS[rand(WORDS.length)]
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

function sentence () {
  const n = 7 + rand(10)
  const words = Array.from({ length: n }, pick)
  if (n > 9 && rand(2)) words[3 + rand(n - 6)] += ','
  return cap(words.join(' ')) + (rand(10) === 0 ? '?' : '.')
}
function paragraph () {
  return Array.from({ length: 4 + rand(4) }, sentence).join(' ')
}

const clampCount = (n) => Math.min(500, Math.max(1, Math.floor(Number(n) || 1)))

const output = computed(() => {
  void seed.value // regenerate dependency
  const { unit, classic, html } = opts.value
  const n = clampCount(opts.value.count)
  let parts
  if (unit === 'words') {
    const words = Array.from({ length: n }, pick)
    if (classic) CLASSIC.toLowerCase().replace(',', '').split(' ').slice(0, n).forEach((w, i) => { words[i] = w })
    const text = cap(words.join(' ')) + '.'
    return html ? `<p>${text}</p>` : text
  }
  if (unit === 'sentences') {
    parts = Array.from({ length: n }, sentence)
    if (classic) parts[0] = CLASSIC + '.'
    const text = parts.join(' ')
    return html ? `<p>${text}</p>` : text
  }
  parts = Array.from({ length: n }, paragraph)
  if (classic) parts[0] = `${CLASSIC}. ${parts[0]}`
  return html ? parts.map((p) => `<p>${p}</p>`).join('\n\n') : parts.join('\n\n')
})

const summary = computed(() => {
  const words = output.value.replace(/<\/?p>/g, ' ').trim().split(/\s+/).filter(Boolean).length
  return `${words.toLocaleString()} words`
})
</script>

<style scoped>
.lorem-pane { flex: 1; min-height: 320px; }
</style>
