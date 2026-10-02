<script setup lang="ts">
import { categoryStyles } from '~/data/categoryStyles'
import type { DeityCategory } from '~/types/graph'

const props = defineProps<{ active: Set<DeityCategory>, counts: Partial<Record<DeityCategory, number>> }>()
const emit = defineEmits<{ toggle: [cat: DeityCategory] }>()

const categories = (Object.keys(categoryStyles) as DeityCategory[]).filter(c => (props.counts[c] ?? 0) > 0)
</script>

<template>
  <div class="legend">
    <button
      v-for="cat in categories"
      :key="cat"
      class="row"
      :class="{ off: !props.active.has(cat) }"
      :aria-pressed="props.active.has(cat)"
      @click="emit('toggle', cat)"
    >
      <span class="dot" :style="{ background: categoryStyles[cat].color, borderColor: categoryStyles[cat].border }" />
      <span class="label">{{ categoryStyles[cat].label }}</span>
      <span class="num">{{ props.counts[cat] }}</span>
    </button>
  </div>
</template>

<style scoped>
.legend {
  display: grid;
  gap: 0.125rem;
}

.row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 2.5rem;
  padding: 0.375rem 0.625rem;
  background: transparent;
  border: none;
  border-radius: 0.5rem;
  color: var(--text);
  cursor: pointer;
  text-align: left;
  transition: background 0.15s ease, opacity 0.2s ease, transform 0.12s ease;
}

.row:active { transform: scale(0.98); }

.dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  border: 2px solid;
  flex-shrink: 0;
  transition: transform 0.2s var(--ease-out), background 0.2s ease;
}

.label {
  flex: 1;
  font-size: 0.8125rem;
  font-weight: 500;
}

.num {
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  color: var(--text-faint);
}

.row.off { opacity: 0.45; }
.row.off .dot { background: transparent !important; transform: scale(0.85); }
.row.off .label { text-decoration: line-through; text-decoration-color: var(--text-faint); }

@media (hover: hover) and (pointer: fine) {
  .row:hover { background: var(--bg-hover); }
}

@media (max-width: 47.99rem) {
  .legend { grid-template-columns: 1fr 1fr; gap: 0.25rem; }
  .row { min-height: 2.75rem; background: var(--bg-hover); }
}
</style>
