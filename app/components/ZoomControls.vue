<script setup lang="ts">
defineEmits<{ 'zoom-in': []; 'zoom-out': []; 'fit': [] }>()
</script>

<template>
  <div class="zoom-controls">
    <button aria-label="Zoom in" @click="$emit('zoom-in')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3M11 8v6M8 11h6" /></svg>
    </button>
    <button aria-label="Zoom out" @click="$emit('zoom-out')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3M8 11h6" /></svg>
    </button>
    <button aria-label="Fit to screen" @click="$emit('fit')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3" /></svg>
    </button>
  </div>
</template>

<style scoped>
.zoom-controls {
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 8px 24px var(--shadow);
}

button {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: var(--text-dim);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

button:not(:last-child) { border-bottom: 1px solid var(--border); }
button:hover { color: var(--accent); background: var(--bg-panel-alt); }
button svg { width: 16px; height: 16px; }
</style>
