<template>
  <div class="app" :class="{ 'app--sidebar': isRegular, 'app--mini': isMini() }">
    <a class="skip-link" href="#main">Skip to content</a>

    <AppSidebar />
    <transition name="fade">
      <div v-if="!isRegular && sidebarOverlay" class="scrim" aria-hidden="true" @click="closeOverlay" />
    </transition>

    <main id="main" class="main" tabindex="-1">
      <router-view v-slot="{ Component, route }">
        <component :is="Component" :key="route.path" />
      </router-view>
    </main>

    <CommandPalette />
    <AppToasts />
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import AppSidebar from '@/components/AppSidebar.vue'
import CommandPalette from '@/components/CommandPalette.vue'
import AppToasts from '@/components/AppToasts.vue'
import { useLayout } from '@/composables/useLayout'

const { isRegular, isMini, sidebarOverlay, closeOverlay, paletteOpen, toggleSidebar } = useLayout()

function onKey (e) {
  const mod = e.metaKey || e.ctrlKey
  if (mod && e.key.toLowerCase() === 'k') { e.preventDefault(); paletteOpen.value = !paletteOpen.value }
  // ⌃⌘S mirrors the macOS "Show/Hide Sidebar" shortcut
  else if (e.metaKey && e.ctrlKey && e.key.toLowerCase() === 's') { e.preventDefault(); toggleSidebar() }
  else if (e.key === 'Escape' && sidebarOverlay.value) closeOverlay()
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
.app { min-height: 100dvh; }
/* Content extends under the floating sidebar's inset; text column starts after it. */
.main {
  min-width: 0;
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
  transition: padding-left 420ms var(--ease);
}
.main:focus { outline: none; }
.app--sidebar .main { padding-left: calc(env(safe-area-inset-left) + var(--sidebar-w) + var(--inset)); }
.app--mini .main { padding-left: calc(env(safe-area-inset-left) + var(--sidebar-mini-w) + var(--inset)); }

.scrim { position: fixed; inset: 0; z-index: 30; background: rgba(0, 0, 0, 0.25); }
.fade-enter-active, .fade-leave-active { transition: opacity 300ms ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
