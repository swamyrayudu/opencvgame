export interface NormalizedPoint {
  x: number;
  y: number;
}

export interface Landmark3D {
  x: number;
  y: number;
  z: number;
}

export interface HandAimResult {
  detected: boolean;
  aimPoint: NormalizedPoint; // 0..1 coordinates for canvas mapping
  isPinching: boolean;
  justPinched: boolean; // True on each fire event (initial tap or continuous rapid-fire)
  pinchRatio: number;
  confidence: number;
}

// Generous thresholds for effortless two-finger contact
const PINCH_TRIGGER_RATIO = 0.48; // Easy to touch index + thumb to shoot
const PINCH_RELEASE_RATIO = 0.60; // Clean release threshold
const RAPID_FIRE_INTERVAL_MS = 145; // ~7 shots/sec while fingers are combined/held

export class HandAimDetector {
  private smoothedAim: NormalizedPoint = { x: 0.5, y: 0.5 };
  private isPinching: boolean = false;
  private lastFireTimestamp: number = 0;

  public reset() {
    this.isPinching = false;
    this.smoothedAim = { x: 0.5, y: 0.5 };
    this.lastFireTimestamp = 0;
  }

  /**
   * Processes MediaPipe 21 landmarks.
   * Enables instant shooting on finger click AND rapid continuous shooting when fingers are combined.
   */
  public process(
    landmarks: Landmark3D[] | null | undefined,
    confidence: number = 0.9,
    mirrored: boolean = true,
    now: number = Date.now()
  ): HandAimResult {
    if (!landmarks || landmarks.length < 21) {
      this.isPinching = false;
      return {
        detected: false,
        aimPoint: this.smoothedAim,
        isPinching: false,
        justPinched: false,
        pinchRatio: 1,
        confidence: 0,
      };
    }

    const wrist = landmarks[0];
    const thumbTip = landmarks[4];
    const indexMcp = landmarks[5];
    const indexPip = landmarks[6];
    const indexDip = landmarks[7];
    const indexTip = landmarks[8];
    const middleMcp = landmarks[9];
    const pinkyMcp = landmarks[17];

    // 1. Mirrored coordinates calculation for index tip
    const rawX = mirrored ? 1 - indexTip.x : indexTip.x;
    const rawY = indexTip.y;

    // Adaptive Exponential Moving Average (EMA) smoothing:
    // Snappy responsiveness when moving, rock-solid lock when fine aiming
    const deltaMove = Math.hypot(rawX - this.smoothedAim.x, rawY - this.smoothedAim.y);
    const adaptiveAlpha = Math.min(0.88, Math.max(0.42, deltaMove * 4.2));

    this.smoothedAim = {
      x: adaptiveAlpha * rawX + (1 - adaptiveAlpha) * this.smoothedAim.x,
      y: adaptiveAlpha * rawY + (1 - adaptiveAlpha) * this.smoothedAim.y,
    };

    // 2. Hand scale estimation (Wrist to Middle MCP + Palm Width)
    const lengthScale = Math.hypot(middleMcp.x - wrist.x, middleMcp.y - wrist.y);
    const widthScale = Math.hypot(pinkyMcp.x - indexMcp.x, pinkyMcp.y - indexMcp.y) * 1.35;
    const handScale = Math.max(0.12, (lengthScale + widthScale) / 2);

    // 3. Multi-point distance between thumb and index (Tip, DIP, or upper pad)
    // Ensures contact is recognized whether tips touch or thumb rests against index side
    const distToTip = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);
    const distToDip = Math.hypot(thumbTip.x - indexDip.x, thumbTip.y - indexDip.y);
    const distToPip = Math.hypot(thumbTip.x - indexPip.x, thumbTip.y - indexPip.y);
    const bestThumbDist = Math.min(distToTip, distToDip * 1.08, distToPip * 1.25);

    const pinchRatio = bestThumbDist / handScale;

    // 4. Pinch State with Hysteresis
    const wasPinching = this.isPinching;
    if (this.isPinching) {
      if (pinchRatio > PINCH_RELEASE_RATIO) {
        this.isPinching = false;
      }
    } else {
      if (pinchRatio < PINCH_TRIGGER_RATIO) {
        this.isPinching = true;
      }
    }

    // 5. Dual Shooting Modes:
    // Mode A: Tap Click — Fires instantly on the very first frame fingers combine (!wasPinching && isPinching)
    // Mode B: Fast Rapid Fire — If fingers stay combined, fires consecutive shots at RAPID_FIRE_INTERVAL_MS!
    let justPinched = false;

    if (this.isPinching) {
      if (!wasPinching) {
        // Initial touch: FIRE IMMEDIATELY!
        justPinched = true;
        this.lastFireTimestamp = now;
      } else if (now - this.lastFireTimestamp >= RAPID_FIRE_INTERVAL_MS) {
        // Kept combined: RAPID FIRE!
        justPinched = true;
        this.lastFireTimestamp = now;
      }
    }

    return {
      detected: true,
      aimPoint: this.smoothedAim,
      isPinching: this.isPinching,
      justPinched,
      pinchRatio,
      confidence,
    };
  }
}
