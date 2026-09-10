export type BoardState = number[]; // 9 elements, 0 = empty space, 1..8 = numbered tiles

export type MoveDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface PuzzleMove {
  tile: number;
  fromIndex: number;
  toIndex: number;
  direction: MoveDirection;
}

export interface PuzzleSolution {
  solved: boolean;
  moves: PuzzleMove[];
  stepsCount: number;
  path: BoardState[];
  solveTimeMs: number;
}

export type GestureType = 
  | 'NONE' 
  | 'POINT' 
  | 'PINCH' 
  | 'MOVE_UP' 
  | 'MOVE_DOWN' 
  | 'MOVE_LEFT' 
  | 'MOVE_RIGHT';

export interface HandTrackingData {
  detected: boolean;
  gesture: GestureType;
  pinchDistance: number;
  isPinching: boolean;
  handConfidence: number;
  cursor: { x: number; y: number } | null; // Normalized 0..1 coordinates relative to board/camera
  screenCursor: { x: number; y: number } | null;
  hoveredTileIndex: number | null;
  selectedTileIndex: number | null;
  rawLandmarks: { x: number; y: number; z: number }[] | null;
}

export interface GameStats {
  movesCount: number;
  timerSeconds: number;
  isSolved: boolean;
  isAutoSolving: boolean;
}
