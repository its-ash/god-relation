<script setup lang="ts">
import { categoryStyles } from '~/data/categoryStyles'
import type { DeityNode } from '~/types/graph'

const props = defineProps<{ search: (q: string) => DeityNode[] }>()
const emit = defineEmits<{ select: [id: string] }>()

const query = ref('')
const results = ref<DeityNode[]>([])
const open = ref(false)
const active = ref(0)
const input = ref<HTMLInputElement | null>(null)

watch(query, (q) => {
  results.value = props.search(q)
  active.value = 0
  open.value = q.trim().length > 0
})

function pick(n: DeityNode) {
  emit('select', n.id)
  query.value = ''
  open.value = false
  input.value?.blur()
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    query.value = ''
    open.value = false
    input.value?.blur()
    return
  }
  if (!open.value || !results.value.length) return
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault()
    const n = results.value.length
    active.value = (active.value + (e.key === 'ArrowDown' ? 1 : -1) + n) % n
  } else if (e.key === 'Enter') {
    const hit = results.value[active.value]
    if (hit) pick(hit)
  }
}

function onGlobalKey(e: KeyboardEvent) {
  const t = e.target as HTMLElement | null
  if (e.key === '/' && !(t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)))) {
    e.preventDefault()
    input.value?.focus()
  }
}

onMounted(() => window.addEventListener('keydown', onGlobalKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onGlobalKey))
</script>

<template>
  <div class="search" role="combobox" :aria-expanded="open" aria-haspopup="listbox" aria-owns="search-results">
    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
    <label for="search-input" class="sr-only">Search figures</label>
    <input
      id="search-input"
      ref="input"
      v-model="query"
      type="search"
      enterkeyhint="search"
      autocomplete="off"
      spellcheck="false"
      placeholder="Search Shiva, Arjuna…"
      aria-autocomplete="list"
      aria-controls="search-results"
      :aria-activedescendant="open && results.length ? `sr-${results[active]?.id}` : undefined"
      @focus="open = query.trim().length > 0"
      @blur="open = false"
      @keydown="onKey"
    >
    <kbd class="kbd" aria-hidden="true">/</kbd>

    <Transition name="pop">
      <div v-if="open" class="results surface">
        <ul v-if="results.length" id="search-results" role="listbox">
          <li
            v-for="(n, i) in results"
            :id="`sr-${n.id}`"
            :key="n.id"
            role="option"
            :aria-selected="i === active"
            :class="{ active: i === active }"
            @pointerdown.prevent="pick(n)"
            @pointerenter="active = i"
          >
            <span class="dot" :style="{ background: categoryStyles[n.category].color }" />
            <span class="text">
              <span class="name">{{ n.name }}<span v-if="n.sanskrit" class="deva" lang="sa">{{ n.sanskrit }}</span></span>
              <span class="epithet">{{ n.epithet || categoryStyles[n.category].label }}</span>
            </span>
          </li>
        </ul>
        <p v-else class="empty">No figure matches “{{ query.trim() }}”. Try a name, epithet or role.</p>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.search {
  position: relative;
  width: 100%;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: var(--text-faint);
  pointer-events: none;
}

input {
  width: 100%;
  height: 2.5rem;
  padding: 0 2.5rem 0 2.5rem;
  background: rgba(236, 222, 196, 0.04);
  border: 1px solid var(--border);
  border-radius: 999px;
  color: var(--text);
  font: inherit;
  font-size: 1rem;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  transition: border-color 0.2s ease, background 0.2s ease;
}

input::-webkit-search-cancel-button { display: none; }
input:focus { border-color: rgba(232, 176, 74, 0.55); background: rgba(236, 222, 196, 0.06); }
input::placeholder { color: var(--text-faint); }

.kbd {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  font-family: var(--font-ui);
  font-size: 0.6875rem;
  color: var(--text-faint);
  border: 1px solid var(--border);
  border-radius: 0.3125rem;
  padding: 0 0.375rem;
  line-height: 1.25rem;
  pointer-events: none;
}

input:focus ~ .kbd { opacity: 0; }

.results {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  border-radius: var(--radius);
  padding: 0.375rem;
  max-height: min(24rem, 60dvh);
  overflow-y: auto;
  z-index: 50;
  transform-origin: top center;
  background: rgba(13, 14, 21, 0.96);
}

.results ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.results li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 2.875rem;
  padding: 0.5rem 0.625rem;
  border-radius: 0.5rem;
  cursor: pointer;
}

.results li.active { background: var(--bg-hover); }

.dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.text {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.name {
  font-weight: 500;
  font-size: 0.875rem;
}

.deva {
  font-family: var(--font-deva);
  font-weight: 400;
  color: var(--accent);
  margin-left: 0.5rem;
  font-size: 0.8125rem;
}

.epithet {
  font-size: 0.75rem;
  color: var(--text-faint);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty {
  margin: 0;
  padding: 0.75rem;
  font-size: 0.8125rem;
  line-height: 1.5;
  color: var(--text-dim);
}

.pop-enter-active, .pop-leave-active { transition: opacity 0.16s var(--ease-out), transform 0.16s var(--ease-out); }
.pop-enter-from, .pop-leave-to { opacity: 0; transform: translateY(-4px) scale(0.98); }

@media (hover: none), (pointer: coarse) {
  .kbd { display: none; }
  input { padding-right: 1rem; }
}
</style>
