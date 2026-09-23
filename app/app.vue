<script setup lang="ts">
import { categoryStyles } from '~/data/categoryStyles'
import type { DeityCategory } from '~/types/graph'

useHead({
  htmlAttrs: { lang: 'en' }
})

const graphRef = ref<{ graph: ReturnType<typeof useMythologyNetwork> } | null>(null)
const graphApi = shallowRef<ReturnType<typeof useMythologyNetwork> | null>(null)
const sidebarOpen = ref(true)

const { theme, init: initTheme, toggle: toggleTheme } = useTheme()
onBeforeMount(() => initTheme())

const activeCategories = ref<Set<DeityCategory>>(new Set(Object.keys(categoryStyles) as DeityCategory[]))

function onReady(g: ReturnType<typeof useMythologyNetwork>) {
  graphApi.value = g
}

function toggleCategory(cat: DeityCategory) {
  const next = new Set(activeCategories.value)
  next.has(cat) ? next.delete(cat) : next.add(cat)
  activeCategories.value = next
  graphApi.value?.filterByCategories(next)
}

function selectNode(id: string) {
  graphApi.value?.focusNode(id)
}

function closeDetail() {
  graphApi.value?.resetView()
}

const selectedNode = computed(() => {
  const id = graphApi.value?.selectedNodeId.value
  if (!id) return null
  return graphApi.value?.nodeById(id) ?? null
})

const selectedEdges = computed(() => {
  const id = graphApi.value?.selectedNodeId.value
  if (!id || !graphApi.value) return []
  return graphApi.value.edgesForNode(id)
})

const nodeCount = computed(() => graphApi.value?.allNodes.length ?? 0)
const edgeCount = computed(() => graphApi.value?.allEdges.length ?? 0)
</script>

<template>
  <div class="app">
    <header class="topbar">
      <div class="brand">
        <img src="/favicon.svg" alt="" class="logo">
        <div>
          <h1>Devajāla</h1>
          <span class="tagline">देवजाल — the web of the gods</span>
        </div>
      </div>

      <div class="search-slot">
        <SearchBar v-if="graphApi" :search="graphApi.searchHighlight" @select="selectNode" />
      </div>

      <div class="stats">
        <span>{{ nodeCount }} beings</span>
        <span class="sep">·</span>
        <span>{{ edgeCount }} relations</span>
      </div>

      <button class="icon-btn" :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'" @click="toggleTheme">
        <svg v-if="theme === 'dark'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>
      </button>

      <button class="icon-btn" @click="sidebarOpen = !sidebarOpen">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
      </button>
    </header>

    <main class="body">
      <Transition name="slide-left">
        <aside v-if="sidebarOpen" class="sidebar">
          <div class="sidebar-section">
            <h3>Legend &amp; Filters</h3>
            <LegendFilter :active="activeCategories" @toggle="toggleCategory" />
          </div>
          <div class="sidebar-section">
            <h3>Relation Lines</h3>
            <div class="line-legend">
              <div class="line-row"><span class="line mother" /> Mother of</div>
              <div class="line-row"><span class="line father" /> Father of</div>
            </div>
          </div>
          <div class="sidebar-section about">
            <h3>About</h3>
            <p>An interactive atlas of Hindu mythology — from the primordial Brahman through the Trimurti, the Great Goddess, the Devas, Vishnu's avatars, to the heroes of the Ramayana and Mahabharata.</p>
            <p class="hint">Click any figure to trace their relations. Drag to rearrange. Scroll to zoom.</p>
          </div>
        </aside>
      </Transition>

      <div class="canvas-area">
        <GraphCanvas ref="graphRef" @ready="onReady" />
        <button v-if="graphApi?.selectedNodeId.value" class="reset-view" @click="closeDetail">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
          Reset view
        </button>
        <ZoomControls
          v-if="graphApi"
          @zoom-in="graphApi.zoomIn"
          @zoom-out="graphApi.zoomOut"
          @fit="graphApi.resetView"
        />
      </div>

      <Transition name="slide-right">
        <NodeDetailPanel
          v-if="selectedNode && graphApi"
          :node="selectedNode"
          :edges="selectedEdges"
          :node-by-id="graphApi.nodeById"
          @select="selectNode"
          @close="closeDetail"
        />
      </Transition>
    </main>
  </div>
</template>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.topbar {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 0 20px;
  height: 60px;
  flex-shrink: 0;
  background: var(--bg-panel);
  border-bottom: 1px solid var(--border);
  z-index: 10;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo { width: 28px; height: 28px; border-radius: 6px; }

.brand h1 {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  line-height: 1.1;
}

.tagline {
  font-size: 10.5px;
  color: var(--text-dim);
}

.search-slot {
  flex: 1;
  max-width: 420px;
}

.stats {
  font-size: 12px;
  color: var(--text-dim);
  white-space: nowrap;
}

.sep { margin: 0 6px; opacity: 0.5; }

.icon-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg-panel-alt);
  color: var(--text-dim);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-btn:first-of-type { margin-left: auto; }
.icon-btn:hover { color: var(--accent); border-color: var(--accent); }
.icon-btn svg { width: 16px; height: 16px; }

.body {
  flex: 1;
  display: flex;
  min-height: 0;
}

.sidebar {
  width: 260px;
  flex-shrink: 0;
  background: var(--bg-panel);
  border-right: 1px solid var(--border);
  overflow-y: auto;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.sidebar-section h3 {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-dim);
  margin: 0 0 10px;
}

.line-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.line-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12.5px;
  color: var(--text);
  padding: 0 8px;
}

.line {
  width: 20px;
  height: 2px;
  border-radius: 2px;
  flex-shrink: 0;
}

.line.mother { background: #e0559b; }
.line.father { background: #e0c23f; }

.about p {
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--text-dim);
  margin: 0 0 10px;
}

.about .hint {
  color: var(--accent);
  opacity: 0.85;
}

.canvas-area {
  flex: 1;
  position: relative;
  min-width: 0;
}

.reset-view {
  position: absolute;
  bottom: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text);
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 8px 24px var(--shadow);
}

.reset-view:hover { border-color: var(--accent); color: var(--accent); }
.reset-view svg { width: 14px; height: 14px; }

.slide-left-enter-active, .slide-left-leave-active,
.slide-right-enter-active, .slide-right-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.slide-left-enter-from, .slide-left-leave-to { transform: translateX(-16px); opacity: 0; }
.slide-right-enter-from, .slide-right-leave-to { transform: translateX(16px); opacity: 0; }
</style>
