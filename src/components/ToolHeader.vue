<template>
  <header class="tool-header">
    <div class="topbar">
      <button
        v-if="!sidebarVisible()"
        class="btn btn--glass topbar__nav"
        type="button"
        aria-label="Show sidebar"
        title="Show sidebar"
        @click="toggleSidebar"
      >
        <AppIcon name="sidebar" />
      </button>
      <span class="topbar__spacer" />
      <div class="btn-group glass" role="toolbar" aria-label="Page actions">
        <slot name="actions" />
        <button
          v-if="tool"
          class="icon-btn"
          type="button"
          :aria-pressed="isFavorite(tool.id)"
          :aria-label="isFavorite(tool.id) ? 'Remove from Favorites' : 'Add to Favorites'"
          :title="isFavorite(tool.id) ? 'Remove from Favorites' : 'Add to Favorites'"
          @click="toggleFavorite(tool.id)"
        >
          <AppIcon :name="isFavorite(tool.id) ? 'starFill' : 'star'" />
        </button>
        <button v-if="tool" class="icon-btn" type="button" aria-label="Copy link to this tool" title="Copy link" @click="copyLink">
          <AppIcon name="link" />
        </button>
        <button class="icon-btn" type="button" aria-label="Search tools" title="Search tools (⌘K)" @click="paletteOpen = true">
          <AppIcon name="search" />
        </button>
      </div>
    </div>

    <div v-if="tool" class="title-block">
      <ToolIcon :icon="tool.icon" :color="category.color" :size="44" />
      <div class="title-block__text">
        <h1 class="t-title1">{{ tool.title }}</h1>
        <p class="t-subhead t-secondary">{{ tool.subtitle }}</p>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'
import ToolIcon from './ToolIcon.vue'
import { categoryById } from '@/tools/registry'
import { useFavorites } from '@/composables/useFavorites'
import { useLayout } from '@/composables/useLayout'
import { copyText } from '@/composables/clipboard'

const props = defineProps({ tool: { type: Object, default: null } })
const { isFavorite, toggleFavorite } = useFavorites()
const { sidebarVisible, toggleSidebar, paletteOpen } = useLayout()
const category = computed(() => (props.tool ? categoryById[props.tool.category] : null))

function copyLink () {
  copyText(window.location.href, 'Link copied')
}
</script>

<style scoped>
.topbar {
  position: sticky; top: 0; z-index: 20;
  display: flex; align-items: center; gap: 8px;
  padding: calc(env(safe-area-inset-top) + var(--inset)) var(--margin) 8px;
  pointer-events: none;
}
.topbar > * { pointer-events: auto; }
/* Scroll edge effect: content softly blurs and fades beneath floating controls */
.topbar::before {
  content: ''; position: absolute; inset: 0 0 -20px 0; z-index: -1; pointer-events: none;
  background: linear-gradient(var(--bg) 20%, color-mix(in srgb, var(--bg) 0%, transparent));
  -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px);
  -webkit-mask-image: linear-gradient(#000 40%, transparent);
  mask-image: linear-gradient(#000 40%, transparent);
}
.topbar__nav { width: var(--hit); padding: 0; color: var(--label); }
.topbar__spacer { flex: 1; }
.btn-group .icon-btn { color: var(--label); }
.btn-group .icon-btn[aria-pressed="true"] { color: var(--yellow); }

.title-block {
  display: flex; align-items: center; gap: 14px;
  padding: 4px var(--margin) 0;
}
.title-block__text { min-width: 0; }
.title-block h1 { margin: 0; }
.title-block p { margin: 2px 0 0; }
@media (max-width: 520px) {
  .title-block h1 { font-size: 1.5rem; }
}
</style>
