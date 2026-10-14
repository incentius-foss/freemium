import { ref } from 'vue'

// Toasts are announced through a polite live region (see AppToasts.vue).
const toasts = ref([])
let seq = 0

export function toast (message, { type = 'info', timeout = 2400 } = {}) {
  const id = ++seq
  toasts.value = [...toasts.value, { id, message, type }]
  setTimeout(() => { toasts.value = toasts.value.filter((t) => t.id !== id) }, timeout)
}

export function useToasts () {
  return { toasts }
}
