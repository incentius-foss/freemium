<template>
  <ToolPage>
    <div class="split">
      <CodePane
        v-model="input"
        label="Text"
        placeholder="Type or paste any text to inspect it"
        :sample="sample"
        accept=".txt,.md,.csv,.json,text/plain"
      />

      <section class="card stats" aria-labelledby="stats-title">
        <header class="stats__bar">
          <h2 id="stats-title" class="stats__title">Statistics</h2>
        </header>
        <dl class="stats__grid">
          <div v-for="s in stats" :key="s.label" class="stat">
            <dt class="t-footnote t-secondary">{{ s.label }}</dt>
            <dd class="stat__value">{{ s.value }}</dd>
          </div>
        </dl>
        <p v-if="input" class="stats__note t-footnote t-secondary">
          <template v-if="hasHidden">
            <AppIcon name="warning" :size="14" /> Contains invisible or control characters ({{ hiddenCount }}). They’re marked in the table below.
          </template>
          <template v-else>
            <AppIcon name="checkCircle" :size="14" /> No invisible or control characters.
          </template>
        </p>
      </section>
    </div>

    <section v-if="chars.length" class="card table-card" aria-labelledby="chars-title">
      <header class="stats__bar">
        <h2 id="chars-title" class="stats__title">Characters</h2>
        <span class="t-caption t-secondary">
          {{ codePoints.length > LIMIT ? `First ${LIMIT} of ${codePoints.length.toLocaleString()} code points` : `${codePoints.length.toLocaleString()} code points` }}
        </span>
      </header>
      <div class="table-scroll">
        <table class="chars">
          <caption class="sr-only">Each code point in the text with its Unicode value, UTF-8 bytes and category</caption>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Char</th>
              <th scope="col">Code point</th>
              <th scope="col">UTF-8</th>
              <th scope="col">Decimal</th>
              <th scope="col">Category</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in chars" :key="c.index" :class="{ 'chars__row--flag': c.hidden }">
              <td class="t-secondary">{{ c.index }}</td>
              <td class="chars__glyph">
                <span v-if="c.label" class="badge" :class="c.hidden ? 'badge--err' : ''">{{ c.label }}</span>
                <span v-else>{{ c.char }}</span>
              </td>
              <td>{{ c.codePoint }}</td>
              <td>{{ c.utf8 }}</td>
              <td>{{ c.decimal }}</td>
              <td class="chars__cat">{{ c.category }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </ToolPage>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import ToolPage from '@/components/ToolPage.vue'
import CodePane from '@/components/CodePane.vue'
import AppIcon from '@/components/AppIcon.vue'
import { takeHandoff } from '@/composables/useHandoff'

const KEY = 'freemium:input:string-inspector'
const LIMIT = 500
const sample = 'Café ☕️ costs €3.50 — naïve​ résumé!\nFamily: 👨‍👩‍👧 Flags: 🇯🇵\tTab'

function sessionGet () { try { return sessionStorage.getItem(KEY) || '' } catch { return '' } }
function sessionSet (v) { try { sessionStorage.setItem(KEY, v.length < 200000 ? v : '') } catch { /* ignore */ } }

const input = ref(sessionGet())
watch(input, sessionSet)
onMounted(() => {
  const handed = takeHandoff()
  if (handed != null) input.value = handed
})

const hasSegmenter = typeof Intl !== 'undefined' && !!Intl.Segmenter
const count = (s, granularity, pred = () => true) => {
  if (!hasSegmenter) return null
  let n = 0
  for (const seg of new Intl.Segmenter(undefined, { granularity }).segment(s)) if (pred(seg)) n++
  return n
}

const codePoints = computed(() => Array.from(input.value))

const NAMES = {
  0x09: 'TAB', 0x0a: 'LF', 0x0d: 'CR', 0x20: 'SPACE', 0xa0: 'NBSP', 0xad: 'SHY', 0x200b: 'ZWSP', 0x200c: 'ZWNJ',
  0x200d: 'ZWJ', 0x200e: 'LRM', 0x200f: 'RLM', 0x2028: 'LSEP', 0x2029: 'PSEP', 0x2060: 'WJ', 0xfeff: 'BOM',
  0x202a: 'LRE', 0x202b: 'RLE', 0x202c: 'PDF', 0x202d: 'LRO', 0x202e: 'RLO', 0x2066: 'LRI', 0x2067: 'RLI', 0x2068: 'FSI', 0x2069: 'PDI',
  0xfe0f: 'VS16', 0xfe0e: 'VS15', 0x3000: 'IDEOGRAPHIC SPACE',
}
const VISIBLE_WS = new Set([0x09, 0x0a, 0x0d, 0x20])

function category (c) {
  const tests = [
    [/\p{Lu}/u, 'Uppercase letter'], [/\p{Ll}/u, 'Lowercase letter'], [/\p{L}/u, 'Letter'],
    [/\p{Nd}/u, 'Digit'], [/\p{N}/u, 'Number'], [/\p{Extended_Pictographic}/u, 'Emoji / pictograph'],
    [/\p{Regional_Indicator}/u, 'Flag letter'], [/\p{M}/u, 'Combining mark'], [/\p{Zs}/u, 'Space'],
    [/\p{Cc}/u, 'Control'], [/\p{Cf}/u, 'Format (invisible)'], [/\p{Z}/u, 'Separator'],
    [/\p{Sc}/u, 'Currency symbol'], [/\p{S}/u, 'Symbol'], [/\p{P}/u, 'Punctuation'], [/\p{Co}/u, 'Private use'],
  ]
  for (const [re, name] of tests) if (re.test(c)) return name
  return 'Other'
}

const isHidden = (cp, c) => !VISIBLE_WS.has(cp) && (/[\p{Cc}\p{Cf}]/u.test(c) || cp === 0xa0 || cp === 0x3000 || (cp >= 0x2000 && cp <= 0x200a))

const chars = computed(() => codePoints.value.slice(0, LIMIT).map((c, i) => {
  const cp = c.codePointAt(0)
  const bytes = new TextEncoder().encode(c)
  const hidden = isHidden(cp, c)
  return {
    index: i,
    char: c,
    label: NAMES[cp] || (hidden || /\p{M}/u.test(c) ? `U+${cp.toString(16).toUpperCase().padStart(4, '0')}` : ''),
    hidden: hidden && cp !== 0xfe0f && cp !== 0x200d,
    codePoint: `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`,
    utf8: Array.from(bytes, (b) => b.toString(16).toUpperCase().padStart(2, '0')).join(' '),
    decimal: cp,
    category: category(c),
  }
}))

const hiddenCount = computed(() => codePoints.value.filter((c) => isHidden(c.codePointAt(0), c) && !/[‍️]/.test(c)).length)
const hasHidden = computed(() => hiddenCount.value > 0)

const fmt = (n) => (n == null ? '—' : n.toLocaleString())
const stats = computed(() => {
  const s = input.value
  const lines = s ? s.split(/\r\n|\r|\n/) : []
  return [
    { label: 'Characters (graphemes)', value: fmt(hasSegmenter ? count(s, 'grapheme') : codePoints.value.length) },
    { label: 'Code points', value: fmt(codePoints.value.length) },
    { label: 'UTF-16 length', value: fmt(s.length) },
    { label: 'Words', value: fmt(count(s, 'word', (x) => x.isWordLike)) },
    { label: 'Lines', value: fmt(lines.length) },
    { label: 'Sentences', value: fmt(count(s, 'sentence', (x) => x.segment.trim() !== '')) },
    { label: 'UTF-8 bytes', value: fmt(new TextEncoder().encode(s).length) },
    { label: 'UTF-16 bytes', value: fmt(s.length * 2) },
    { label: 'Letters', value: fmt((s.match(/\p{L}/gu) || []).length) },
    { label: 'Digits', value: fmt((s.match(/\p{Nd}/gu) || []).length) },
    { label: 'Whitespace', value: fmt((s.match(/\s/gu) || []).length) },
    { label: 'Non-ASCII', value: fmt(codePoints.value.filter((c) => c.codePointAt(0) > 0x7f).length) },
    { label: 'Longest line', value: fmt(lines.reduce((m, l) => Math.max(m, Array.from(l).length), 0)) },
    { label: 'Reading time', value: s.trim() ? `${Math.max(1, Math.round((count(s, 'word', (x) => x.isWordLike) || 0) / 230))} min` : '—' },
  ]
})
</script>

<style scoped>
.stats, .table-card { display: flex; flex-direction: column; min-width: 0; overflow: hidden; }
.stats__bar { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 16px 6px; min-height: 46px; }
.stats__title { font-size: 0.9375rem; font-weight: 600; letter-spacing: -0.015em; }
.stats__grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1px;
  margin: 0; padding: 0 12px 12px;
}
.stat { padding: 10px 6px; border-top: 0.5px solid var(--separator); }
.stat dt { margin: 0; }
.stat__value { margin: 2px 0 0; font-size: 1.375rem; font-weight: 600; letter-spacing: -0.012em; font-variant-numeric: tabular-nums; }
.stats__note { display: flex; align-items: center; gap: 6px; margin: 0; padding: 0 16px 14px; }

.table-scroll { overflow: auto; max-height: 60vh; }
.chars { width: 100%; border-collapse: collapse; font-size: 0.8125rem; font-variant-numeric: tabular-nums; }
.chars th {
  position: sticky; top: 0; z-index: 1; background: var(--bg-2);
  padding: 6px 12px; text-align: left; font-weight: 600; color: var(--label-2); white-space: nowrap;
  box-shadow: inset 0 -0.5px 0 var(--separator);
}
.chars td { padding: 6px 12px; border-top: 0.5px solid var(--separator); font-family: var(--font-mono); letter-spacing: 0; white-space: nowrap; }
.chars td.chars__cat { font-family: var(--font-sans); color: var(--label-2); }
.chars__glyph { font-size: 1rem; }
.chars__glyph .badge { font-family: var(--font-mono); }
.chars__row--flag td:first-child { box-shadow: inset 3px 0 0 var(--red); }
</style>
