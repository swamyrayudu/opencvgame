// Canvas drawing utilities for MediaPipe Hand landmarks, skeleton, joints, and gestures

export const HAND_CONNECTIONS = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle
  [5, 9], [9, 10], [10, 11], [11, 12],
  // Ring
  [9, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [13, 17], [17, 18], [18, 19], [19, 20],
  // Palm base
  [0, 17]
];

export interface LandmarkPoint {
  x: number;
  y: number;
  z?: number;
}

export function drawHandLandmarks(
  ctx: CanvasRenderingContext2D,
  landmarks: LandmarkPoint[],
  width: number,
  height: number,
  isPinching: boolean,
  mirrored: boolean = true
) {
  ctx.save();

  // Helper to map normalized coordinates to canvas pixels
  const getCanvasCoords = (pt: LandmarkPoint) => {
    const rawX = mirrored ? 1 - pt.x : pt.x;
    return {
      x: rawX * width,
      y: pt.y * height,
    };
  };

  // 1. Draw skeleton connection lines
  ctx.lineWidth = 3;
  for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
    const p1 = getCanvasCoords(landmarks[startIdx]);
    const p2 = getCanvasCoords(landmarks[endIdx]);

    const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
    if (isPinching) {
      gradient.addColorStop(0, 'rgba(236, 72, 153, 0.7)'); // Pink/Rose
      gradient.addColorStop(1, 'rgba(168, 85, 247, 0.7)'); // Purple
    } else {
      gradient.addColorStop(0, 'rgba(6, 182, 212, 0.7)'); // Cyan
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0.7)'); // Blue
    }

    ctx.strokeStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }

  // 2. Draw joints
  for (let i = 0; i < landmarks.length; i++) {
    const p = getCanvasCoords(landmarks[i]);
    const isSpecial = i === 4 || i === 8 || i === 0; // Thumb tip, index tip, wrist

    ctx.beginPath();
    ctx.arc(p.x, p.y, isSpecial ? 5 : 3.5, 0, 2 * Math.PI);

    if (i === 8) {
      // Index Tip
      ctx.fillStyle = isPinching ? '#ec4899' : '#06b6d4';
      ctx.shadowColor = isPinching ? '#f43f5e' : '#22d3ee';
      ctx.shadowBlur = 10;
    } else if (i === 4) {
      // Thumb Tip
      ctx.fillStyle = isPinching ? '#ec4899' : '#10b981';
      ctx.shadowColor = isPinching ? '#f43f5e' : '#34d399';
      ctx.shadowBlur = 10;
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.shadowBlur = 0;
    }

    ctx.fill();

    // Outer ring for key tips
    if (isSpecial) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  // 3. Pinch indicator arc between thumb tip and index tip
  const thumb = getCanvasCoords(landmarks[4]);
  const index = getCanvasCoords(landmarks[8]);

  if (isPinching) {
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#f43f5e';
    ctx.moveTo(thumb.x, thumb.y);
    ctx.lineTo(index.x, index.y);
    ctx.stroke();

    // Midpoint pulse ring
    const midX = (thumb.x + index.x) / 2;
    const midY = (thumb.y + index.y) / 2;
    ctx.beginPath();
    ctx.arc(midX, midY, 14, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ec4899';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PINCH', midX, midY - 18);
    ctx.restore();
  }

  // 4. Virtual Reticle / Cursor at Index Tip
  ctx.save();
  ctx.beginPath();
  ctx.arc(index.x, index.y, isPinching ? 18 : 12, 0, 2 * Math.PI);
  ctx.strokeStyle = isPinching ? '#ec4899' : '#06b6d4';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Crosshairs
  const crossSize = isPinching ? 8 : 6;
  ctx.beginPath();
  ctx.moveTo(index.x - crossSize, index.y);
  ctx.lineTo(index.x + crossSize, index.y);
  ctx.moveTo(index.x, index.y - crossSize);
  ctx.lineTo(index.x, index.y + crossSize);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();

  ctx.restore();
}
