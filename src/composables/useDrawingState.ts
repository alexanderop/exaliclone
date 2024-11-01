import { ref, computed } from 'vue';
import type { Element } from '../types';

export function useDrawingState() {
  const elements = ref<Element[]>([]);
  const currentElement = ref<Element | null>(null);

  const addElement = (element: Element) => {
    elements.value.push({
      ...element,
      version: 1,
    });
  };

  const updateElement = (updatedElement: Element) => {
    const index = elements.value.findIndex(el => el.id === updatedElement.id);
    if (index !== -1) {
      elements.value[index] = {
        ...updatedElement,
        version: elements.value[index].version + 1,
      };
    }
  };

  const deleteElement = (elementId: string) => {
    const index = elements.value.findIndex(el => el.id === elementId);
    if (index !== -1) {
      elements.value[index] = {
        ...elements.value[index],
        isDeleted: true,
        version: elements.value[index].version + 1,
      };
    }
  };

  const visibleElements = computed(() => 
    elements.value.filter(element => !element.isDeleted)
  );

  return {
    elements,
    currentElement,
    visibleElements,
    addElement,
    updateElement,
    deleteElement,
  };
}