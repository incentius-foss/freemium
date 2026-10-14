<template>
  <ToolPage>
    <div class="split">
      <CodePane
        v-model="input"
        label="Text"
        placeholder="Type or paste text, e.g. user_account_id or “the quick brown fox”"
        :sample="sample"
        accept=".txt,text/plain"
        :mono="false"
      />

      <section class="card cases" aria-labelledby="cases-title">
        <header class="cases__bar">
          <h2 id="cases-title" class="cases__title">All cases</h2>
          <span class="t-caption t-secondary">{{ results.length }} styles</span>
        </header>
        <ul class="cases__list" role="list">
          <li v-for="r in results" :key="r.id" class="case">
            <div class="case__text">
              <span class="case__name">{{ r.name }}</span>
              <span class="case__value" :class="{ 'case__value--empty': !r.value }">{{ r.value || r.example }}</span>
            </div>
            <button
              class="icon-btn icon-btn--sm"
              type="button"
              :disabled="!r.value"
              :aria-label="`Copy ${r.name}`"
              :title="`Copy ${r.name}`"
              @click="copyText(r.value, `${r.name} copied`)"
            >
              <AppIcon name="copy" :size="17" />
            </button>
          </li>
        </ul>
      </section>
    </div>
  </ToolPage>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import ToolPage from '@/components/ToolPage.vue'
import CodePane from '@/components/CodePane.vue'
import AppIcon from '@/components/AppIcon.vue'
import { copyText } from '@/composables/clipboard'
import { takeHandoff } from '@/composables/useHandoff'

const KEY = 'freemium:input:text-case'
const sample = 'The quick brown fox jumps over the lazy dog. userAccountID is not an XMLHttpRequest.'

function sessionGet () { try { return sessionStorage.getItem(KEY) || '' } catch { return '' } }
function sessionSet (v) { try { sessionStorage.setItem(KEY, v.length < 200000 ? v : '') } catch { /* ignore */ } }

const input = ref(sessionGet())
watch(input, sessionSet)
onMounted(() => {
  const handed = takeHandoff()
  if (handed != null) input.value = handed
})

// Split identifiers and prose into words: handles camelCase, PascalCase, ACRONYMWord, snake, kebab, dots, spaces.
function words (line) {
  return line
    .replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, '$1 $2')
    .replace(/(\p{Lu}+)(\p{Lu}\p{Ll})/gu, '$1 $2')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
}
const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
const perLine = (s, fn) => s.split('\n').map(fn).join('\n')
const joinWords = (sep, map) => (s) => perLine(s, (l) => words(l).map(map).join(sep))

const SMALL = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'nor', 'of', 'on', 'or', 'per', 'the', 'to', 'vs', 'via'])
function titleCase (s) {
  const shouting = s === s.toUpperCase()
  return perLine(s, (l) => {
    const parts = l.split(/(\s+)/)
    const last = parts.length - 1
    return parts.map((p, i) => {
      if (/^\s*$/.test(p)) return p
      const lower = p.toLowerCase()
      if (i !== 0 && i !== last && SMALL.has(lower.replace(/[^\p{L}]/gu, ''))) return lower
      // Keep intentional inner capitals (iPhone, JavaScript, NASA) unless the whole input is shouting.
      const base = /\p{Lu}/u.test(p.slice(1)) && !shouting ? p : lower
      return base.replace(/\p{L}/u, (c) => c.toUpperCase())
    }).join('')
  })
}
function sentenceCase (s) {
  return s.toLowerCase().replace(/(^\s*\p{L}|[.!?]\s+\p{L}|\n\s*\p{L})/gu, (m) => m.toUpperCase())
}
function alternating (s) {
  let i = 0
  return s.replace(/\p{L}/gu, (c) => (i++ % 2 ? c.toUpperCase() : c.toLowerCase()))
}
function inverse (s) {
  return Array.from(s, (c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join('')
}
const segmenter = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter() : null
function graphemes (s) { return segmenter ? Array.from(segmenter.segment(s), (x) => x.segment) : Array.from(s) }
function reverse (s) { return perLine(s, (l) => graphemes(l).reverse().join('')) }
function strike (s) { return graphemes(s).map((g) => (/\s/.test(g) ? g : g + '̶')).join('') }
function binary (s) {
  return perLine(s, (l) => Array.from(new TextEncoder().encode(l), (b) => b.toString(2).padStart(8, '0')).join(' '))
}

const cases = [
  { id: 'camel', name: 'camelCase', example: 'userAccountId', fn: (s) => perLine(s, (l) => words(l).map((w, i) => (i ? cap(w) : w.toLowerCase())).join('')) },
  { id: 'pascal', name: 'PascalCase', example: 'UserAccountId', fn: joinWords('', cap) },
  { id: 'snake', name: 'snake_case', example: 'user_account_id', fn: joinWords('_', (w) => w.toLowerCase()) },
  { id: 'constant', name: 'CONSTANT_CASE', example: 'USER_ACCOUNT_ID', fn: joinWords('_', (w) => w.toUpperCase()) },
  { id: 'kebab', name: 'kebab-case', example: 'user-account-id', fn: joinWords('-', (w) => w.toLowerCase()) },
  { id: 'train', name: 'Train-Case', example: 'User-Account-Id', fn: joinWords('-', cap) },
  { id: 'dot', name: 'dot.case', example: 'user.account.id', fn: joinWords('.', (w) => w.toLowerCase()) },
  { id: 'title', name: 'Title Case', example: 'The Quick Brown Fox', fn: titleCase },
  { id: 'sentence', name: 'Sentence case', example: 'The quick brown fox.', fn: sentenceCase },
  { id: 'lower', name: 'lowercase', example: 'the quick brown fox', fn: (s) => s.toLowerCase() },
  { id: 'upper', name: 'UPPERCASE', example: 'THE QUICK BROWN FOX', fn: (s) => s.toUpperCase() },
  { id: 'alternating', name: 'aLtErNaTiNg cAsE', example: 'tHe QuIcK bRoWn FoX', fn: alternating },
  { id: 'inverse', name: 'iNVERSE cASE', example: 'tHE qUICK bROWN fOX', fn: inverse },
  { id: 'reverse', name: 'Reversed', example: 'xof nworb kciuq ehT', fn: reverse },
  { id: 'strike', name: 'S̶t̶r̶i̶k̶e̶t̶h̶r̶o̶u̶g̶h̶', example: 'T̶h̶e̶ ̶q̶u̶i̶c̶k̶', fn: strike },
  { id: 'binary', name: 'Binary (UTF-8)', example: '01010100 01101000 01100101', fn: binary },
]

const results = computed(() => cases.map((c) => ({ ...c, value: input.value ? c.fn(input.value) : '' })))
</script>

<style scoped>
.cases { display: flex; flex-direction: column; min-width: 0; overflow: hidden; }
.cases__bar { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 16px 6px; min-height: 46px; }
.cases__title { font-size: 0.9375rem; font-weight: 600; letter-spacing: -0.015em; }
.cases__list { margin: 0; padding: 0 0 6px; overflow-y: auto; }
.case {
  display: flex; align-items: center; gap: 10px; min-height: 52px; padding: 8px 8px 8px 16px;
  border-top: 0.5px solid var(--separator);
}
.case__text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.case__name { font-size: 0.8125rem; font-weight: 600; color: var(--label-2); }
.case__value {
  font-family: var(--font-mono); font-size: 0.8125rem; letter-spacing: 0; line-height: 1.5; color: var(--label);
  white-space: pre-wrap; overflow-wrap: anywhere;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}
.case__value--empty { color: var(--label-3); }
</style>
