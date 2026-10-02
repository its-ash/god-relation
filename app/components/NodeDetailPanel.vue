<script setup lang="ts">
import { categoryStyles } from '~/data/categoryStyles'
import type { DeityNode, DeityEdge } from '~/types/graph'

const SHEET_FULL = 0.9
const SHEET_PEEK = 0.48
const HANDLE_H = 28
const DRAG_THRESHOLD = 70
const FLICK_VELOCITY = 0.5

const props = defineProps<{
  node: DeityNode
  edges: DeityEdge[]
  nodeById: (id: string) => DeityNode | undefined
  mobile: boolean
}>()
const emit = defineEmits<{ select: [id: string]; close: [] }>()

const style = computed(() => categoryStyles[props.node.category])

interface RelationRow { edge: DeityEdge, other: DeityNode }

const relations = computed(() => {
  const out: RelationRow[] = []
  const inc: RelationRow[] = []
  for (const edge of props.edges) {
    const isOut = edge.from === props.node.id
    const other = props.nodeById(isOut ? edge.to : edge.from)
    if (other) (isOut ? out : inc).push({ edge, other })
  }
  return { out, inc, total: out.length + inc.length }
})

const facts = computed(() => [
  { k: 'Domain', v: props.node.domain?.join(', ') },
  { k: 'Mount', v: props.node.mount },
  { k: 'Weapon', v: props.node.weapon?.join(', ') },
  { k: 'Source', v: props.node.source }
].filter(f => f.v))

const scrollEl = ref<HTMLElement | null>(null)
watch(() => props.node.id, () => scrollEl.value?.scrollTo({ top: 0 }))

// Mobile bottom-sheet state
const vh = ref(800)
const state = ref<'peek' | 'full'>('peek')
const dragY = ref(0)
const dragging = ref(false)
let startY = 0
let lastY = 0
let lastT = 0
let velocity = 0

const onResize = () => { vh.value = window.innerHeight }
onMounted(() => {
  onResize()
  window.addEventListener('resize', onResize)
})
onBeforeUnmount(() => window.removeEventListener('resize', onResize))

const peekOffset = computed(() => vh.value * (SHEET_FULL - SHEET_PEEK))
const sheetStyle = computed(() => {
  if (!props.mobile) return undefined
  const base = state.value === 'full' ? 0 : peekOffset.value
  const raw = base + dragY.value
  const y = raw < 0 ? raw * 0.2 : raw
  return { transform: `translateY(${y}px)` }
})
const scrollStyle = computed(() => props.mobile && state.value === 'peek'
  ? { height: `${vh.value * SHEET_PEEK - HANDLE_H}px`, flex: 'none' }
  : undefined)

function onPointerDown(e: PointerEvent) {
  if (!props.mobile || (e.target as HTMLElement).closest('.close')) return
  dragging.value = true
  startY = lastY = e.clientY
  lastT = e.timeStamp
  velocity = 0
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!dragging.value) return
  const dt = e.timeStamp - lastT
  if (dt > 0) velocity = (e.clientY - lastY) / dt
  lastY = e.clientY
  lastT = e.timeStamp
  dragY.value = e.clientY - startY
}

function onPointerUp() {
  if (!dragging.value) return
  dragging.value = false
  const dy = dragY.value
  dragY.value = 0
  const down = dy > DRAG_THRESHOLD || velocity > FLICK_VELOCITY
  const up = dy < -DRAG_THRESHOLD || velocity < -FLICK_VELOCITY
  if (Math.abs(dy) < 6) {
    state.value = state.value === 'peek' ? 'full' : 'peek'
  } else if (state.value === 'peek') {
    if (up) state.value = 'full'
    else if (down) emit('close')
  } else if (down) {
    if (dy > peekOffset.value + DRAG_THRESHOLD) emit('close')
    state.value = 'peek'
  }
}
</script>

<template>
  <div class="panel-wrap" :class="mobile ? 'is-mobile' : 'is-desktop'">
    <aside
      class="panel surface"
      :class="{ dragging, full: state === 'full' }"
      :style="sheetStyle"
      :aria-label="`${node.name} details`"
    >
      <div
        class="grab"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
      >
        <span v-if="mobile" class="handle" aria-hidden="true" />
        <button class="close" aria-label="Close details" @click="emit('close')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      </div>

      <div ref="scrollEl" class="scroll" :style="scrollStyle">
        <header class="head">
          <span class="chip">
            <span class="dot" :style="{ background: style.color, boxShadow: `0 0 0 3px ${style.color}33` }" />
            {{ style.label }}
          </span>
          <h2>{{ node.name }}</h2>
          <p v-if="node.sanskrit" class="sanskrit" lang="sa">{{ node.sanskrit }}</p>
          <p v-if="node.epithet" class="epithet">{{ node.epithet }}</p>
        </header>

        <p class="summary">{{ node.summary }}</p>

        <dl v-if="facts.length" class="facts">
          <div v-for="f in facts" :key="f.k" class="fact">
            <dt>{{ f.k }}</dt>
            <dd>{{ f.v }}</dd>
          </div>
        </dl>

        <section v-if="relations.total" class="relations">
          <div class="rel-head">
            <h3 class="eyebrow">Relations</h3>
            <span class="count">{{ relations.total }}</span>
          </div>

          <ul>
            <li v-for="r in relations.out" :key="r.edge.id">
              <button class="rel" @click="emit('select', r.other.id)">
                <span class="dot sm" :style="{ background: categoryStyles[r.other.category].color }" />
                <span class="rel-text">
                  <span class="rel-label">{{ r.edge.label }}</span>
                  <span class="rel-name">{{ r.other.name }}</span>
                </span>
                <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6" /></svg>
              </button>
            </li>
            <li v-for="r in relations.inc" :key="r.edge.id">
              <button class="rel" @click="emit('select', r.other.id)">
                <span class="dot sm" :style="{ background: categoryStyles[r.other.category].color }" />
                <span class="rel-text">
                  <span class="rel-label">{{ r.edge.label }} {{ node.name }}</span>
                  <span class="rel-name">{{ r.other.name }}</span>
                </span>
                <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6" /></svg>
              </button>
            </li>
          </ul>
        </section>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.panel-wrap { z-index: 30; }

.is-desktop {
  position: absolute;
  top: calc(var(--topbar-h) + 1.25rem);
  right: 0.75rem;
  bottom: 0.75rem;
  width: 22.5rem;
}

.is-mobile {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 90dvh;
  pointer-events: none;
}

.panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 1.25rem;
  overflow: hidden;
  pointer-events: auto;
}

.is-mobile .panel {
  border-radius: 1.25rem 1.25rem 0 0;
  border-bottom: none;
  transition: transform 0.38s var(--ease-out);
  padding-bottom: env(safe-area-inset-bottom);
}

.is-mobile .panel.dragging { transition: none; }

.grab {
  position: relative;
  height: 1.75rem;
  flex-shrink: 0;
  touch-action: none;
}

.is-mobile .grab { cursor: grab; }

.handle {
  position: absolute;
  top: 0.625rem;
  left: 50%;
  width: 2.5rem;
  height: 0.25rem;
  margin-left: -1.25rem;
  border-radius: 999px;
  background: var(--border-strong);
}

.close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 1;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--bg-panel-alt);
  color: var(--text-dim);
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: color 0.15s ease, border-color 0.15s ease, transform 0.12s ease;
}

.close:active { transform: scale(0.94); }
.close svg { width: 0.875rem; height: 0.875rem; }

.scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0.5rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.scroll > * { flex-shrink: 0; }

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-dim);
  margin-bottom: 0.875rem;
}

.dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot.sm { width: 0.4375rem; height: 0.4375rem; }

h2 {
  font-family: var(--font-display);
  font-size: 2.125rem;
  font-weight: 500;
  font-variation-settings: 'opsz' 96;
  letter-spacing: -0.025em;
  line-height: 1.05;
  margin: 0 2.5rem 0.375rem 0;
}

.sanskrit {
  font-family: var(--font-deva);
  font-size: 1.125rem;
  color: var(--accent);
  margin: 0 0 0.25rem;
}

.epithet {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 0.9375rem;
  line-height: 1.4;
  color: var(--text-dim);
  margin: 0;
}

.summary {
  font-size: 0.9375rem;
  line-height: 1.65;
  color: var(--text);
  margin: 0;
}

.facts {
  margin: 0;
  display: grid;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.fact {
  display: grid;
  grid-template-columns: 4.75rem 1fr;
  gap: 0.75rem;
  padding: 0.625rem 0.875rem;
  font-size: 0.8125rem;
  line-height: 1.5;
}

.fact + .fact { border-top: 1px solid var(--border); }
.fact dt { color: var(--text-faint); }
.fact dd { margin: 0; color: var(--text); }

.rel-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.count {
  font-size: 0.6875rem;
  font-variant-numeric: tabular-nums;
  color: var(--text-dim);
  background: var(--bg-panel-alt);
  border-radius: 999px;
  padding: 0.0625rem 0.5rem;
}

.relations ul {
  list-style: none;
  margin: 0 -0.5rem;
  padding: 0;
}

.rel {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 3rem;
  padding: 0.5rem;
  background: transparent;
  border: none;
  border-radius: 0.625rem;
  color: var(--text);
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.12s ease;
}

.rel:active { transform: scale(0.98); background: var(--bg-hover); }

.rel-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.rel-label {
  font-size: 0.75rem;
  color: var(--text-faint);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rel-name {
  font-size: 0.875rem;
  font-weight: 500;
}

.chev {
  width: 1rem;
  height: 1rem;
  color: var(--text-faint);
  flex-shrink: 0;
  transition: transform 0.15s ease, color 0.15s ease;
}

@media (hover: hover) and (pointer: fine) {
  .close:hover { color: var(--text); border-color: var(--border-strong); }
  .rel:hover { background: var(--bg-hover); }
  .rel:hover .chev { color: var(--accent); transform: translateX(2px); }
}

@media (max-width: 47.99rem) {
  h2 { font-size: 1.875rem; }
  .scroll { padding: 0.25rem 1.25rem 1.5rem; }
}
</style>
