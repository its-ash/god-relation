<script setup lang="ts">
import type { DeityNode } from '~/types/graph'

const props = defineProps<{ search: (q: string) => DeityNode[] }>()
const emit = defineEmits<{ select: [id: string] }>()

const query = ref('')
const results = ref<DeityNode[]>([])
const open = ref(false)

watch(query, (q) => {
  results.value = props.search(q)
  open.value = results.value.length > 0
})

function pick(n: DeityNode) {
  emit('select', n.id)
  query.value = ''
  open.value = false
}

function onBlur() {
  setTimeout(() => { open.value = false }, 150)
}
</script>

<template>
  <div class="search">
    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
    <input
      v-model="query"
      type="text"
      placeholder="Search a deity, sage, or epithet…"
      @focus="open = results.length > 0"
      @blur="onBlur"
    >
    <Transition name="fade">
      <ul v-if="open" class="results">
        <li v-for="n in results" :key="n.id" @mousedown.prevent="pick(n)">
          <span class="name">{{ n.name }}</span>
          <span class="epithet">{{ n.epithet }}</span>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<style scoped>
.search {
  position: relative;
  width: 100%;
}

.icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--text-dim);
  pointer-events: none;
}

input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  background: var(--bg-panel-alt);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text);
  font-size: 13.5px;
  outline: none;
  transition: border-color 0.2s ease;
}

input:focus { border-color: var(--accent); }
input::placeholder { color: var(--text-dim); }

.results {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: var(--bg-panel-alt);
  border: 1px solid var(--border);
  border-radius: 10px;
  list-style: none;
  margin: 0;
  padding: 6px;
  max-height: 320px;
  overflow-y: auto;
  z-index: 20;
  box-shadow: 0 12px 32px var(--shadow);
}

.results li {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 7px;
  cursor: pointer;
}

.results li:hover { background: var(--accent-dim); }

.name { font-weight: 600; font-size: 13.5px; }
.epithet { font-size: 11.5px; color: var(--text-dim); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
