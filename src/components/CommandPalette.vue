<template>
  <transition name="palette">
    <div v-if="paletteOpen" class="palette-backdrop" @mousedown.self="close">
      <div
        ref="dialog"
        class="palette glass"
        role="dialog"
        aria-modal="true"
        aria-label="Search tools"
        @keydown="onKey"
      >
        <div class="palette__field">
          <AppIcon name="search" :size="20" />
          <input
            ref="inputEl"
            v-model="query"
            type="text"
            placeholder="Search 41 tools"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            :aria-activedescendant="results.length ? `palette-opt-${active}` : undefined"
            aria-autocomplete="list"
          />
          <kbd>esc</kbd>
        </div>
        <ul id="palette-list" class="palette__list" role="listbox" aria-label="Tools">
          <li
            v-for="(tool, i) in results"
            :id="`palette-opt-${i}`"
            :key="tool.id"
            role="option"
            class="palette__item"
            :aria-selected="i === active"
            @mousemove="active = i"
            @click="go(tool)"
          >
            <ToolIcon :icon="tool.icon" :color="categoryById[tool.category].color" :size="30" />
            <span class="palette__text">
              <span class="palette__title">{{ tool.title }}</span>
              <span class="palette__sub">{{ tool.subtitle }}</span>
            </span>
            <AppIcon v-if="i === active" name="chevronRight" :size="16" class="palette__go" />
          </li>
          <li v-if="!results.length" class="palette__empty">No tools match “{{ query }}”.</li>
        </ul>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from './AppIcon.vue'
import ToolIcon from './ToolIcon.vue'
import { searchTools, categoryById } from '@/tools/registry'
import { useLayout } from '@/composables/useLayout'

const { paletteOpen, closeOverlay } = useLayout()
const router = useRouter()
const query = ref('')
const active = ref(0)
const inputEl = ref(null)
let returnFocus = null

const results = computed(() => searchTools(query.value).slice(0, 50))
watch(query, () => { active.value = 0 })

watch(paletteOpen, async (open) => {
  if (open) {
    returnFocus = document.activeElement
    query.value = ''
    await nextTick()
    inputEl.value?.focus()
  } else {
    returnFocus?.focus?.()
  }
})

function close () { paletteOpen.value = false }
function go (tool) {
  close()
  closeOverlay()
  router.push(tool.path)
}
function scrollActive () {
  nextTick(() => document.getElementById(`palette-opt-${active.value}`)?.scrollIntoView({ block: 'nearest' }))
}
function onKey (e) {
  if (e.key === 'Escape') { e.preventDefault(); close() }
  else if (e.key === 'ArrowDown') { e.preventDefault(); active.value = Math.min(active.value + 1, results.value.length - 1); scrollActive() }
  else if (e.key === 'ArrowUp') { e.preventDefault(); active.value = Math.max(active.value - 1, 0); scrollActive() }
  else if (e.key === 'Enter' && results.value[active.value]) { e.preventDefault(); go(results.value[active.value]) }
  else if (e.key === 'Tab') { e.preventDefault(); inputEl.value?.focus() } // keep focus inside the dialog
}
</script>

<style scoped>
.palette-backdrop {
  position: fixed; inset: 0; z-index: 90; display: flex; justify-content: center; align-items: flex-start;
  padding: max(10vh, calc(env(safe-area-inset-top) + 16px)) 16px 16px;
  background: rgba(0, 0, 0, 0.18);
}
.palette {
  width: min(620px, 100%); max-height: min(560px, 75vh); display: flex; flex-direction: column;
  border-radius: var(--radius-window); overflow: hidden;
}
.palette__field { display: flex; align-items: center; gap: 10px; padding: 14px 16px; color: var(--label-2); border-bottom: 0.5px solid var(--separator); }
.palette__field input { flex: 1; min-width: 0; border: 0; background: none; font-size: 1.25rem; color: var(--label); }
.palette__field input::placeholder { color: var(--label-3); }
.palette__field input:focus-visible { box-shadow: none !important; }
.palette__list { list-style: none; margin: 0; padding: 6px; overflow-y: auto; }
.palette__item {
  display: flex; align-items: center; gap: 12px; min-height: 48px; padding: 6px 10px; border-radius: 14px; cursor: pointer;
}
.palette__item[aria-selected="true"] { background: var(--tint); color: var(--on-tint); }
.palette__item[aria-selected="true"] .palette__sub { color: color-mix(in srgb, var(--on-tint) 80%, transparent); }
.palette__text { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.palette__title { font-size: 0.9375rem; font-weight: 600; }
.palette__sub { font-size: 0.8125rem; color: var(--label-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.palette__empty { padding: 18px; text-align: center; color: var(--label-2); }

.palette-enter-active, .palette-leave-active { transition: opacity 200ms ease; }
.palette-enter-active .palette, .palette-leave-active .palette { transition: transform 320ms var(--ease), opacity 200ms ease; }
.palette-enter-from, .palette-leave-to { opacity: 0; }
.palette-enter-from .palette, .palette-leave-to .palette { transform: scale(0.97) translateY(-8px); opacity: 0; }
</style>
