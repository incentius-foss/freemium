<template>
  <ToolPage>
    <section class="card pattern" aria-labelledby="re-title">
      <h2 id="re-title" class="sr-only">Regular expression</h2>
      <label class="label" for="re-pattern">Pattern</label>
      <div class="pattern__field" :class="{ 'pattern__field--err': !!error }">
        <span class="pattern__slash" aria-hidden="true">/</span>
        <input
          id="re-pattern"
          v-model="pattern"
          class="pattern__input t-mono"
          type="text"
          placeholder="(\w+)@(\w+)\.com"
          spellcheck="false"
          autocomplete="off"
          autocapitalize="off"
          :aria-invalid="!!error"
          aria-describedby="re-status"
        />
        <span class="pattern__slash" aria-hidden="true">/{{ flagString }}</span>
      </div>
      <div class="flags" role="group" aria-label="Flags">
        <button
          v-for="f in FLAGS"
          :key="f.flag"
          type="button"
          class="flag"
          :aria-pressed="flags[f.flag]"
          :title="f.title"
          @click="flags[f.flag] = !flags[f.flag]"
        >
          <span class="t-mono flag__key">{{ f.flag }}</span>
          <span class="flag__name">{{ f.name }}</span>
        </button>
      </div>
      <p id="re-status" class="status t-footnote" role="status">
        <span v-if="error" class="status--err"><AppIcon name="warning" :size="14" />{{ error }}</span>
        <span v-else-if="!pattern" class="t-secondary">Type a pattern to start matching.</span>
        <span v-else class="t-secondary">
          {{ matches.length.toLocaleString() }}{{ capped ? '+' : '' }} {{ matches.length === 1 ? 'match' : 'matches' }}
          <template v-if="capped"> · showing the first {{ MAX }}</template>
        </span>
      </p>
    </section>

    <div class="split">
      <CodePane v-model="text" label="Test string" :sample="sampleText" :mono="true" placeholder="Text to test the pattern against…" />

      <section class="card result" aria-labelledby="hl-title">
        <header class="result__bar">
          <h2 id="hl-title" class="t-subhead t-semibold">Matches</h2>
        </header>
        <div class="highlight t-mono" aria-label="Test string with matches highlighted">
          <template v-for="(seg, i) in segments" :key="i"><mark v-if="seg.match" :class="`m${seg.n % 2}`" :title="`Match ${seg.n + 1}`">{{ seg.text }}</mark><span v-else>{{ seg.text }}</span></template>
          <span v-if="!text" class="t-secondary">Highlighted matches appear here.</span>
        </div>
        <ol v-if="matches.length" class="match-list" aria-label="Match details">
          <li v-for="(m, i) in matches.slice(0, 200)" :key="i" class="match">
            <div class="match__head">
              <span class="badge">#{{ i + 1 }}</span>
              <code class="match__text">{{ m.text || '(empty)' }}</code>
              <span class="t-caption t-secondary">{{ m.index }}–{{ m.end }}</span>
            </div>
            <dl v-if="m.groups.length" class="groups">
              <template v-for="(g, gi) in m.groups" :key="gi">
                <dt class="t-caption t-secondary">{{ groupName(m, gi) }}</dt>
                <dd class="t-mono">{{ g == null ? 'undefined' : g }}<span v-if="m.indices && m.indices[gi]" class="t-caption t-secondary"> · {{ m.indices[gi][0] }}–{{ m.indices[gi][1] }}</span></dd>
              </template>
            </dl>
          </li>
        </ol>
      </section>
    </div>

    <section class="card replace" aria-labelledby="rep-title">
      <h2 id="rep-title" class="t-headline">Replace</h2>
      <label class="label" for="re-replace">Replacement ($1, $&lt;name&gt;, $&amp; are supported)</label>
      <input id="re-replace" v-model="replacement" class="field t-mono" type="text" placeholder="$2 → $1" spellcheck="false" autocomplete="off" />
    </section>
    <CodePane :model-value="replaced" label="Result" readonly download="replaced.txt" />
  </ToolPage>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import ToolPage from '@/components/ToolPage.vue'
import CodePane from '@/components/CodePane.vue'
import AppIcon from '@/components/AppIcon.vue'
import { takeHandoff } from '@/composables/useHandoff'
import { load, save } from '@/composables/storage'

const MAX = 1000
const TIMEOUT = 1000
const FLAGS = [
  { flag: 'g', name: 'global', title: 'Find all matches' },
  { flag: 'i', name: 'ignore case', title: 'Case-insensitive' },
  { flag: 'm', name: 'multiline', title: '^ and $ match at line breaks' },
  { flag: 's', name: 'dotAll', title: '. matches newlines' },
  { flag: 'u', name: 'unicode', title: 'Unicode mode' },
  { flag: 'y', name: 'sticky', title: 'Match only at lastIndex' },
  { flag: 'd', name: 'indices', title: 'Report group start/end indices' },
]

const saved = load('freemium:regex', null)
const pattern = ref(saved?.pattern ?? '(?<user>[\\w.]+)@(?<domain>[\\w-]+)\\.(com|org)')
const flags = reactive(saved?.flags ?? { g: true, i: false, m: true, s: false, u: false, y: false, d: true })
const text = ref(saved?.text ?? '')
const replacement = ref(saved?.replacement ?? '$<domain>: $<user>')
const sampleText = 'Contact ada@example.com or grace@navy.org.\nSupport: help@freemium.com\nNot an email: user@localhost'

const matches = ref([])
const replaced = ref('')
const error = ref('')
const capped = ref(false)

const flagString = computed(() => FLAGS.map((f) => f.flag).filter((f) => flags[f]).join(''))

// Matching runs in a worker so a catastrophically backtracking pattern can be stopped.
const WORKER_SRC = `onmessage = (e) => {
  const { source, flags, text, replacement, max } = e.data
  try {
    const re = new RegExp(source, flags)
    const out = []
    let capped = false
    if (re.global || re.sticky) {
      re.lastIndex = 0
      let m
      while ((m = re.exec(text))) {
        if (out.length >= max) { capped = true; break }
        out.push(pack(m))
        if (m[0] === '') re.lastIndex++
        if (!re.global) break
      }
    } else {
      const m = re.exec(text)
      if (m) out.push(pack(m))
    }
    const replaced = text.replace(new RegExp(source, flags), replacement)
    postMessage({ matches: out, capped, replaced })
  } catch (err) {
    postMessage({ error: err.message })
  }
}
function pack (m) {
  return {
    index: m.index, end: m.index + m[0].length, text: m[0],
    groups: Array.from(m).slice(1),
    names: m.groups ? Object.keys(m.groups) : [],
    namedValues: m.groups ? Object.values(m.groups) : [],
    indices: m.indices ? Array.from(m.indices).slice(1).map((x) => x ? [x[0], x[1]] : null) : null,
  }
}`

let worker = null
let workerUrl = null
let timer = null
let debounce = null

function spawn () {
  worker?.terminate()
  if (!workerUrl) workerUrl = URL.createObjectURL(new Blob([WORKER_SRC], { type: 'text/javascript' }))
  worker = new Worker(workerUrl)
  worker.onmessage = (e) => {
    clearTimeout(timer)
    const d = e.data
    if (d.error) { error.value = d.error; matches.value = []; replaced.value = ''; capped.value = false; return }
    error.value = ''
    matches.value = d.matches
    capped.value = d.capped
    replaced.value = d.replaced
  }
}

function run () {
  if (!pattern.value) { matches.value = []; replaced.value = text.value; error.value = ''; return }
  if (!worker) spawn()
  clearTimeout(timer)
  timer = setTimeout(() => {
    spawn()
    error.value = 'Stopped after 1 second. The pattern may backtrack catastrophically; try making quantifiers less ambiguous.'
    matches.value = []
    replaced.value = ''
  }, TIMEOUT)
  worker.postMessage({ source: pattern.value, flags: flagString.value, text: text.value, replacement: replacement.value, max: MAX })
}

watch([pattern, flagString, text, replacement], () => {
  clearTimeout(debounce)
  debounce = setTimeout(run, 120)
  save('freemium:regex', { pattern: pattern.value, flags: { ...flags }, text: text.value.length < 50000 ? text.value : '', replacement: replacement.value })
})

onMounted(() => {
  const handed = takeHandoff()
  if (handed != null) {
    const m = /^\/(.+)\/([a-z]*)$/s.exec(handed.trim())
    if (m) {
      pattern.value = m[1]
      FLAGS.forEach((f) => { flags[f.flag] = m[2].includes(f.flag) })
    } else {
      text.value = handed
    }
  }
  if (!text.value) text.value = sampleText
  run()
})
onBeforeUnmount(() => {
  worker?.terminate()
  if (workerUrl) URL.revokeObjectURL(workerUrl)
  clearTimeout(timer)
  clearTimeout(debounce)
})

// Capture-group names in order, read from the pattern source (unnamed groups → null).
const groupNames = computed(() => {
  const src = pattern.value
  const names = []
  let inClass = false
  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (c === '\\') { i++; continue }
    if (inClass) { if (c === ']') inClass = false; continue }
    if (c === '[') { inClass = true; continue }
    if (c !== '(') continue
    if (src[i + 1] !== '?') { names.push(null); continue }
    const named = /^\?<([A-Za-z_$][\w$]*)>/.exec(src.slice(i + 1))
    if (named) names.push(named[1])
  }
  return names
})

function groupName (m, gi) {
  const name = groupNames.value[gi]
  return name ? `${gi + 1} · ${name}` : `Group ${gi + 1}`
}

const segments = computed(() => {
  const out = []
  let pos = 0
  matches.value.forEach((m, n) => {
    if (m.end === m.index || m.index < pos) return
    if (m.index > pos) out.push({ text: text.value.slice(pos, m.index) })
    out.push({ text: text.value.slice(m.index, m.end), match: true, n })
    pos = m.end
  })
  if (pos < text.value.length) out.push({ text: text.value.slice(pos) })
  return out
})
</script>

<style scoped>
.pattern { padding: 14px 16px; }
.pattern__field {
  display: flex; align-items: center; gap: 2px; min-height: var(--hit); padding: 0 12px;
  border-radius: var(--radius-field); background: var(--fill-3);
}
.pattern__field:focus-within { box-shadow: var(--focus-ring); }
.pattern__field--err { box-shadow: inset 0 0 0 1.5px var(--danger-text); }
.pattern__slash { font-family: var(--font-mono); color: var(--label-2); font-size: 1rem; letter-spacing: 0; }
.pattern__input { flex: 1; min-width: 0; min-height: var(--hit); border: 0; background: none; font-size: 1rem; }
.pattern__input:focus-visible { box-shadow: none !important; }

.flags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.flag {
  display: inline-flex; align-items: center; gap: 6px; min-height: 30px; padding: 0 10px; border-radius: 999px;
  background: var(--fill-3); color: var(--label-2); font-size: 0.8125rem;
}
@media (pointer: coarse) { .flag { min-height: 44px; } }
.flag__key { font-weight: 700; }
.flag[aria-pressed="true"] { background: var(--tint); color: var(--on-tint); }
.status { margin-top: 10px; }
.status--err { display: inline-flex; align-items: center; gap: 6px; color: var(--danger-text); font-weight: 500; }

.result { display: flex; flex-direction: column; min-width: 0; min-height: 260px; overflow: hidden; }
.result__bar { display: flex; align-items: center; padding: 12px 16px 6px; }
.highlight {
  margin: 0 12px; padding: 10px; border-radius: var(--radius-field); background: var(--bg-3);
  font-size: 0.8125rem; line-height: 1.7; white-space: pre-wrap; word-break: break-word; max-height: 240px; overflow: auto;
}
mark { color: var(--label); border-radius: 3px; padding: 1px 0; box-shadow: inset 0 -2px 0 var(--tint); }
mark.m0 { background: color-mix(in srgb, var(--tint) 22%, transparent); }
mark.m1 { background: color-mix(in srgb, var(--purple) 22%, transparent); box-shadow: inset 0 -2px 0 var(--purple); }
.match-list { list-style: none; margin: 10px 0 0; padding: 0 12px 12px; display: grid; gap: 8px; overflow: auto; }
.match { padding: 8px 10px; border-radius: var(--radius-field); background: var(--bg-3); }
.match__head { display: flex; align-items: center; gap: 8px; }
.match__text { flex: 1; min-width: 0; font-size: 0.8125rem; overflow-wrap: anywhere; }
.groups { display: grid; grid-template-columns: max-content 1fr; gap: 2px 12px; margin: 6px 0 0; }
.groups dd { margin: 0; font-size: 0.8125rem; overflow-wrap: anywhere; }
.replace { padding: 14px 16px; }
.replace h2 { margin-bottom: 8px; }
</style>
