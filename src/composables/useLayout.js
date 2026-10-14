import { ref } from 'vue'
import { load, save } from './storage'

// Size classes, not device types (HIG › Layout). Regular width shows the floating sidebar,
// either expanded or as a mini icon rail; compact width collapses it into an overlay,
// like a split view collapsing to one column.
const REGULAR = '(min-width: 1024px)'

const isRegular = ref(typeof window !== 'undefined' ? window.matchMedia(REGULAR).matches : true)
const sidebarMini = ref(load('freemium:sidebar-mini', false)) // user preference at regular width
const sidebarOverlay = ref(false) // open state at compact width
const paletteOpen = ref(false)

if (typeof window !== 'undefined') {
  window.matchMedia(REGULAR).addEventListener('change', (e) => {
    isRegular.value = e.matches
    sidebarOverlay.value = false
  })
}

export function useLayout () {
  const sidebarVisible = () => (isRegular.value ? true : sidebarOverlay.value)
  const isMini = () => isRegular.value && sidebarMini.value
  const toggleSidebar = () => {
    if (isRegular.value) {
      sidebarMini.value = !sidebarMini.value
      save('freemium:sidebar-mini', sidebarMini.value)
    } else {
      sidebarOverlay.value = !sidebarOverlay.value
    }
  }
  const closeOverlay = () => { sidebarOverlay.value = false }
  return { isRegular, sidebarMini, sidebarOverlay, sidebarVisible, isMini, toggleSidebar, closeOverlay, paletteOpen }
}
