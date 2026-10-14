import { ref, watch } from 'vue'
import { load, save } from './storage'

// 'system' follows prefers-color-scheme; 'light' / 'dark' pin it via <html data-theme>.
const theme = ref(load('freemium:theme', 'system'))

function apply (value) {
  if (typeof document === 'undefined') return
  const el = document.documentElement
  if (value === 'system') el.removeAttribute('data-theme')
  else el.setAttribute('data-theme', value)
}

apply(theme.value)
watch(theme, (v) => { apply(v); save('freemium:theme', v) })

export function useTheme () {
  return { theme }
}
