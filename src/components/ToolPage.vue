<template>
  <div class="tool-page" :class="{ 'tool-page--fill': fill }">
    <ToolHeader :tool="tool">
      <template #actions><slot name="actions" /></template>
    </ToolHeader>
    <div v-if="$slots.options" class="tool-page__options" role="group" aria-label="Options">
      <slot name="options" />
    </div>
    <div class="tool-page__body">
      <slot :tool="tool" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ToolHeader from './ToolHeader.vue'
import { toolById } from '@/tools/registry'
import { useFavorites } from '@/composables/useFavorites'

defineProps({
  // Fill the window height at regular width so editor panes stretch (split-view feel).
  fill: { type: Boolean, default: false },
})

const route = useRoute()
const tool = computed(() => toolById[route.meta.tool])
const { visit } = useFavorites()
onMounted(() => tool.value && visit(tool.value.id))
</script>

<style scoped>
.tool-page {
  display: flex; flex-direction: column; min-height: 100dvh;
  padding-bottom: calc(env(safe-area-inset-bottom) + var(--margin));
}
.tool-page__options {
  display: flex; flex-wrap: wrap; align-items: center; gap: 10px 16px;
  padding: 18px var(--margin) 0;
}
.tool-page__body {
  container-type: inline-size;
  display: flex; flex-direction: column; gap: 16px;
  padding: 18px var(--margin) 0;
}
@media (min-width: 1024px) and (min-height: 640px) {
  .tool-page--fill { height: 100dvh; }
  .tool-page--fill .tool-page__body { flex: 1; min-height: 0; }
}
</style>
