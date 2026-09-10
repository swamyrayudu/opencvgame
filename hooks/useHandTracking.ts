'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { getHandLandmarker } from '../lib/vision/mediaPipeService';
import { GestureDetector } from '../lib/vision/gestureDetector';
import { drawHandLandmarks } from '../lib/vision/drawingUtils';
import { GestureType, MoveDirection, HandTrackingData } from '../lib/puzzle/puzzleTypes';
import { soundEffects } from '../lib/audio/soundEffects';

interface UseHandTrackingProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isStreaming: boolean;
  onMoveTriggered?: (direction: MoveDirection, selectedTileIndex: number | null) => void;
  mirrored?: boolean;
}

export function useHandTracking({
  videoRef,
  canvasRef,
  isStreaming,
  onMoveTriggered,
  mirrored = true,
}: UseHandTrackingProps) {
  const [modelStatus, setModelStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [trackingData, setTrackingData] = useState<HandTrackingData>({
    detected: false,
    gesture: 'NONE',
    pinchDistance: 1,
    isPinching: false,
    handConfidence: 0,
    cursor: null,
    screenCursor: null,
    hoveredTileIndex: null,
    selectedTileIndex: null,
    rawLandmarks: null,
  });

  const gestureDetectorRef = useRef<GestureDetector>(new GestureDetector());
  const animationFrameIdRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);
  const lastGestureStateRef = useRef<{
    detected: boolean;
    gesture: GestureType;
    isPinching: boolean;
    hoveredTile: number | null;
    selectedTile: number | null;
  }>({
    detected: false,
    gesture: 'NONE',
    isPinching: false,
    hoveredTile: null,
    selectedTile: null,
  });

  // 1. Initialize MediaPipe Model
  useEffect(() => {
    let isMounted = true;
    if (typeof window === 'undefined') return;

    setModelStatus('loading');
    getHandLandmarker()
      .then(() => {
        if (isMounted) {
          setModelStatus('ready');
        }
      })
      .catch((err) => {
        if (isMounted) {
          setModelStatus('error');
          setErrorMessage(err instanceof Error ? err.message : 'Failed to load hand tracking model.');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Real-time Detection Loop
  const runDetection = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.readyState < 2 || video.paused || video.ended) {
      animationFrameIdRef.current = requestAnimationFrame(runDetection);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      animationFrameIdRef.current = requestAnimationFrame(runDetection);
      return;
    }

    // Match canvas display resolution to video dimensions
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
    }

    // Clear previous drawing frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
      const landmarker = await getHandLandmarker();

      if (video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;
        const startTimeMs = performance.now();
        const results = landmarker.detectForVideo(video, startTimeMs);

        if (results && results.landmarks && results.landmarks.length > 0) {
          const landmarks = results.landmarks[0];
          const confidence = results.handednesses?.[0]?.[0]?.score || 0.9;

          // Process gestures
          const detector = gestureDetectorRef.current;
          const {
            gesture,
            isPinching,
            pinchRatio,
            cursor,
            hoveredTileIndex,
            selectedTileIndex,
            triggeredMove,
          } = detector.processLandmarks(landmarks, Date.now(), mirrored);

          // Render landmarks on canvas
          drawHandLandmarks(ctx, landmarks, canvas.width, canvas.height, isPinching, mirrored);

          // Audio cue on pinch start
          if (isPinching && !lastGestureStateRef.current.isPinching) {
            soundEffects.playPinch();
          }

          // Trigger move callback if direction detected
          if (triggeredMove && onMoveTriggered) {
            onMoveTriggered(triggeredMove, selectedTileIndex);
          }

          // Update React state only on meaningful changes to avoid 60fps React re-renders
          const last = lastGestureStateRef.current;
          const stateChanged =
            !last.detected ||
            last.gesture !== gesture ||
            last.isPinching !== isPinching ||
            last.hoveredTile !== hoveredTileIndex ||
            last.selectedTile !== selectedTileIndex;

          if (stateChanged) {
            lastGestureStateRef.current = {
              detected: true,
              gesture,
              isPinching,
              hoveredTile: hoveredTileIndex,
              selectedTile: selectedTileIndex,
            };

            setTrackingData({
              detected: true,
              gesture,
              pinchDistance: Math.round(pinchRatio * 100) / 100,
              isPinching,
              handConfidence: Math.round(confidence * 100),
              cursor,
              screenCursor: {
                x: cursor.x * canvas.width,
                y: cursor.y * canvas.height,
              },
              hoveredTileIndex,
              selectedTileIndex,
              rawLandmarks: landmarks,
            });
          }
        } else {
          // No hands detected
          if (lastGestureStateRef.current.detected) {
            lastGestureStateRef.current = {
              detected: false,
              gesture: 'NONE',
              isPinching: false,
              hoveredTile: null,
              selectedTile: null,
            };
            gestureDetectorRef.current.reset();

            setTrackingData((prev) => ({
              ...prev,
              detected: false,
              gesture: 'NONE',
              isPinching: false,
              hoveredTileIndex: null,
              selectedTileIndex: null,
              rawLandmarks: null,
            }));
          }
        }
      }
    } catch {
      // Ignore frame drop
    }

    animationFrameIdRef.current = requestAnimationFrame(runDetection);
  }, [videoRef, canvasRef, mirrored, onMoveTriggered]);

  // 3. Start or Stop detection loop based on streaming state
  useEffect(() => {
    if (isStreaming && modelStatus === 'ready') {
      animationFrameIdRef.current = requestAnimationFrame(runDetection);
    } else {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      lastGestureStateRef.current.detected = false;
      setTrackingData((prev) => ({
        ...prev,
        detected: false,
        gesture: 'NONE',
        isPinching: false,
        hoveredTileIndex: null,
        selectedTileIndex: null,
      }));
    }

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isStreaming, modelStatus, runDetection, canvasRef]);

  return {
    modelStatus,
    errorMessage,
    trackingData,
  };
}
