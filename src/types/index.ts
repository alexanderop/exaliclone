export interface Element {
  id: string;
  type: 'rectangle' | 'ellipse' | 'arrow' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor: string;
  backgroundColor: string;
  roughness: number;
  version: number;
  isDeleted?: boolean;
  text?: string;
}