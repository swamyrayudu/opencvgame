import { GestureType, MoveDirection } from '../puzzle/puzzleTypes';

export interface Point2D {
  x: number;
  y: number;
}

export interface Landmark3D {
  x: number;
  y: number;
  z: number;
}

export interface GestureDetectorState {
  smoothedCursor: Point2D;
  isPinching: boolean;
  pinchStartPos: Point2D | null;
  lastMoveTimestamp: number;
  currentGesture: GestureType;
  hoveredTileIndex: number | null;
  selectedTileIndex: number | null;
}

const PINCH_TRIGGER_RATIO = 0.38;
const PINCH_RELEASE_RATIO = 0.50;
const MIN_DRAG_DISTANCE = 0.07; // Normalized distance threshold to trigger move
const MOVE_COOLDOWN_MS = 450; // Minimum ms between consecutive moves
const EMA_ALPHA = 0.45; // Smoothing factor (0 = infinite smooth, 1 = no smooth)

export class GestureDetector {
  private smoothedCursor: Point2D = { x: 0.5, y: 0.5 };
  private isPinching: boolean = false;
  private pinchStartPos: Point2D | null = null;
  private lastMoveTimestamp: number = 0;
  private currentGesture: GestureType = 'NONE';
  private hoveredTileIndex: number | null = null;
  private selectedTileIndex: number | null = null;

  public reset() {
    this.isPinching = false;
    this.pinchStartPos = null;
    this.currentGesture = 'NONE';
    this.hoveredTileIndex = null;
    this.selectedTileIndex = null;
  }

  /**
   * Processes a single frame of 21 MediaPipe landmarks.
   * Returns gesture, hovered tile, selected tile, and whether a move should be triggered.
   */
  public processLandmarks(
    landmarks: Landmark3D[],
    timestamp: number = Date.now(),
    mirrored: boolean = true
  ): {
    gesture: GestureType;
    isPinching: boolean;
    pinchRatio: number;
    cursor: Point2D;
    hoveredTileIndex: number | null;
    selectedTileIndex: number | null;
    triggeredMove: MoveDirection | null;
  } {
    if (!landmarks || landmarks.length < 21) {
      this.reset();
      return {
        gesture: 'NONE',
        isPinching: false,
        pinchRatio: 1,
        cursor: this.smoothedCursor,
        hoveredTileIndex: null,
        selectedTileIndex: null,
        triggeredMove: null,
      };
    }

    const wrist = landmarks[0];
    const thumbTip = landmarks[4];
    const indexMcp = landmarks[5];
    const indexTip = landmarks[8];
    const middleMcp = landmarks[9];

    // 1. Mirrored coordinates calculation for index tip
    const rawX = mirrored ? 1 - indexTip.x : indexTip.x;
    const rawY = indexTip.y;

    // Exponential Moving Average (EMA) smoothing
    this.smoothedCursor = {
      x: EMA_ALPHA * rawX + (1 - EMA_ALPHA) * this.smoothedCursor.x,
      y: EMA_ALPHA * rawY + (1 - EMA_ALPHA) * this.smoothedCursor.y,
    };

    // 2. Hand scale estimation (Wrist to Middle MCP distance)
    const handScale = Math.hypot(middleMcp.x - wrist.x, middleMcp.y - wrist.y) || 0.2;

    // Euclidean distance between Thumb Tip and Index Tip
    const thumbIndexDist = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);
    const pinchRatio = thumbIndexDist / handScale;

    // 3. Pinch Hysteresis
    const wasPinching = this.isPinching;
    if (this.isPinching) {
      if (pinchRatio > PINCH_RELEASE_RATIO) {
        this.isPinching = false;
        this.pinchStartPos = null;
        this.selectedTileIndex = null;
      }
    } else {
      if (pinchRatio < PINCH_TRIGGER_RATIO) {
        this.isPinching = true;
        this.pinchStartPos = { ...this.smoothedCursor };
        // Select currently hovered tile on pinch start
        this.selectedTileIndex = this.hoveredTileIndex;
      }
    }

    // 4. Map cursor to 3x3 tile index
    // Use an active interaction region in the center of the camera view [0.15, 0.85]
    const zoneMin = 0.12;
    const zoneMax = 0.88;
    const zoneSize = zoneMax - zoneMin;

    const clampedX = Math.max(zoneMin, Math.min(zoneMax, this.smoothedCursor.x));
    const clampedY = Math.max(zoneMin, Math.min(zoneMax, this.smoothedCursor.y));

    const col = Math.min(2, Math.floor(((clampedX - zoneMin) / zoneSize) * 3));
    const row = Math.min(2, Math.floor(((clampedY - zoneMin) / zoneSize) * 3));
    this.hoveredTileIndex = row * 3 + col;

    // If just began pinching and didn't have selected tile yet, grab hovered
    if (this.isPinching && !wasPinching) {
      this.selectedTileIndex = this.hoveredTileIndex;
    }

    // 5. Detect Directional Movement
    let triggeredMove: MoveDirection | null = null;
    let currentGesture: GestureType = this.isPinching ? 'PINCH' : 'POINT';

    if (this.isPinching && this.pinchStartPos) {
      const dx = this.smoothedCursor.x - this.pinchStartPos.x;
      const dy = this.smoothedCursor.y - this.pinchStartPos.y;
      const dist = Math.hypot(dx, dy);

      if (dist >= MIN_DRAG_DISTANCE && timestamp - this.lastMoveTimestamp > MOVE_COOLDOWN_MS) {
        if (Math.abs(dx) > Math.abs(dy)) {
          if (dx > 0) {
            triggeredMove = 'RIGHT';
            currentGesture = 'MOVE_RIGHT';
          } else {
            triggeredMove = 'LEFT';
            currentGesture = 'MOVE_LEFT';
          }
        } else {
          if (dy > 0) {
            triggeredMove = 'DOWN';
            currentGesture = 'MOVE_DOWN';
          } else {
            triggeredMove = 'UP';
            currentGesture = 'MOVE_UP';
          }
        }

        // Reset pinch origin after move to allow sequential dragging
        this.pinchStartPos = { ...this.smoothedCursor };
        this.lastMoveTimestamp = timestamp;
      }
    }

    this.currentGesture = currentGesture;

    return {
      gesture: this.currentGesture,
      isPinching: this.isPinching,
      pinchRatio,
      cursor: this.smoothedCursor,
      hoveredTileIndex: this.hoveredTileIndex,
      selectedTileIndex: this.selectedTileIndex,
      triggeredMove,
    };
  }
}
