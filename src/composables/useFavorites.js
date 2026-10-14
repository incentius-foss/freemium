import { ref, watch } from 'vue'
import { load, save } from './storage'

const favorites = ref(load('freemium:favorites', []))
const recents = ref(load('freemium:recents', []))

watch(favorites, (v) => save('freemium:favorites', v), { deep: true })
watch(recents, (v) => save('freemium:recents', v), { deep: true })

export function useFavorites () {
  const isFavorite = (id) => favorites.value.includes(id)
  const toggleFavorite = (id) => {
    favorites.value = isFavorite(id) ? favorites.value.filter((x) => x !== id) : [...favorites.value, id]
  }
  const visit = (id) => {
    recents.value = [id, ...recents.value.filter((x) => x !== id)].slice(0, 6)
  }
  return { favorites, recents, isFavorite, toggleFavorite, visit }
}
