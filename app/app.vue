<script setup lang="ts">
import { categoryStyles } from '~/data/categoryStyles'
import { MOTHER_COLOR, FATHER_COLOR, SISTER_COLOR, BROTHER_COLOR, WIFE_COLOR } from '~/data/relationLineStyles'
import type { DeityCategory } from '~/types/graph'

const REM = 16
const TOPBAR_INSET = 5 * REM
const PANEL_INSET = 24 * REM
const LEGEND_INSET = 17.5 * REM
const MOBILE_TOP_INSET = 4.5 * REM
const MOBILE_SHEET_PEEK = 0.48

useHead({
  htmlAttrs: { lang: 'en' },
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
    { name: 'theme-color', content: '#07080d' }
  ]
})

type Graph = ReturnType<typeof useMythologyNetwork>

const graphApi = shallowRef<Graph | null>(null)
const isMobile = useMediaQuery('(max-width: 47.99rem)')
const legendOpen = ref(false)

const lineLegend = [
  { label: 'Mother of', color: MOTHER_COLOR },
  { label: 'Father of', color: FATHER_COLOR },
  { label: 'Sister of', color: SISTER_COLOR },
  { label: 'Brother of', color: BROTHER_COLOR },
  { label: 'Wife / consort', color: WIFE_COLOR }
]

const allCategories = Object.keys(categoryStyles) as DeityCategory[]
const activeCategories = ref<Set<DeityCategory>>(new Set(allCategories))
const hiddenCount = computed(() => allCategories.length - activeCategories.value.size)

const categoryCounts = computed(() => {
  const res: Partial<Record<DeityCategory, number>> = {}
  for (const n of graphApi.value?.allNodes ?? []) res[n.category] = (res[n.category] ?? 0) + 1
  return res
})

function onReady(g: Graph) {
  graphApi.value = g
  syncInsets()
}

function toggleCategory(cat: DeityCategory) {
  const next = new Set(activeCategories.value)
  next.has(cat) ? next.delete(cat) : next.add(cat)
  activeCategories.value = next
  graphApi.value?.filterByCategories(next)
}

function showAllCategories() {
  activeCategories.value = new Set(allCategories)
  graphApi.value?.filterByCategories(activeCategories.value)
}

function selectNode(id: string) {
  if (isMobile.value) legendOpen.value = false
  graphApi.value?.focusNode(id)
}

function closeDetail() {
  graphApi.value?.resetView()
}

function syncInsets() {
  const g = graphApi.value
  if (!g) return
  g.setFocusInsets(isMobile.value
    ? { top: MOBILE_TOP_INSET, right: 0, left: 0, bottom: window.innerHeight * MOBILE_SHEET_PEEK }
    : { top: TOPBAR_INSET, right: PANEL_INSET, left: legendOpen.value ? LEGEND_INSET : 0, bottom: 0 })
}

watch(isMobile, (m) => {
  legendOpen.value = !m
  syncInsets()
}, { flush: 'post' })
watch(legendOpen, syncInsets)

onMounted(() => {
  legendOpen.value = !window.matchMedia('(max-width: 47.99rem)').matches
  window.addEventListener('resize', syncInsets)
  window.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', syncInsets)
  window.removeEventListener('keydown', onKey)
})

function onKey(e: KeyboardEvent) {
  if (e.key !== 'Escape' || (e.target as HTMLElement | null)?.tagName === 'INPUT') return
  if (isMobile.value && legendOpen.value) legendOpen.value = false
  else if (graphApi.value?.selectedNodeId.value) closeDetail()
}

const selectedNode = computed(() => {
  const id = graphApi.value?.selectedNodeId.value
  return id ? graphApi.value?.nodeById(id) ?? null : null
})

const selectedEdges = computed(() => {
  const id = graphApi.value?.selectedNodeId.value
  return id && graphApi.value ? graphApi.value.edgesForNode(id) : []
})

const nodeCount = computed(() => graphApi.value?.allNodes.length ?? 0)
const edgeCount = computed(() => graphApi.value?.allEdges.length ?? 0)
</script>

<template>
  <div class="app" :class="{ mobile: isMobile, 'has-detail': !!selectedNode, 'has-legend': legendOpen }">
    <GraphCanvas class="stage" @ready="onReady" />

    <header class="topbar surface">
      <div class="brand">
        <img src="/favicon.svg" alt="" class="logo" width="28" height="28">
        <div class="brand-text">
          <h1>Devajāla</h1>
          <span class="tagline" lang="sa">देवजाल</span>
        </div>
      </div>

      <div class="search-slot">
        <SearchBar v-if="graphApi" :search="graphApi.searchHighlight" @select="selectNode" />
      </div>

      <p class="stats">
        <span><strong>{{ nodeCount }}</strong> figures</span>
        <span><strong>{{ edgeCount }}</strong> relations</span>
      </p>

      <button
        class="filter-btn"
        :class="{ on: legendOpen }"
        :aria-expanded="legendOpen"
        aria-controls="legend-panel"
        @click="legendOpen = !legendOpen"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4" /></svg>
        <span class="filter-label">Filters</span>
        <span v-if="hiddenCount" class="badge">{{ hiddenCount }}</span>
      </button>
    </header>

    <Transition name="fade">
      <div v-if="isMobile && legendOpen" class="scrim" @click="legendOpen = false" />
    </Transition>

    <Transition :name="isMobile ? 'sheet' : 'panel-left'">
      <aside v-if="legendOpen" id="legend-panel" class="legend-panel surface" aria-label="Legend and filters">
        <span v-if="isMobile" class="handle" aria-hidden="true" />
        <div class="legend-scroll">
          <section>
            <div class="section-head">
              <h2 class="eyebrow">Figures</h2>
              <button v-if="hiddenCount" class="link-btn" @click="showAllCategories">Show all</button>
            </div>
            <LegendFilter v-if="graphApi" :active="activeCategories" :counts="categoryCounts" @toggle="toggleCategory" />
          </section>

          <section>
            <h2 class="eyebrow">Relation lines</h2>
            <ul class="line-legend">
              <li v-for="l in lineLegend" :key="l.label">
                <span class="line" :style="{ background: l.color }" />
                {{ l.label }}
              </li>
            </ul>
          </section>

          <section class="about">
            <h2 class="eyebrow">About</h2>
            <p>A map of Hindu mythology, from Brahman and the Trimurti through the Great Goddess, the Devas and Vishnu's avatars to the families of the Ramayana and Mahabharata.</p>
            <p class="hint">{{ isMobile ? 'Tap a figure to trace its family. Pinch to zoom, drag to pan.' : 'Click a figure to trace its family. Drag to rearrange, scroll to zoom, press / to search.' }}</p>
          </section>
        </div>
      </aside>
    </Transition>

    <Transition name="fade">
      <button v-if="selectedNode && !isMobile" class="reset-view surface" @click="closeDetail">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
        Show full graph
      </button>
    </Transition>

    <Transition name="fade">
      <ZoomControls
        v-if="graphApi && !(isMobile && selectedNode)"
        class="zoom"
        @zoom-in="graphApi.zoomIn"
        @zoom-out="graphApi.zoomOut"
        @fit="graphApi.resetView"
      />
    </Transition>

    <Transition :name="isMobile ? 'sheet' : 'panel-right'">
      <NodeDetailPanel
        v-if="selectedNode && graphApi"
        :node="selectedNode"
        :edges="selectedEdges"
        :node-by-id="graphApi.nodeById"
        :mobile="isMobile"
        @select="selectNode"
        @close="closeDetail"
      />
    </Transition>
  </div>
</template>

<style scoped>
.app {
  position: relative;
  height: 100dvh;
  overflow: hidden;
}

.stage {
  position: absolute;
  inset: 0;
}

/* Top bar */
.topbar {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  right: 0.75rem;
  z-index: 40;
  height: var(--topbar-h);
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 0 0.75rem 0 1rem;
  border-radius: 1.25rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.logo {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.375rem;
}

.brand-text {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

h1 {
  font-family: var(--font-display);
  font-size: 1.375rem;
  font-weight: 500;
  font-variation-settings: 'opsz' 72;
  letter-spacing: -0.02em;
  line-height: 1;
  margin: 0;
}

.tagline {
  font-family: var(--font-deva);
  font-size: 0.875rem;
  color: var(--accent);
}

.search-slot {
  flex: 1;
  max-width: 30rem;
  margin: 0 auto;
}

.stats {
  display: flex;
  gap: 1rem;
  margin: 0;
  font-size: 0.75rem;
  color: var(--text-faint);
  white-space: nowrap;
}

.stats strong {
  color: var(--text);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.filter-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 2.5rem;
  padding: 0 1rem;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-dim);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  flex-shrink: 0;
  transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease, transform 0.12s ease;
}

.filter-btn svg { width: 1rem; height: 1rem; }
.filter-btn:active { transform: scale(0.96); }
.filter-btn.on { color: var(--accent); border-color: rgba(232, 176, 74, 0.4); background: var(--accent-dim); }

.badge {
  min-width: 1.125rem;
  height: 1.125rem;
  padding: 0 0.3125rem;
  border-radius: 999px;
  background: var(--accent);
  color: #1a1206;
  font-size: 0.6875rem;
  font-weight: 600;
  display: grid;
  place-items: center;
}

/* Legend panel */
.legend-panel {
  position: absolute;
  z-index: 30;
  top: calc(var(--topbar-h) + 1.25rem);
  left: 0.75rem;
  width: 16.5rem;
  max-height: calc(100dvh - var(--topbar-h) - 2rem);
  border-radius: 1.25rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.legend-scroll {
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 1.25rem 0.75rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.legend-scroll .eyebrow { padding: 0 0.625rem; margin-bottom: 0.5rem; }

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.link-btn {
  background: none;
  border: none;
  color: var(--accent);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.25rem 0.625rem;
}

.line-legend {
  list-style: none;
  margin: 0;
  padding: 0 0.625rem;
  display: grid;
  gap: 0.625rem;
  font-size: 0.8125rem;
  color: var(--text);
}

.line-legend li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.line {
  width: 1.375rem;
  height: 0.125rem;
  border-radius: 2px;
  flex-shrink: 0;
}

.about p {
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--text-dim);
  margin: 0 0 0.625rem;
  padding: 0 0.625rem;
}

.about .hint { color: var(--text); }

.handle {
  display: block;
  width: 2.5rem;
  height: 0.25rem;
  margin: 0.625rem auto 0;
  border-radius: 999px;
  background: var(--border-strong);
  flex-shrink: 0;
}

/* Canvas HUD */
.reset-view {
  position: absolute;
  z-index: 20;
  bottom: 0.75rem;
  left: 50%;
  transform: translateX(calc(-50% - 12rem));
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 2.75rem;
  padding: 0 1.125rem;
  border-radius: 999px;
  color: var(--text);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease, opacity 0.2s ease;
}

.reset-view svg { width: 0.875rem; height: 0.875rem; }
.has-legend .reset-view { transform: translateX(calc(-50% - 3.25rem)); }

.zoom {
  position: absolute;
  z-index: 20;
  right: 0.75rem;
  bottom: 0.75rem;
  transition: transform 0.3s var(--ease-out), opacity 0.2s ease;
}

.has-detail:not(.mobile) .zoom { transform: translateX(-23.25rem); }

.scrim {
  position: fixed;
  inset: 0;
  z-index: 29;
  background: rgba(4, 5, 9, 0.55);
}

@media (hover: hover) and (pointer: fine) {
  .filter-btn:hover { color: var(--text); border-color: var(--border-strong); }
  .filter-btn.on:hover { color: var(--accent); }
  .reset-view:hover { color: var(--accent); border-color: rgba(232, 176, 74, 0.4); }
  .link-btn:hover { text-decoration: underline; }
}

/* Mid widths: tuck stats away before the search gets cramped */
@media (max-width: 68rem) {
  .stats { display: none; }
}

/* Mobile */
.mobile .topbar {
  top: max(0.5rem, env(safe-area-inset-top));
  left: 0.5rem;
  right: 0.5rem;
  height: 3.5rem;
  gap: 0.5rem;
  padding: 0 0.5rem;
  border-radius: 1rem;
}

.mobile .brand-text { display: none; }
.mobile .brand { padding-left: 0.25rem; }
.mobile .search-slot { max-width: none; }
.mobile .filter-btn { width: 2.5rem; padding: 0; justify-content: center; }
.mobile .filter-label { display: none; }

.mobile .badge {
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
}

.mobile .legend-panel {
  position: fixed;
  top: auto;
  left: 0;
  right: 0;
  bottom: 0;
  width: auto;
  max-height: 80dvh;
  border-radius: 1.25rem 1.25rem 0 0;
  border-bottom: none;
  padding-bottom: env(safe-area-inset-bottom);
}

.mobile .legend-scroll { padding: 1rem 1rem 1.5rem; }

.mobile .zoom {
  right: 0.5rem;
  bottom: max(0.75rem, env(safe-area-inset-bottom));
}

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.panel-left-enter-active, .panel-left-leave-active,
.panel-right-enter-active, .panel-right-leave-active {
  transition: transform 0.28s var(--ease-out), opacity 0.2s ease;
}
.panel-left-enter-from, .panel-left-leave-to { transform: translateX(-1rem) scale(0.98); opacity: 0; }
.panel-right-enter-from, .panel-right-leave-to { transform: translateX(1rem) scale(0.98); opacity: 0; }

.sheet-enter-active, .sheet-leave-active { transition: transform 0.36s var(--ease-out); }
.sheet-enter-from, .sheet-leave-to { transform: translateY(100%); }

@media (prefers-reduced-motion: reduce) {
  .panel-left-enter-from, .panel-left-leave-to,
  .panel-right-enter-from, .panel-right-leave-to,
  .sheet-enter-from, .sheet-leave-to { transform: none; opacity: 0; }
}
</style>
