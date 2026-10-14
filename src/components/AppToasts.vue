<template>
  <div class="toasts" role="status" aria-live="polite">
    <transition-group name="toast">
      <div v-for="t in toasts" :key="t.id" class="toast glass" :class="`toast--${t.type}`">
        <AppIcon :name="icon(t.type)" :size="18" />
        <span>{{ t.message }}</span>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import AppIcon from './AppIcon.vue'
import { useToasts } from '@/composables/useToast'

const { toasts } = useToasts()
const icon = (type) => ({ success: 'checkCircle', warning: 'warning', error: 'warning' }[type] || 'info')
</script>

<style scoped>
.toasts {
  position: fixed; z-index: 100; left: 50%; transform: translateX(-50%);
  bottom: calc(env(safe-area-inset-bottom) + 20px);
  display: grid; gap: 8px; justify-items: center; pointer-events: none; width: max-content; max-width: calc(100vw - 32px);
}
.toast {
  display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 999px;
  font-size: 0.9375rem; font-weight: 500; color: var(--label);
}
.toast--success svg { color: var(--success-text); }
.toast--warning svg, .toast--error svg { color: var(--warning-text); }
.toast-enter-active, .toast-leave-active { transition: opacity 250ms ease, transform 350ms var(--ease); }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(12px) scale(0.96); }
</style>
