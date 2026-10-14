<template>
  <template v-for="opt in options" :key="opt.key">
    <Segmented
      v-if="opt.type === 'segmented'"
      :model-value="modelValue[opt.key]"
      :options="opt.options"
      :label="opt.label"
      @update:model-value="set(opt.key, $event)"
    />
    <Toggle
      v-else-if="opt.type === 'toggle'"
      :model-value="modelValue[opt.key]"
      :label="opt.label"
      @update:model-value="set(opt.key, $event)"
    />
    <label v-else class="opt-field">
      <span class="opt-field__label">{{ opt.label }}</span>
      <select
        v-if="opt.type === 'select'"
        class="field opt-field__control"
        :value="modelValue[opt.key]"
        @change="set(opt.key, $event.target.value)"
      >
        <option v-for="o in opt.options" :key="o.value ?? o" :value="o.value ?? o">{{ o.label ?? o }}</option>
      </select>
      <input
        v-else
        class="field opt-field__control"
        :type="opt.type === 'number' ? 'number' : 'text'"
        :min="opt.min"
        :max="opt.max"
        :placeholder="opt.placeholder"
        :style="{ width: opt.width || (opt.type === 'number' ? '84px' : '180px') }"
        :value="modelValue[opt.key]"
        @input="set(opt.key, opt.type === 'number' ? Number($event.target.value) : $event.target.value)"
      />
    </label>
  </template>
</template>

<script setup>
import Segmented from './ui/Segmented.vue'
import Toggle from './ui/Toggle.vue'

// opt: { key, type: 'segmented'|'toggle'|'select'|'number'|'text', label, options?, min?, max?, placeholder?, width? }
const props = defineProps({
  options: { type: Array, required: true },
  modelValue: { type: Object, required: true },
})
const emit = defineEmits(['update:modelValue'])
function set (key, value) { emit('update:modelValue', { ...props.modelValue, [key]: value }) }
</script>

<style scoped>
.opt-field { display: inline-flex; align-items: center; gap: 8px; font-size: 0.8125rem; color: var(--label-2); }
.opt-field__control { min-height: 32px; width: auto; font-size: 0.8125rem; border-radius: 999px; padding-left: 12px; }
@media (pointer: coarse) { .opt-field__control { min-height: 44px; } }
</style>
