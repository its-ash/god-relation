<script setup lang="ts">
import { categoryStyles } from '~/data/categoryStyles'
import type { DeityNode, DeityEdge } from '~/types/graph'

const props = defineProps<{
  node: DeityNode
  edges: DeityEdge[]
  nodeById: (id: string) => DeityNode | undefined
}>()
const emit = defineEmits<{ select: [id: string]; close: [] }>()

const style = computed(() => categoryStyles[props.node.category])

interface RelationRow { edge: DeityEdge, other: DeityNode, direction: 'out' | 'in' }

const relations = computed<RelationRow[]>(() => {
  return props.edges
    .map((edge) => {
      const outgoing = edge.from === props.node.id
      const otherId = outgoing ? edge.to : edge.from
      const other = props.nodeById(otherId)
      if (!other) return null
      return { edge, other, direction: outgoing ? 'out' : 'in' } as RelationRow
    })
    .filter((r): r is RelationRow => r !== null)
})
</script>

<template>
  <aside class="panel">
    <button class="close" aria-label="Close detail panel" @click="emit('close')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
    </button>

    <div class="header">
      <span class="badge" :style="{ background: style.color, borderColor: style.border, color: '#0a0a0a' }">{{ style.label }}</span>
      <h2>{{ node.name }}</h2>
      <p v-if="node.sanskrit" class="sanskrit">{{ node.sanskrit }}</p>
      <p v-if="node.epithet" class="epithet">{{ node.epithet }}</p>
    </div>

    <p class="summary">{{ node.summary }}</p>

    <dl v-if="node.domain?.length || node.mount || node.weapon?.length" class="facts">
      <template v-if="node.domain?.length">
        <dt>Domain</dt>
        <dd>{{ node.domain.join(', ') }}</dd>
      </template>
      <template v-if="node.mount">
        <dt>Mount</dt>
        <dd>{{ node.mount }}</dd>
      </template>
      <template v-if="node.weapon?.length">
        <dt>Weapon</dt>
        <dd>{{ node.weapon.join(', ') }}</dd>
      </template>
      <template v-if="node.source">
        <dt>Source</dt>
        <dd>{{ node.source }}</dd>
      </template>
    </dl>

    <div v-if="relations.length" class="relations">
      <h3>Relations ({{ relations.length }})</h3>
      <ul>
        <li v-for="r in relations" :key="r.edge.id" @click="emit('select', r.other.id)">
          <span class="dir" :class="r.direction">{{ r.direction === 'out' ? r.edge.label : `${r.edge.label} of` }}</span>
          <span class="target">{{ r.other.name }}</span>
        </li>
      </ul>
    </div>
  </aside>
</template>

<style scoped>
.panel {
  position: relative;
  width: 340px;
  height: 100%;
  background: var(--bg-panel);
  border-left: 1px solid var(--border);
  padding: 24px 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: none;
  background: var(--bg-panel-alt);
  color: var(--text-dim);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close:hover { color: var(--text); background: var(--accent-dim); }
.close svg { width: 14px; height: 14px; }

.badge {
  display: inline-block;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 3px 9px;
  border-radius: 999px;
  border: 1px solid;
  margin-bottom: 10px;
}

h2 {
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 700;
  margin: 0 0 2px;
  line-height: 1.1;
}

.sanskrit {
  font-family: var(--font-display);
  font-size: 16px;
  color: var(--accent);
  margin: 0 0 4px;
}

.epithet {
  font-size: 13px;
  color: var(--text-dim);
  font-style: italic;
  margin: 0;
}

.summary {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text);
  margin: 0;
}

.facts {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 6px 12px;
  margin: 0;
  font-size: 12.5px;
}

.facts dt {
  color: var(--text-dim);
  font-weight: 600;
}

.facts dd {
  margin: 0;
  color: var(--text);
}

.relations h3 {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-dim);
  margin: 0 0 10px;
  border-top: 1px solid var(--border);
  padding-top: 16px;
}

.relations ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.relations li {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.relations li:hover { background: var(--bg-panel-alt); }

.dir {
  font-size: 11.5px;
  color: var(--text-dim);
  white-space: nowrap;
}

.dir.out { color: #a8a8a8; }
.dir.in { color: #7a7a7a; }

.target {
  font-size: 13px;
  font-weight: 600;
  text-align: right;
}
</style>
