import type { Element } from '../types';

export const isPointInElement = (x: number, y: number, element: Element): boolean => {
  const { type } = element;

  switch (type) {
    case 'rectangle':
      return isPointInRectangle(x, y, element);
    case 'ellipse':
      return isPointInEllipse(x, y, element);
    case 'arrow':
      return isPointInArrow(x, y, element);
    case 'text':
      return isPointInText(x, y, element);
    default:
      return false;
  }
};

const isPointInRectangle = (x: number, y: number, element: Element): boolean => {
  const minX = Math.min(element.x, element.x + element.width);
  const maxX = Math.max(element.x, element.x + element.width);
  const minY = Math.min(element.y, element.y + element.height);
  const maxY = Math.max(element.y, element.y + element.height);

  return x >= minX && x <= maxX && y >= minY && y <= maxY;
};

const isPointInEllipse = (x: number, y: number, element: Element): boolean => {
  const centerX = element.x + element.width / 2;
  const centerY = element.y + element.height / 2;
  const rx = Math.abs(element.width / 2);
  const ry = Math.abs(element.height / 2);

  if (rx === 0 || ry === 0) return false;

  const normalizedX = (x - centerX) / rx;
  const normalizedY = (y - centerY) / ry;

  return (normalizedX * normalizedX + normalizedY * normalizedY) <= 1;
};

const isPointInArrow = (x: number, y: number, element: Element): boolean => {
  const threshold = 5; // Distance threshold for hit detection
  const startX = element.x;
  const startY = element.y;
  const endX = element.x + element.width;
  const endY = element.y + element.height;

  // Calculate distance from point to line segment
  const lineLength = Math.sqrt(element.width * element.width + element.height * element.height);
  if (lineLength === 0) return false;

  const distance = Math.abs(
    (endY - startY) * x - (endX - startX) * y + endX * startY - endY * startX
  ) / lineLength;

  // Check if point is within the bounds of the line segment
  const dotProduct = 
    ((x - startX) * (endX - startX) + (y - startY) * (endY - startY)) / (lineLength * lineLength);

  return distance <= threshold && dotProduct >= 0 && dotProduct <= 1;
};

const isPointInText = (x: number, y: number, element: Element): boolean => {
  const textHeight = 24; // Approximate text height
  const textWidth = element.text ? element.text.length * 12 : 0; // Approximate text width

  return x >= element.x &&
         x <= element.x + textWidth &&
         y >= element.y &&
         y <= element.y + textHeight;
};