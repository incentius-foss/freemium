<template>
  <svg
    class="app-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="weight"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
    v-html="markup"
  />
</template>

<script setup>
import { computed } from 'vue'
import { icons } from './icons'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 20 },
  weight: { type: [Number, String], default: 1.8 },
})

const markup = computed(() => icons[props.name] || icons.info)
</script>

<style scoped>
.app-icon { flex: none; display: block; }
</style>
