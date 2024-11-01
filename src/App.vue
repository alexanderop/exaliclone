<template>
  <div class="excalidraw-clone min-h-screen bg-gray-900 flex items-center justify-center p-5">
    <drawing-canvas :width="800" :height="600" />
  </div>
</template>

<script lang="ts" setup>
import DrawingCanvas from './components/DrawingCanvas.vue';
</script>