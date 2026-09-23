<script setup lang="ts">
import { categoryStyles } from '~/data/categoryStyles'
import type { DeityCategory } from '~/types/graph'

const props = defineProps<{ active: Set<DeityCategory> }>()
const emit = defineEmits<{ toggle: [cat: DeityCategory] }>()

const categories = Object.keys(categoryStyles) as DeityCategory[]
</script>

<template>
  <div class="legend">
    <button
      v-for="cat in categories"
      :key="cat"
      class="row"
      :class="{ inactive: !props.active.has(cat) }"
      @click="emit('toggle', cat)"
    >
      <span class="dot" :style="{ background: categoryStyles[cat].color, borderColor: categoryStyles[cat].border }" />
      <span class="label">{{ categoryStyles[cat].label }}</span>
    </button>
  </div>
</template>

<style scoped>
.legend {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.row {
  display: flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  border: none;
  color: var(--text);
  padding: 6px 8px;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s ease, opacity 0.15s ease;
}

.row:hover { background: var(--bg-panel-alt); }
.row.inactive { opacity: 0.35; }

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid;
  flex-shrink: 0;
}

.label {
  font-size: 12.5px;
  font-weight: 500;
}
</style>
