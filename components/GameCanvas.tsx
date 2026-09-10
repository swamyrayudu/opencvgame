'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { GameEngine } from '../lib/game/gameEngine';
import { GameMetrics } from '../lib/game/types';

interface GameCanvasProps {
  gameEngineRef: React.MutableRefObject<GameEngine | null>;
  onMetricsUpdate: (metrics: GameMetrics) => void;
  onGameOver: (metrics: GameMetrics) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameEngineRef,
  onMetricsUpdate,
  onGameOver,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize GameEngine once canvas mounts
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Internal canvas resolution
    canvas.width = 640;
    canvas.height = 480;

    const engine = new GameEngine(canvas, {
      onMetricsUpdate,
      onGameOver,
    });

    gameEngineRef.current = engine;
    engine.render(); // Initial static frame

    return () => {
      engine.stop();
      gameEngineRef.current = null;
    };
  }, [gameEngineRef, onMetricsUpdate, onGameOver]);

  // Mouse fallback handler
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      const engine = gameEngineRef.current;
      if (!canvas || !engine) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const canvasX = (e.clientX - rect.left) * scaleX;
      const canvasY = (e.clientY - rect.top) * scaleY;

      engine.setCrosshairPixels(canvasX, canvasY);
    },
    [gameEngineRef]
  );

  const handleClick = useCallback(() => {
    gameEngineRef.current?.shoot();
  }, [gameEngineRef]);

  // Touch fallback handler
  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      const engine = gameEngineRef.current;
      if (!canvas || !engine || e.touches.length === 0) return;

      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const canvasX = (touch.clientX - rect.left) * scaleX;
      const canvasY = (touch.clientY - rect.top) * scaleY;

      engine.setCrosshairPixels(canvasX, canvasY);
    },
    [gameEngineRef]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      handleTouchMove(e);
      gameEngineRef.current?.shoot();
    },
    [handleTouchMove, gameEngineRef]
  );

  // Keyboard Spacebar shooting fallback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        gameEngineRef.current?.shoot();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameEngineRef]);

  return (
    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-white/10 shadow-2xl ring-1 ring-white/5 cursor-crosshair select-none">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        onTouchMove={handleTouchMove}
        onTouchStart={handleTouchStart}
        className="w-full h-full object-contain block"
      />
    </div>
  );
};
