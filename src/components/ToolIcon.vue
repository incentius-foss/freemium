<template>
  <span class="tool-icon" :style="{ '--tile': `var(--${color})`, '--s': `${size}px` }" aria-hidden="true">
    <AppIcon :name="icon" :size="Math.round(size * 0.62)" :weight="2" />
  </span>
</template>

<script setup>
import AppIcon from './AppIcon.vue'

defineProps({
  icon: { type: String, required: true },
  color: { type: String, default: 'blue' },
  size: { type: Number, default: 28 },
})
</script>

<style scoped>
/* Settings-style tile: concentric radius ≈ 22.5% of size, subtle top light like app icons */
.tool-icon {
  display: inline-grid; place-items: center; flex: none;
  width: var(--s); height: var(--s); border-radius: calc(var(--s) * 0.26);
  color: #fff;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0) 60%),
    var(--tile);
  box-shadow: inset 0 0 0 0.5px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.25);
}
</style>
