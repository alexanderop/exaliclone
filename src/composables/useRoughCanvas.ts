import { onMounted, ref } from 'vue';
import rough from 'roughjs';
import type { Element } from '../types';

export function useRoughCanvas() {
  const canvasRef = ref<HTMLCanvasElement | null>(null);
  const roughCanvas = ref<any>(null);

  onMounted(() => {
    if (canvasRef.value) {
      roughCanvas.value = rough.canvas(canvasRef.value);
    }
  });

  const drawArrowHead = (ctx: CanvasRenderingContext2D, from: { x: number; y: number }, to: { x: number; y: number }, color: string) => {
    const headLength = 20;
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(
      to.x - headLength * Math.cos(angle - Math.PI / 6),
      to.y - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(
      to.x - headLength * Math.cos(angle + Math.PI / 6),
      to.y - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const drawText = (ctx: CanvasRenderingContext2D, element: Element) => {
    ctx.font = '20px Virgil';
    ctx.fillStyle = element.strokeColor;
    ctx.fillText(element.text || '', element.x, element.y + 20);
  };

  const drawElement = (element: Element) => {
    if (!roughCanvas.value || !canvasRef.value) return;

    const ctx = canvasRef.value.getContext('2d');
    if (!ctx) return;

    const generator = roughCanvas.value.generator;
    let shape;

    switch (element.type) {
      case 'text':
        drawText(ctx, element);
        return;
      case 'rectangle':
        shape = generator.rectangle(
          element.x,
          element.y,
          element.width,
          element.height,
          {
            stroke: element.strokeColor,
            fill: element.backgroundColor,
            roughness: element.roughness,
          }
        );
        break;
      case 'ellipse':
        shape = generator.ellipse(
          element.x + element.width / 2,
          element.y + element.height / 2,
          element.width,
          element.height,
          {
            stroke: element.strokeColor,
            fill: element.backgroundColor,
            roughness: element.roughness,
          }
        );
        break;
      case 'arrow':
        shape = generator.line(
          element.x,
          element.y,
          element.x + element.width,
          element.y + element.height,
          {
            stroke: element.strokeColor,
            roughness: element.roughness,
          }
        );
        roughCanvas.value.draw(shape);
        drawArrowHead(
          ctx,
          { x: element.x, y: element.y },
          { x: element.x + element.width, y: element.y + element.height },
          element.strokeColor
        );
        return;
    }

    if (shape) {
      roughCanvas.value.draw(shape);
    }
  };

  return {
    canvasRef,
    drawElement,
  };
}