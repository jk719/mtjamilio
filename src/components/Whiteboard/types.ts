export type Tool = 'pen' | 'eraser' | 'text' | 'circle' | 'rectangle' | 'triangle' | 'line' | 'select';

export type Color = string;

export type GridType = 'none' | 'dots' | 'lines' | 'coordinate';

export interface Point {
  x: number;
  y: number;
  pressure?: number;
}

export interface Touch {
  id: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  pressure: number;
}

export interface Shape {
  id: string;
  type: 'path' | 'circle' | 'rectangle' | 'line' | 'triangle' | 'text';
  color: Color;
  lineWidth: number;
  points: Point[];
  tool?: Tool; // Track which tool was used to create this shape
  center?: Point;
  radius?: number;
  start?: Point;
  end?: Point;
  width?: number;
  height?: number;
  text?: string;
  fontSize?: number;
}

export interface WhiteboardState {
  shapes: Shape[];
  currentTool: Tool;
  currentColor: Color;
  currentLineWidth: number;
  gridType: GridType;
  snapToGrid: boolean;
  zoom: number;
  pan: Point;
}

export interface DrawingContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  tool: Tool;
  color: Color;
  lineWidth: number;
  snapToGrid: boolean;
  gridType: GridType;
}

export interface GestureState {
  isPinching: boolean;
  isPanning: boolean;
  startDistance: number;
  startCenter: Point;
  currentScale: number;
}
