<template>
  <label class="toggle">
    <input type="checkbox" role="switch" :checked="modelValue" @change="$emit('update:modelValue', $event.target.checked)" />
    <span class="toggle__track" aria-hidden="true"><span class="toggle__knob" /></span>
    <span class="toggle__label">{{ label }}</span>
  </label>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, required: true },
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.toggle { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; min-height: 32px; font-size: 0.8125rem; color: var(--label); }
@media (pointer: coarse) { .toggle { min-height: 44px; } }
.toggle input { position: absolute; opacity: 0; width: 1px; height: 1px; }
/* iOS switch proportions (51×31) scaled to 38×23 for dense desktop toolbars */
.toggle__track {
  position: relative; width: 38px; height: 23px; border-radius: 999px; background: var(--fill);
  transition: background-color 200ms ease;
}
.toggle__knob {
  position: absolute; top: 2px; left: 2px; width: 19px; height: 19px; border-radius: 999px; background: #fff;
  box-shadow: 0 3px 8px rgba(0,0,0,0.15), 0 1px 1px rgba(0,0,0,0.16);
  transition: transform var(--dur) var(--ease), width 160ms ease;
}
.toggle input:checked + .toggle__track { background: var(--green); }
.toggle input:checked + .toggle__track .toggle__knob { transform: translateX(15px); }
.toggle input:focus-visible + .toggle__track { box-shadow: var(--focus-ring); }
</style>
