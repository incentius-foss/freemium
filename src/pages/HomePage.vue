<template>
  <div class="home">
    <ToolHeader />

    <section class="hero" aria-labelledby="home-title">
      <h1 id="home-title" class="t-large-title">Developer Toolbox</h1>
      <p class="t-body t-secondary">
        {{ tools.length }} tools that run entirely in your browser. Nothing you paste leaves your device.
      </p>
    </section>

    <section class="smart card" aria-labelledby="smart-title">
      <div class="smart__head">
        <span class="smart__badge" aria-hidden="true"><AppIcon name="sparkles" :size="18" /></span>
        <div>
          <h2 id="smart-title" class="t-headline">Smart Paste</h2>
          <p class="t-footnote t-secondary">Paste anything (JSON, a JWT, a timestamp, a cron schedule, a curl command) and get the right tool.</p>
        </div>
      </div>
      <div class="smart__input">
        <textarea
          v-model="pasted"
          class="field t-mono"
          rows="3"
          placeholder="Paste here…"
          aria-label="Text to detect"
          spellcheck="false"
        />
        <button class="btn" type="button" @click="pasteClipboard">
          <AppIcon name="paste" :size="16" />Paste from Clipboard
        </button>
      </div>
      <div class="smart__results" aria-live="polite">
        <template v-if="pasted.trim()">
          <p v-if="!matches.length" class="t-footnote t-secondary">No match found. Try the search instead.</p>
          <ul v-else class="smart__list" role="list">
            <li v-for="(m, i) in matches" :key="m.tool.id">
              <button class="smart__match" :class="{ 'smart__match--best': i === 0 }" type="button" @click="open(m.tool)">
                <ToolIcon :icon="m.tool.icon" :color="categoryById[m.tool.category].color" :size="26" />
                <span>{{ m.tool.title }}</span>
                <AppIcon name="chevronRight" :size="14" />
              </button>
            </li>
          </ul>
        </template>
      </div>
    </section>

    <section v-if="recentTools.length" class="group" aria-labelledby="recent-title">
      <h2 id="recent-title" class="t-title3 group__title">Recent</h2>
      <div class="chips">
        <router-link v-for="tool in recentTools" :key="tool.id" :to="tool.path" class="chip">
          <ToolIcon :icon="tool.icon" :color="categoryById[tool.category].color" :size="22" />
          {{ tool.title }}
        </router-link>
      </div>
    </section>

    <section v-for="cat in grouped" :key="cat.id" class="group" :aria-labelledby="`cat-${cat.id}`">
      <h2 :id="`cat-${cat.id}`" class="t-title3 group__title">
        {{ cat.title }} <span class="t-subhead t-secondary">{{ cat.tools.length }}</span>
      </h2>
      <ul class="grid" role="list">
        <li v-for="tool in cat.tools" :key="tool.id">
          <router-link :to="tool.path" class="tile card">
            <ToolIcon :icon="tool.icon" :color="cat.color" :size="40" />
            <span class="tile__text">
              <span class="tile__title">{{ tool.title }}</span>
              <span class="tile__sub">{{ tool.subtitle }}</span>
            </span>
          </router-link>
        </li>
      </ul>
    </section>

    <footer class="home__foot t-footnote t-secondary">
      Made by <a href="https://incentius.com/" target="_blank" rel="noopener">Incentius</a> ·
      <a href="https://github.com/incentius-foss/freemium" target="_blank" rel="noopener">Source on GitHub</a> · MIT License
    </footer>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import ToolIcon from '@/components/ToolIcon.vue'
import ToolHeader from '@/components/ToolHeader.vue'
import { tools, categories, categoryById, toolById, rankTools } from '@/tools/registry'
import { useFavorites } from '@/composables/useFavorites'
import { handoff } from '@/composables/useHandoff'
import { readClipboard } from '@/composables/clipboard'

const router = useRouter()
const { recents } = useFavorites()
const pasted = ref('')

const grouped = computed(() => categories.map((c) => ({ ...c, tools: tools.filter((t) => t.category === c.id) })))
const recentTools = computed(() => recents.value.map((id) => toolById[id]).filter(Boolean))
const matches = computed(() => rankTools(pasted.value).slice(0, 4))

async function pasteClipboard () {
  const text = await readClipboard()
  if (text != null) pasted.value = text
}

function open (tool) {
  handoff(pasted.value)
  router.push(tool.path)
}
</script>

<style scoped>
.home {
  container-type: inline-size;
  padding-bottom: calc(env(safe-area-inset-bottom) + 32px);
}
.hero { padding: 8px var(--margin) 0; max-width: 760px; }
.hero h1 { margin: 0; }
.hero p { margin: 6px 0 0; }

.smart { margin: 22px var(--margin) 0; padding: 16px; max-width: 980px; }
.smart__head { display: flex; gap: 12px; align-items: flex-start; }
.smart__head h2, .smart__head p { margin: 0; }
.smart__head p { margin-top: 2px; }
.smart__badge {
  display: grid; place-items: center; flex: none; width: 34px; height: 34px; border-radius: 10px; color: #fff;
  background: linear-gradient(135deg, var(--indigo), var(--pink));
}
.smart__input { display: flex; gap: 10px; align-items: flex-end; margin-top: 14px; }
.smart__input textarea { flex: 1; font-size: 0.8125rem; resize: vertical; min-height: 68px; }
@container (max-width: 560px) {
  .smart__input { flex-direction: column; align-items: stretch; }
}
.smart__results { margin-top: 10px; }
.smart__results:empty { display: none; }
.smart__results p { margin: 0; }
.smart__list { list-style: none; display: flex; flex-wrap: wrap; gap: 8px; margin: 0; padding: 0; }
.smart__match {
  display: inline-flex; align-items: center; gap: 8px; min-height: 40px; padding: 4px 12px 4px 6px;
  border: 0; border-radius: 999px; background: var(--fill-3); color: var(--label); font-size: 0.9375rem; font-weight: 500;
}
.smart__match:hover { background: var(--fill-2); }
.smart__match--best { background: var(--tint); color: var(--on-tint); font-weight: 600; }
.smart__match--best:hover { background: color-mix(in srgb, var(--tint) 88%, #000); }

.group { margin-top: 32px; padding: 0 var(--margin); }
.group__title { margin: 0 0 12px 4px; display: flex; align-items: baseline; gap: 8px; }

.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chip {
  display: inline-flex; align-items: center; gap: 8px; min-height: 40px; padding: 4px 14px 4px 7px; border-radius: 999px;
  background: var(--bg-2); color: var(--label); font-size: 0.9375rem; box-shadow: var(--shadow-card);
}
.chip:hover { text-decoration: none; background: color-mix(in srgb, var(--bg-2) 92%, var(--label)); }

/* Even column counts (1 → 2 → 4) so the grid divides cleanly across a fold (HIG › iPhone Duo) */
.grid { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 540px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@container (min-width: 1060px) { .grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.tile {
  display: flex; align-items: center; gap: 14px; height: 100%; min-height: 76px; padding: 14px 16px;
  color: var(--label); text-decoration: none;
  transition: transform 220ms var(--ease), box-shadow 220ms ease, background-color 160ms ease;
}
.tile:hover { text-decoration: none; transform: translateY(-2px); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08); }
.tile:active { transform: scale(0.98); }
.tile__text { display: flex; flex-direction: column; min-width: 0; }
.tile__title { font-size: 1rem; font-weight: 600; letter-spacing: -0.02em; }
.tile__sub { margin-top: 2px; font-size: 0.8125rem; line-height: 1.35; color: var(--label-2); }

.home__foot { margin-top: 40px; padding: 0 var(--margin); text-align: center; }
</style>
