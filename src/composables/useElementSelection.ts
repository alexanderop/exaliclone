import { ref, computed } from 'vue';
import type { Element } from '../types';

export function useElementSelection() {
  const selectedElement = ref<Element | null>(null);
  const isDragging = ref(false);
  const dragOffset = ref({ x: 0, y: 0 });

  const isElementSelected = computed(() => selectedElement.value !== null);

  const selectElement = (element: Element | null, x: number, y: number) => {
    selectedElement.value = element;
    if (element) {
      dragOffset.value = {
        x: x - element.x,
        y: y - element.y,
      };
    }
  };

  const startDragging = () => {
    if (selectedElement.value) {
      isDragging.value = true;
    }
  };

  const stopDragging = () => {
    isDragging.value = false;
  };

  return {
    selectedElement,
    isDragging,
    dragOffset,
    isElementSelected,
    selectElement,
    startDragging,
    stopDragging,
  };
}