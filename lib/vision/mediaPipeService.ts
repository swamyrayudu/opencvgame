// MediaPipe Tasks Vision service for real-time client-side hand tracking

export interface HandLandmarkerResult {
  landmarks: { x: number; y: number; z: number }[][];
  worldLandmarks: { x: number; y: number; z: number }[][];
  handednesses: { index: number; score: number; categoryName: string; displayName: string }[][];
}

// MediaPipe HandLandmarker instance interface
export interface HandLandmarkerInstance {
  detectForVideo(videoFrame: HTMLVideoElement, timestampMs: number): HandLandmarkerResult;
  close(): void;
}

let handLandmarkerInstance: HandLandmarkerInstance | null = null;
let isInitializing = false;
let initPromise: Promise<HandLandmarkerInstance> | null = null;

/**
 * Initializes MediaPipe HandLandmarker using the browser WebAssembly runtime.
 * Only runs in client-side environment.
 */
export async function getHandLandmarker(): Promise<HandLandmarkerInstance> {
  if (handLandmarkerInstance) {
    return handLandmarkerInstance;
  }

  if (initPromise) {
    return initPromise;
  }

  if (typeof window === 'undefined') {
    throw new Error('MediaPipe HandLandmarker can only be initialized on the client side.');
  }

  isInitializing = true;

  initPromise = (async () => {
    try {
      const { FilesetResolver, HandLandmarker } = await import('@mediapipe/tasks-vision');

      // Wasm asset resolver
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
      );

      // Initialize HandLandmarker with float16 model
      const landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 1,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      handLandmarkerInstance = landmarker as unknown as HandLandmarkerInstance;
      isInitializing = false;
      return handLandmarkerInstance;
    } catch (err) {
      isInitializing = false;
      initPromise = null;
      console.error('Failed to initialize MediaPipe HandLandmarker:', err);
      throw err;
    }
  })();

  return initPromise;
}

export function isHandLandmarkerReady(): boolean {
  return handLandmarkerInstance !== null;
}

export function isHandLandmarkerLoading(): boolean {
  return isInitializing;
}
