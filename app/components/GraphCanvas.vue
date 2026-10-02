<script setup lang="ts">
const emit = defineEmits<{ ready: [ret: ReturnType<typeof useMythologyNetwork>] }>()

const el = ref<HTMLElement | null>(null)
const graph = useMythologyNetwork()

onMounted(() => {
  if (el.value) {
    graph.init(el.value)
    emit('ready', graph)
  }
})

onBeforeUnmount(() => {
  graph.destroy()
})

defineExpose({ graph })
</script>

<template>
  <div class="canvas-wrap">
    <div ref="el" class="canvas" />
    <Transition name="fade">
      <div v-if="graph.stabilizing.value" class="loading">
        <div class="loading-ring" />
        <span>Arranging the pantheon…</span>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.canvas-wrap {
  position: relative;
  width: 100%;
  height: 100%;
}

.canvas {
  width: 100%;
  height: 100%;
  touch-action: none;
}

.loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  background: var(--bg);
  color: var(--text-dim);
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.125rem;
  z-index: 5;
}

.loading-ring {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: 2px solid rgba(236, 222, 196, 0.12);
  border-top-color: var(--accent);
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.4s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
