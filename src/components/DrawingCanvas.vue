<template>
  <div class="drawing-canvas">
    <canvas
      ref="canvasRef"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      :width="width"
      :height="height"
      class="bg-gray-800 rounded-lg shadow-xl"
      :class="{
        'cursor-move': isDragging,
        'cursor-crosshair': !isDragging && selectedTool !== 'text',
        'cursor-text': !isDragging && selectedTool === 'text'
      }"
    ></canvas>
    <textarea
      v-if="isEditing"
      ref="textAreaRef"
      v-model="editingText"
      class="drawing-text"
      :style="{
        left: `${textPosition.x}px`,
        top: `${textPosition.y}px`,
      }"
      @blur="finishEditing"
      @keydown.enter.prevent="finishEditing"
      @input="adjustTextArea"
      rows="1"
    ></textarea>
    <div class="toolbar">
      <button
        v-for="tool in tools"
        :key="tool"
        @click="selectTool(tool)"
        :class="[
          'px-4 py-2 rounded-lg font-medium transition-colors duration-200',
          'bg-gray-800 hover:bg-primary-600 border border-gray-700',
          'text-gray-300 hover:text-white',
          { 'bg-primary-600 text-white': selectedTool === tool }
        ]"
      >
        {{ tool }}
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { useRoughCanvas } from '../composables/useRoughCanvas';
import { useDrawingState } from '../composables/useDrawingState';
import { useElementSelection } from '../composables/useElementSelection';
import { isPointInElement } from '../utils/elementUtils';
import { nanoid } from 'nanoid';
import type { Element } from '../types';

const props = defineProps({
  width: { type: Number, default: 800 },
  height: { type: Number, default: 600 },
});

const { canvasRef, drawElement } = useRoughCanvas();
const { elements, currentElement, visibleElements, addElement, updateElement } = useDrawingState();
const { 
  selectedElement,
  isDragging,
  dragOffset,
  selectElement,
  startDragging,
  stopDragging,
} = useElementSelection();

const isDrawing = ref(false);
const selectedTool = ref<Element['type']>('rectangle');
const tools = ['rectangle', 'ellipse', 'arrow', 'text'];

// Text editing state
const isEditing = ref(false);
const editingText = ref('');
const textAreaRef = ref<HTMLTextAreaElement | null>(null);
const textPosition = ref({ x: 0, y: 0 });

const adjustTextArea = () => {
  if (!textAreaRef.value) return;
  textAreaRef.value.style.height = 'auto';
  textAreaRef.value.style.height = textAreaRef.value.scrollHeight + 'px';
};

const startTextEditing = (x: number, y: number) => {
  isEditing.value = true;
  editingText.value = '';
  textPosition.value = { x, y };
  setTimeout(() => {
    textAreaRef.value?.focus();
  }, 0);
};

const finishEditing = () => {
  if (!isEditing.value) return;

  if (editingText.value.trim()) {
    addElement({
      id: nanoid(),
      type: 'text',
      x: textPosition.value.x,
      y: textPosition.value.y,
      width: 0,
      height: 0,
      strokeColor: '#a855f7',
      backgroundColor: 'transparent',
      roughness: 1,
      version: 1,
      text: editingText.value,
    });
  }

  isEditing.value = false;
  editingText.value = '';
};

const handleMouseDown = (event: MouseEvent) => {
  const { offsetX, offsetY } = event;

  if (selectedTool.value === 'text') {
    startTextEditing(offsetX, offsetY);
    return;
  }

  // Check if clicking on an existing element
  const clickedElement = visibleElements.value
    .slice()
    .reverse()
    .find(element => isPointInElement(offsetX, offsetY, element));

  if (clickedElement) {
    selectElement(clickedElement, offsetX, offsetY);
    startDragging();
    return;
  }

  // Start drawing new element
  isDrawing.value = true;
  currentElement.value = {
    id: nanoid(),
    type: selectedTool.value,
    x: offsetX,
    y: offsetY,
    width: 0,
    height: 0,
    strokeColor: '#a855f7',
    backgroundColor: 'transparent',
    roughness: 1,
    version: 1,
  };
};

const handleMouseMove = (event: MouseEvent) => {
  const { offsetX, offsetY } = event;

  if (isDragging.value && selectedElement.value) {
    // Move the selected element
    const newX = offsetX - dragOffset.value.x;
    const newY = offsetY - dragOffset.value.y;

    const updatedElement = {
      ...selectedElement.value,
      x: newX,
      y: newY,
    };

    updateElement(updatedElement);
    selectedElement.value = updatedElement;

    redrawCanvas();
    return;
  }

  if (isDrawing.value && currentElement.value) {
    currentElement.value = {
      ...currentElement.value,
      width: offsetX - currentElement.value.x,
      height: offsetY - currentElement.value.y,
    };

    redrawCanvas();
  }
};

const handleMouseUp = () => {
  if (isDragging.value) {
    stopDragging();
    return;
  }

  if (isDrawing.value && currentElement.value) {
    addElement(currentElement.value);
    currentElement.value = null;
    isDrawing.value = false;
  }
};

const selectTool = (tool: Element['type']) => {
  selectedTool.value = tool;
  selectElement(null, 0, 0);
};

const redrawCanvas = () => {
  const ctx = canvasRef.value?.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, props.width, props.height);
  visibleElements.value.forEach(drawElement);
  
  if (currentElement.value) {
    drawElement(currentElement.value);
  }
};

// Redraw when elements change
watch(visibleElements, redrawCanvas, { deep: true });

onMounted(() => {
  redrawCanvas();
});
</script>

<style scoped>
.drawing-canvas {
  @apply relative;
}

.toolbar {
  @apply absolute top-4 left-4 flex gap-2;
}
</style>