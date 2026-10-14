<template>
  <div class="seg" role="radiogroup" :aria-label="label" @keydown="onKey">
    <button
      v-for="(opt, i) in normalized"
      :key="opt.value"
      ref="buttons"
      type="button"
      role="radio"
      class="seg__item"
      :aria-checked="opt.value === modelValue"
      :tabindex="opt.value === modelValue || (activeIndex < 0 && i === 0) ? 0 : -1"
      :title="opt.title"
      @click="select(opt.value)"
    >
      <AppIcon v-if="opt.icon" :name="opt.icon" :size="16" />
      <span v-if="opt.label" :class="{ 'sr-only': opt.iconOnly }">{{ opt.label }}</span>
    </button>
    <span class="seg__thumb" :style="thumbStyle" aria-hidden="true" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import AppIcon from '../AppIcon.vue'

const props = defineProps({
  modelValue: { type: [String, Number, Boolean], default: null },
  options: { type: Array, required: true }, // strings or { value, label, icon, iconOnly, title }
  label: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])
const buttons = ref([])

const normalized = computed(() => props.options.map((o) => (typeof o === 'object' ? o : { value: o, label: String(o) })))
const activeIndex = computed(() => normalized.value.findIndex((o) => o.value === props.modelValue))
const thumbStyle = computed(() => ({
  width: `calc((100% - 4px) / ${normalized.value.length})`,
  transform: `translateX(${Math.max(activeIndex.value, 0) * 100}%)`,
  opacity: activeIndex.value < 0 ? 0 : 1,
}))

function select (value) { emit('update:modelValue', value) }

function onKey (e) {
  const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }
  if (!(e.key in keys)) return
  e.preventDefault()
  const n = normalized.value.length
  const i = (Math.max(activeIndex.value, 0) + keys[e.key] + n) % n
  select(normalized.value[i].value)
  buttons.value[i]?.focus()
}
</script>

<style scoped>
/* Segmented control: equal-width segments, sliding selection thumb */
.seg {
  position: relative; display: inline-grid; grid-auto-flow: column; grid-auto-columns: 1fr;
  padding: 2px; border-radius: 999px; background: var(--fill-3); isolation: isolate;
  min-height: 32px;
}
@media (pointer: coarse) { .seg { min-height: 44px; } }
.seg__item {
  position: relative; z-index: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  min-width: 0; padding: 0 14px; border: 0; border-radius: 999px; background: transparent;
  color: var(--label); font-size: 0.8125rem; font-weight: 500; white-space: nowrap;
}
.seg__item[aria-checked="true"] { font-weight: 600; }
.seg__thumb {
  position: absolute; z-index: 0; top: 2px; bottom: 2px; left: 2px; border-radius: 999px;
  background: var(--bg-2);
  box-shadow: 0 3px 8px rgba(0,0,0,0.12), 0 0 0 0.5px rgba(0,0,0,0.04);
  transition: transform var(--dur) var(--ease), opacity 160ms ease;
}
:root[data-theme="dark"] .seg__thumb { background: #636366; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) .seg__thumb { background: #636366; } }
</style>
