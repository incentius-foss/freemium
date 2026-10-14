<template>
  <nav
    class="sidebar glass"
    :class="{ 'sidebar--hidden': !sidebarVisible(), 'sidebar--mini': mini }"
    aria-label="Tools"
    :inert="!sidebarVisible() || undefined"
    @mouseover="showTip"
    @focusin="showTip"
    @mouseleave="tip = null"
    @focusout="tip = null"
  >
    <div class="sidebar__head">
      <router-link to="/" class="brand" aria-label="Freemium home" data-tip="Freemium" @click="closeOverlay">
        <img src="/icons/app-icon.svg" alt="" width="30" height="30" />
        <span class="brand__name">Freemium</span>
      </router-link>
      <button
        class="icon-btn sidebar__toggle"
        type="button"
        :aria-label="toggleLabel"
        :title="`${toggleLabel} (⌃⌘S)`"
        :aria-expanded="!mini"
        @click="toggleSidebar"
      >
        <AppIcon name="sidebar" />
      </button>
    </div>

    <div v-if="!mini" class="sidebar__search">
      <AppIcon name="search" :size="16" class="sidebar__search-icon" />
      <input
        v-model="query"
        class="field"
        type="search"
        placeholder="Search"
        aria-label="Filter tools"
        @keydown.esc="query = ''"
      />
      <kbd class="sidebar__kbd" aria-hidden="true">⌘K</kbd>
    </div>
    <button v-else class="nav-item nav-item--button" type="button" aria-label="Search tools" data-tip="Search  ⌘K" @click="paletteOpen = true">
      <span class="nav-item__glyph"><AppIcon name="search" :size="17" /></span>
    </button>

    <div class="sidebar__scroll">
      <ul class="nav-list" role="list">
        <li>
          <router-link to="/" class="nav-item" exact-active-class="nav-item--active" aria-label="All Tools" data-tip="All Tools" @click="closeOverlay">
            <span class="nav-item__glyph"><AppIcon name="home" :size="17" /></span>
            <span class="nav-item__title">All Tools</span>
            <span class="nav-item__count t-caption">{{ tools.length }}</span>
          </router-link>
        </li>
      </ul>

      <template v-if="query && !mini">
        <p v-if="!filtered.length" class="sidebar__empty t-footnote t-secondary">No tools match “{{ query }}”.</p>
        <ul class="nav-list" role="list">
          <li v-for="tool in filtered" :key="tool.id"><NavItem :tool="tool" /></li>
        </ul>
      </template>

      <template v-else>
        <section v-if="favoriteTools.length" class="nav-section" aria-label="Favorites">
          <h2 class="nav-section__title"><span>Favorites</span></h2>
          <ul class="nav-list" role="list">
            <li v-for="tool in favoriteTools" :key="tool.id"><NavItem :tool="tool" /></li>
          </ul>
        </section>

        <section v-for="cat in grouped" :key="cat.id" class="nav-section" :aria-label="cat.title">
          <h2 class="nav-section__title">
            <button type="button" :aria-expanded="!collapsed[cat.id]" @click="toggleSection(cat.id)">
              <span>{{ cat.title }}</span>
              <AppIcon name="chevronDown" :size="14" :weight="2.4" class="nav-section__chev" />
            </button>
          </h2>
          <!-- The mini rail always lists every tool; collapsing is an expanded-sidebar affordance -->
          <ul v-show="mini || !collapsed[cat.id]" class="nav-list" role="list">
            <li v-for="tool in cat.tools" :key="tool.id"><NavItem :tool="tool" /></li>
          </ul>
        </section>
      </template>
    </div>

    <div class="sidebar__foot">
      <Segmented
        v-if="!mini"
        v-model="theme"
        label="Appearance"
        :options="themeOptions"
      />
      <button
        v-else
        class="icon-btn"
        type="button"
        :aria-label="`Appearance: ${currentTheme.title}. Change appearance`"
        :data-tip="`Appearance: ${currentTheme.title}`"
        @click="cycleTheme"
      >
        <AppIcon :name="currentTheme.icon" />
      </button>
      <a class="icon-btn" href="https://github.com/incentius-foss/freemium" target="_blank" rel="noopener" aria-label="Freemium on GitHub" data-tip="GitHub">
        <AppIcon name="github" />
      </a>
    </div>
  </nav>

  <!-- Labels for the mini rail, positioned outside the scroll container so they aren't clipped -->
  <transition name="tip">
    <div v-if="tip" class="rail-tip glass" :style="{ top: `${tip.top}px` }" aria-hidden="true">{{ tip.text }}</div>
  </transition>
</template>

<script setup>
import { computed, h, reactive, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from './AppIcon.vue'
import ToolIcon from './ToolIcon.vue'
import Segmented from './ui/Segmented.vue'
import { tools, categories, categoryById, toolById, searchTools } from '@/tools/registry'
import { useFavorites } from '@/composables/useFavorites'
import { useLayout } from '@/composables/useLayout'
import { useTheme } from '@/composables/useTheme'
import { load, save } from '@/composables/storage'

const { favorites } = useFavorites()
const { sidebarVisible, isMini, toggleSidebar, closeOverlay, paletteOpen } = useLayout()
const { theme } = useTheme()

const mini = computed(() => isMini())
const toggleLabel = computed(() => (mini.value ? 'Expand sidebar' : 'Collapse sidebar'))

const query = ref('')
const collapsed = reactive(load('freemium:collapsed', {}))
function toggleSection (id) {
  collapsed[id] = !collapsed[id]
  save('freemium:collapsed', { ...collapsed })
}

const filtered = computed(() => searchTools(query.value))
const favoriteTools = computed(() => favorites.value.map((id) => toolById[id]).filter(Boolean))
const grouped = computed(() => categories.map((c) => ({ ...c, tools: tools.filter((t) => t.category === c.id) })))

const themeOptions = [
  { value: 'system', icon: 'circleHalf', label: 'System appearance', iconOnly: true, title: 'System' },
  { value: 'light', icon: 'sun', label: 'Light appearance', iconOnly: true, title: 'Light' },
  { value: 'dark', icon: 'moon', label: 'Dark appearance', iconOnly: true, title: 'Dark' },
]
const currentTheme = computed(() => themeOptions.find((o) => o.value === theme.value) || themeOptions[0])
function cycleTheme () {
  const i = themeOptions.findIndex((o) => o.value === theme.value)
  theme.value = themeOptions[(i + 1) % themeOptions.length].value
}

// Rail tooltips: shown on hover and keyboard focus, only in mini mode.
const tip = ref(null)
function showTip (e) {
  if (!mini.value) { tip.value = null; return }
  const el = e.target.closest?.('[data-tip]')
  if (!el) return // crossing gaps between items keeps the current label (no flicker)
  const r = el.getBoundingClientRect()
  tip.value = { text: el.dataset.tip, top: r.top + r.height / 2 }
}
watch(mini, () => { tip.value = null })

const NavItem = (props) => h(RouterLink, {
  to: props.tool.path,
  class: 'nav-item',
  activeClass: 'nav-item--active',
  'aria-label': props.tool.title,
  'data-tip': props.tool.title,
  onClick: closeOverlay,
}, () => [
  h(ToolIcon, { icon: props.tool.icon, color: categoryById[props.tool.category].color, size: 26 }),
  h('span', { class: 'nav-item__title' }, props.tool.title),
])
NavItem.props = ['tool']
</script>

<style scoped>
.sidebar {
  position: fixed; z-index: 40;
  top: calc(env(safe-area-inset-top) + var(--inset));
  bottom: calc(env(safe-area-inset-bottom) + var(--inset));
  left: calc(env(safe-area-inset-left) + var(--inset));
  width: var(--sidebar-w); max-width: calc(100vw - 2 * var(--inset));
  display: flex; flex-direction: column;
  border-radius: var(--radius-window);
  transition: transform 420ms var(--ease), opacity 300ms ease, width 380ms var(--ease), visibility 0s linear 0s;
}
.sidebar--hidden {
  transform: translateX(calc(-100% - 2 * var(--inset)));
  opacity: 0; visibility: hidden;
  transition: transform 420ms var(--ease), opacity 300ms ease, visibility 0s linear 420ms;
}
@media (prefers-reduced-motion: reduce) { .sidebar, .sidebar--hidden { transform: none; } }

.sidebar__head { display: flex; align-items: center; justify-content: space-between; gap: 4px; padding: 12px 10px 6px 16px; }
.brand { display: inline-flex; align-items: center; gap: 10px; min-width: 0; color: var(--label); text-decoration: none !important; border-radius: 10px; }
.brand img { border-radius: 7px; flex: none; }
.brand__name { font-family: var(--font-rounded); font-size: 1.1875rem; font-weight: 700; letter-spacing: -0.01em; white-space: nowrap; }
.sidebar__head .icon-btn { color: var(--label-2); }

.sidebar__search { position: relative; margin: 6px 12px 8px; }
.sidebar__search .field { padding-left: 32px; padding-right: 40px; border-radius: 999px; font-size: 0.9375rem; background: var(--fill-3); }
.sidebar__search .field::-webkit-search-cancel-button { display: none; }
.sidebar__search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: var(--label-2); pointer-events: none; }
.sidebar__kbd { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); }
@media (pointer: coarse) { .sidebar__kbd { display: none; } }

.sidebar__scroll { flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; overscroll-behavior: contain; padding: 0 10px 12px; scrollbar-width: none; }
.sidebar__scroll::-webkit-scrollbar { display: none; }
.sidebar__empty { padding: 8px 10px; }
.nav-section { margin-top: 14px; }
.nav-section__title { margin: 0 0 2px; }
.nav-section__title > span,
.nav-section__title button {
  display: flex; align-items: center; gap: 4px; width: 100%; min-height: 26px; padding: 4px 10px; border: 0; background: none;
  font-size: 0.8125rem; font-weight: 600; color: var(--label-2); text-align: left; border-radius: 8px;
}
.nav-section__chev { transition: transform var(--dur) var(--ease); margin-left: auto; opacity: 0; }
.nav-section__title button:hover .nav-section__chev,
.nav-section__title button:focus-visible .nav-section__chev,
.nav-section__title button[aria-expanded="false"] .nav-section__chev { opacity: 1; }
.nav-section__title button[aria-expanded="false"] .nav-section__chev { transform: rotate(-90deg); }
@media (pointer: coarse) { .nav-section__chev { opacity: 1; } }

.nav-list { display: grid; gap: 1px; }
:deep(.nav-item) {
  display: flex; align-items: center; gap: 10px; min-height: 38px; padding: 4px 10px 4px 7px;
  border-radius: 12px; color: var(--label); text-decoration: none;
  font-size: 0.9375rem; letter-spacing: -0.015em;
  transition: background-color 120ms ease;
}
@media (pointer: coarse) { :deep(.nav-item) { min-height: 44px; } }
:deep(.nav-item:hover) { background: var(--glass-hover); text-decoration: none; }
:deep(.nav-item--active), :deep(.nav-item--active:hover) { background: var(--fill-2); font-weight: 600; }
:deep(.nav-item__title) { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.nav-item__glyph { display: grid; place-items: center; flex: none; width: 26px; height: 26px; border-radius: 7px; background: var(--fill-2); color: var(--label); }
.nav-item__count { color: var(--label-2); }

.sidebar__foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 10px 12px 12px; border-top: 0.5px solid var(--separator); }

/* ── Mini rail ───────────────────────────────────────────── */
.sidebar--mini { width: var(--sidebar-mini-w); }
.sidebar--mini .sidebar__head { flex-direction: column; padding: 12px 0 4px; gap: 8px; }
.sidebar--mini .brand__name { display: none; }
.sidebar--mini .sidebar__scroll { padding: 0 10px 12px; }
.sidebar--mini :deep(.nav-item) { justify-content: center; padding: 6px 0; }
.sidebar--mini :deep(.nav-item__title),
.sidebar--mini .nav-item__count { display: none; }
.sidebar--mini .nav-item--button { margin: 4px 10px 6px; border: 0; background: none; width: calc(100% - 20px); }
.sidebar--mini .nav-section { margin-top: 8px; padding-top: 8px; border-top: 0.5px solid var(--separator); }
.sidebar--mini .nav-section__title { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
.sidebar--mini .sidebar__foot { flex-direction: column; padding: 10px 0 12px; }

.rail-tip {
  position: fixed; z-index: 60; transform: translateY(-50%);
  left: calc(env(safe-area-inset-left) + var(--inset) + var(--sidebar-mini-w) + 8px);
  padding: 6px 12px; border-radius: 999px; pointer-events: none; white-space: nowrap;
  font-size: 0.8125rem; font-weight: 600; color: var(--label);
}
.tip-enter-active, .tip-leave-active { transition: opacity 120ms ease; }
.tip-enter-from, .tip-leave-to { opacity: 0; }
</style>
