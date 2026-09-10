'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { getHandLandmarker } from '../lib/vision/mediaPipeService';
import { HandAimDetector } from '../lib/vision/handAimDetector';
import { drawHandLandmarks } from '../lib/vision/drawingUtils';
import { GameEngine } from '../lib/game/gameEngine';

interface UseHandShooterProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  cameraCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  gameEngineRef: React.RefObject<GameEngine | null>;
  isStreaming: boolean;
  mirrored?: boolean;
}

export function useHandShooter({
  videoRef,
  cameraCanvasRef,
  gameEngineRef,
  isStreaming,
  mirrored = true,
}: UseHandShooterProps) {
  const [modelStatus, setModelStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [isHandDetected, setIsHandDetected] = useState<boolean>(false);
  const [isPinching, setIsPinching] = useState<boolean>(false);
  const [gestureBadge, setGestureBadge] = useState<'IDLE' | 'AIMING' | 'SHOOTING'>('IDLE');

  const detectorRef = useRef<HandAimDetector>(new HandAimDetector());
  const animationFrameIdRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);
  const lastPinchStateRef = useRef<boolean>(false);
  const lastDetectedStateRef = useRef<boolean>(false);

  // 1. Initialize MediaPipe Model
  useEffect(() => {
    let isMounted = true;
    setModelStatus('loading');

    getHandLandmarker()
      .then(() => {
        if (isMounted) setModelStatus('ready');
      })
      .catch(() => {
        if (isMounted) setModelStatus('error');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Continuous Hand Vision Processing Loop
  const runVisionLoop = useCallback(async () => {
    const video = videoRef.current;
    const canvas = cameraCanvasRef.current;

    if (!video || !canvas || video.readyState < 2 || video.paused || video.ended) {
      animationFrameIdRef.current = requestAnimationFrame(runVisionLoop);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      animationFrameIdRef.current = requestAnimationFrame(runVisionLoop);
      return;
    }

    // Match canvas dimensions to video
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
      const landmarker = await getHandLandmarker();

      if (video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;
        const results = landmarker.detectForVideo(video, performance.now());

        if (results && results.landmarks && results.landmarks.length > 0) {
          const landmarks = results.landmarks[0];
          const confidence = results.handednesses?.[0]?.[0]?.score || 0.9;

          const {
            detected,
            aimPoint,
            isPinching: pinchingNow,
            justPinched,
          } = detectorRef.current.process(landmarks, confidence, mirrored, Date.now());

          // Render Hand Skeleton Overlay on Camera
          drawHandLandmarks(ctx, landmarks, canvas.width, canvas.height, pinchingNow, mirrored);

          // Update Game Crosshair Position in real-time
          if (gameEngineRef.current) {
            gameEngineRef.current.setCrosshairNormalized(aimPoint.x, aimPoint.y);

            // FIRE ONCE on transition from OPEN to PINCH
            if (justPinched) {
              gameEngineRef.current.shoot();
            }
          }

          // Throttle React state updates only when state changes
          if (!lastDetectedStateRef.current) {
            lastDetectedStateRef.current = true;
            setIsHandDetected(true);
          }

          if (pinchingNow !== lastPinchStateRef.current) {
            lastPinchStateRef.current = pinchingNow;
            setIsPinching(pinchingNow);
            setGestureBadge(pinchingNow ? 'SHOOTING' : 'AIMING');
          }
        } else {
          // Hand Lost
          if (lastDetectedStateRef.current) {
            lastDetectedStateRef.current = false;
            lastPinchStateRef.current = false;
            setIsHandDetected(false);
            setIsPinching(false);
            setGestureBadge('IDLE');
            detectorRef.current.reset();
          }
        }
      }
    } catch {
      // Ignore dropped frames
    }

    animationFrameIdRef.current = requestAnimationFrame(runVisionLoop);
  }, [videoRef, cameraCanvasRef, gameEngineRef, mirrored]);

  // 3. Start or Stop Vision Loop
  useEffect(() => {
    if (isStreaming && modelStatus === 'ready') {
      animationFrameIdRef.current = requestAnimationFrame(runVisionLoop);
    } else {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      if (cameraCanvasRef.current) {
        const ctx = cameraCanvasRef.current.getContext('2d');
        ctx?.clearRect(0, 0, cameraCanvasRef.current.width, cameraCanvasRef.current.height);
      }
      setIsHandDetected(false);
      setIsPinching(false);
      setGestureBadge('IDLE');
    }

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isStreaming, modelStatus, runVisionLoop, cameraCanvasRef]);

  return {
    modelStatus,
    isHandDetected,
    isPinching,
    gestureBadge,
  };
}
