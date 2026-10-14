<template>
  <ToolPage>
    <template #options>
      <Segmented
        v-model="mode"
        label="Compare by"
        :options="[{ value: 'lines', label: 'Lines' }, { value: 'words', label: 'Words' }, { value: 'chars', label: 'Characters' }]"
      />
      <Segmented
        v-if="mode === 'lines'"
        v-model="view"
        label="Layout"
        :options="[{ value: 'unified', label: 'Unified' }, { value: 'split', label: 'Side by Side' }]"
      />
      <Toggle v-model="ignoreWhitespace" label="Ignore whitespace" />
      <Toggle v-model="ignoreCase" label="Ignore case" />
      <button class="btn btn--sm" type="button" title="Swap original and changed" @click="swap">
        <AppIcon name="swap" :size="16" />Swap
      </button>
    </template>

    <div class="split">
      <CodePane v-model="a" label="Original" :sample="sampleA" placeholder="Original text…" />
      <CodePane v-model="b" label="Changed" :sample="sampleB" placeholder="Changed text…" />
    </div>

    <section class="card result" aria-labelledby="diff-title">
      <header class="result__bar">
        <h2 id="diff-title" class="t-subhead t-semibold">Differences</h2>
        <p class="stats" role="status">
          <template v-if="!a && !b"><span class="t-footnote t-secondary">Enter text in both panes to compare.</span></template>
          <template v-else-if="identical"><span class="badge badge--ok"><AppIcon name="checkCircle" :size="14" />No differences</span></template>
          <template v-else>
            <span class="badge badge--add">+{{ stats.added }} added</span>
            <span class="badge badge--del">−{{ stats.removed }} removed</span>
            <span class="t-caption t-secondary">{{ unit }}</span>
          </template>
        </p>
      </header>

      <div v-if="(a || b) && !identical" class="diff t-mono">
        <!-- Line diff, unified -->
        <table v-if="mode === 'lines' && view === 'unified'" class="lines">
          <tbody>
            <tr v-for="(r, i) in unifiedRows" :key="i" :class="`ln--${r.type}`">
              <td class="ln__num" aria-hidden="true">{{ r.oldNo ?? '' }}</td>
              <td class="ln__num" aria-hidden="true">{{ r.newNo ?? '' }}</td>
              <td class="ln__sign"><span aria-hidden="true">{{ sign(r.type) }}</span><span class="sr-only">{{ srLabel(r.type) }}</span></td>
              <td class="ln__text">{{ r.text }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Line diff, side by side -->
        <table v-else-if="mode === 'lines'" class="lines lines--split">
          <thead class="sr-only"><tr><th>Original line</th><th>Original</th><th>Changed line</th><th>Changed</th></tr></thead>
          <tbody>
            <tr v-for="(r, i) in splitRows" :key="i">
              <td class="ln__num" aria-hidden="true">{{ r.left?.no ?? '' }}</td>
              <td class="ln__text" :class="r.left ? `ln--${r.left.type}` : 'ln--empty'">
                <span v-if="r.left" class="ln__mark" aria-hidden="true">{{ sign(r.left.type) }}</span><span v-if="r.left?.type === 'del'" class="sr-only">removed: </span>{{ r.left?.text }}
              </td>
              <td class="ln__num ln__num--sep" aria-hidden="true">{{ r.right?.no ?? '' }}</td>
              <td class="ln__text" :class="r.right ? `ln--${r.right.type}` : 'ln--empty'">
                <span v-if="r.right" class="ln__mark" aria-hidden="true">{{ sign(r.right.type) }}</span><span v-if="r.right?.type === 'add'" class="sr-only">added: </span>{{ r.right?.text }}
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Word / character diff, inline -->
        <p v-else class="inline">
          <template v-for="(c, i) in changes" :key="i">
            <ins v-if="c.added"><span class="sr-only">added: </span>{{ c.value }}</ins>
            <del v-else-if="c.removed"><span class="sr-only">removed: </span>{{ c.value }}</del>
            <span v-else>{{ c.value }}</span>
          </template>
        </p>
      </div>
    </section>
  </ToolPage>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { diffLines, diffWords, diffWordsWithSpace, diffChars } from 'diff'
import ToolPage from '@/components/ToolPage.vue'
import CodePane from '@/components/CodePane.vue'
import AppIcon from '@/components/AppIcon.vue'
import Segmented from '@/components/ui/Segmented.vue'
import Toggle from '@/components/ui/Toggle.vue'
import { takeHandoff } from '@/composables/useHandoff'
import { load, save } from '@/composables/storage'

const sampleA = 'The quick brown fox\njumps over the lazy dog.\nLorem ipsum dolor sit amet.\nThe end.'
const sampleB = 'The quick red fox\njumps over the lazy dog!\nA brand-new line.\nThe end.'

const saved = load('freemium:diff:opts', {})
const mode = ref(saved.mode || 'lines')
const view = ref(saved.view || 'unified')
const ignoreWhitespace = ref(!!saved.ignoreWhitespace)
const ignoreCase = ref(!!saved.ignoreCase)
const a = ref(sessionGet('a'))
const b = ref(sessionGet('b'))

function sessionGet (k) { try { return sessionStorage.getItem(`freemium:diff:${k}`) || '' } catch { return '' } }
function sessionSet (k, v) { try { sessionStorage.setItem(`freemium:diff:${k}`, v.length < 200000 ? v : '') } catch { /* ignore */ } }

watch([mode, view, ignoreWhitespace, ignoreCase], () => save('freemium:diff:opts', { mode: mode.value, view: view.value, ignoreWhitespace: ignoreWhitespace.value, ignoreCase: ignoreCase.value }))
watch(a, (v) => sessionSet('a', v))
watch(b, (v) => sessionSet('b', v))

onMounted(() => {
  const handed = takeHandoff()
  if (handed != null) a.value = handed
})

function swap () { [a.value, b.value] = [b.value, a.value] }

const changes = computed(() => {
  const opts = { ignoreCase: ignoreCase.value, ignoreWhitespace: ignoreWhitespace.value }
  if (mode.value === 'lines') {
    // diffLines' ignoreWhitespace only trims line ends; collapse inner runs too.
    const norm = (s) => {
      let v = ignoreWhitespace.value ? s.replace(/\s+/g, ' ').trim() : s
      if (ignoreCase.value) v = v.toLowerCase()
      return v
    }
    return diffLines(a.value, b.value, { comparator: (l, r) => norm(l) === norm(r) })
  }
  if (mode.value === 'words') return ignoreWhitespace.value ? diffWords(a.value, b.value, opts) : diffWordsWithSpace(a.value, b.value, opts)
  return diffChars(a.value, b.value, opts)
})

const identical = computed(() => (a.value || b.value) && changes.value.every((c) => !c.added && !c.removed))
const unit = computed(() => ({ lines: 'lines', words: 'words', chars: 'characters' }[mode.value]))

const splitLines = (v) => {
  const l = v.split('\n')
  if (l[l.length - 1] === '') l.pop()
  return l
}

const stats = computed(() => {
  let added = 0
  let removed = 0
  for (const c of changes.value) {
    const n = mode.value === 'lines' ? splitLines(c.value).length : mode.value === 'chars' ? c.value.length : (c.value.match(/\S+/g) || []).length
    if (c.added) added += n
    else if (c.removed) removed += n
  }
  return { added, removed }
})

const unifiedRows = computed(() => {
  const rows = []
  let o = 1
  let n = 1
  for (const c of changes.value) {
    for (const text of splitLines(c.value)) {
      if (c.added) rows.push({ type: 'add', text, newNo: n++ })
      else if (c.removed) rows.push({ type: 'del', text, oldNo: o++ })
      else rows.push({ type: 'same', text, oldNo: o++, newNo: n++ })
    }
  }
  return rows
})

const splitRows = computed(() => {
  const rows = []
  let o = 1
  let n = 1
  const list = changes.value
  for (let i = 0; i < list.length; i++) {
    const c = list[i]
    if (c.removed && list[i + 1]?.added) {
      const left = splitLines(c.value)
      const right = splitLines(list[i + 1].value)
      for (let k = 0; k < Math.max(left.length, right.length); k++) {
        rows.push({
          left: k < left.length ? { type: 'del', text: left[k], no: o++ } : null,
          right: k < right.length ? { type: 'add', text: right[k], no: n++ } : null,
        })
      }
      i++
    } else if (c.removed) {
      splitLines(c.value).forEach((text) => rows.push({ left: { type: 'del', text, no: o++ }, right: null }))
    } else if (c.added) {
      splitLines(c.value).forEach((text) => rows.push({ left: null, right: { type: 'add', text, no: n++ } }))
    } else {
      splitLines(c.value).forEach((text) => rows.push({ left: { type: 'same', text, no: o++ }, right: { type: 'same', text, no: n++ } }))
    }
  }
  return rows
})

const sign = (t) => (t === 'add' ? '+' : t === 'del' ? '−' : ' ')
const srLabel = (t) => (t === 'add' ? 'added' : t === 'del' ? 'removed' : 'unchanged')
</script>

<style scoped>
.result { overflow: hidden; }
.result__bar { display: flex; align-items: center; flex-wrap: wrap; gap: 8px 12px; padding: 12px 16px; }
.stats { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; margin-left: auto; }
.badge--add { color: var(--success-text); background: color-mix(in srgb, var(--green) 16%, transparent); }
.badge--del { color: var(--danger-text); background: color-mix(in srgb, var(--red) 14%, transparent); }

.diff { max-height: 70vh; overflow: auto; border-top: 0.5px solid var(--separator); font-size: 0.8125rem; line-height: 1.6; }
.lines { width: 100%; border-collapse: collapse; table-layout: auto; }
.lines--split { table-layout: fixed; }
.lines--split .ln__text { width: 50%; }
.lines td { padding: 0 8px; vertical-align: top; white-space: pre-wrap; word-break: break-word; }
.ln__num { width: 1%; min-width: 3ch; text-align: right; color: var(--label-3); user-select: none; white-space: nowrap !important; }
.ln__num--sep { border-left: 0.5px solid var(--separator); }
.ln__sign { width: 1%; color: var(--label-2); user-select: none; font-weight: 700; }
.ln__mark { display: inline-block; width: 1.5ch; font-weight: 700; user-select: none; }
.ln--add, tr.ln--add td { background: color-mix(in srgb, var(--green) 14%, transparent); }
.ln--del, tr.ln--del td { background: color-mix(in srgb, var(--red) 12%, transparent); }
tr.ln--add .ln__sign, .ln--add .ln__mark { color: var(--success-text); }
tr.ln--del .ln__sign, .ln--del .ln__mark { color: var(--danger-text); }
.ln--empty { background: var(--fill-4); }

.inline { margin: 0; padding: 12px 16px; white-space: pre-wrap; word-break: break-word; }
ins { text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 3px; background: color-mix(in srgb, var(--green) 18%, transparent); color: var(--label); border-radius: 3px; }
del { text-decoration: line-through; text-decoration-thickness: 1.5px; background: color-mix(in srgb, var(--red) 16%, transparent); color: var(--label); border-radius: 3px; }
</style>
