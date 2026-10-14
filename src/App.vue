<template>
  <router-view />
</template>

<script setup>
// Theme is applied on import so the first paint already has the saved appearance.
import '@/composables/useTheme'
</script>
