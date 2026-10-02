<script setup lang="ts">
defineEmits<{ 'zoom-in': []; 'zoom-out': []; 'fit': [] }>()
</script>

<template>
  <div class="zoom-controls surface" role="group" aria-label="Zoom">
    <button aria-label="Zoom in" @click="$emit('zoom-in')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14" /></svg>
    </button>
    <button aria-label="Zoom out" @click="$emit('zoom-out')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14" /></svg>
    </button>
    <button aria-label="Fit whole graph" @click="$emit('fit')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3" /></svg>
    </button>
  </div>
</template>

<style scoped>
.zoom-controls {
  display: flex;
  flex-direction: column;
  border-radius: 999px;
  overflow: hidden;
  padding: 0.25rem;
}

button {
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--text-dim);
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: color 0.15s ease, background 0.15s ease, transform 0.12s ease;
}

button:active { transform: scale(0.92); }
button svg { width: 1rem; height: 1rem; }

@media (hover: hover) and (pointer: fine) {
  button:hover { color: var(--accent); background: var(--bg-hover); }
}
</style>
