export interface DrawPoint {
  x: number;
  y: number;
  color: string;
  pressure?: number;
  timestamp: number;
}

export interface DrawStroke {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  points: DrawPoint[];
  color: string;
  tool: 'pencil';
  startTime: number;
  endTime: number;
}

export interface DrawMessage {
  type: 'DRAW';
  stroke: DrawStroke;
}

export interface DrawingState {
  isDrawing: boolean;
  currentColor: string;
  currentTool: 'pencil';
  points: DrawPoint[];
  lastSentTimestamp: number;
  strokeBuffer: DrawPoint[];
  isVisible: boolean;
}

export const COLORS = {
  BLACK: '#000000',
  RED: '#FF0000',
  BLUE: '#0000FF',
  GREEN: '#00FF00'
} as const;

export type DrawingColor = typeof COLORS[keyof typeof COLORS]; 