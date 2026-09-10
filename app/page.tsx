'use client';

import React, { useState, useRef, useCallback } from 'react';
import { GameHUD } from '../components/GameHUD';
import { GameCanvas } from '../components/GameCanvas';
import { CameraFeed } from '../components/CameraFeed';
import { StartScreen } from '../components/StartScreen';
import { GameOverModal } from '../components/GameOverModal';
import { PresentationGuide } from '../components/PresentationGuide';
import { useCamera } from '../hooks/useCamera';
import { useHandShooter } from '../hooks/useHandShooter';
import { GameEngine } from '../lib/game/gameEngine';
import { GameMetrics } from '../lib/game/types';
import { RotateCcw, Play, MousePointer, Keyboard, ShieldCheck } from 'lucide-react';

export default function HandShooterHome() {
  const [metrics, setMetrics] = useState<GameMetrics>({
    score: 0,
    lives: 5,
    maxLives: 5,
    level: 1,
    dronesDestroyed: 0,
    shotsFired: 0,
    shotsHit: 0,
    accuracy: 0,
    status: 'IDLE',
  });

  const [mirrored, setMirrored] = useState<boolean>(true);
  const [isDemoGuideOpen, setIsDemoGuideOpen] = useState<boolean>(false);

  const gameEngineRef = useRef<GameEngine | null>(null);
  const cameraCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // 1. Camera Hook
  const {
    isStreaming: isCameraStreaming,
    isLoading: isCameraLoading,
    error: cameraError,
    videoRef,
    startCamera,
    stopCamera,
  } = useCamera();

  // 2. Hand Vision & Shooter Hook
  const { modelStatus, isHandDetected, isPinching, gestureBadge } = useHandShooter({
    videoRef,
    cameraCanvasRef,
    gameEngineRef,
    isStreaming: isCameraStreaming,
    mirrored,
  });

  // 3. Game Control Handlers
  const handleStartGame = useCallback(() => {
    gameEngineRef.current?.start();
  }, []);

  const handlePlayAgain = useCallback(() => {
    gameEngineRef.current?.start();
  }, []);

  const handleMetricsUpdate = useCallback((updatedMetrics: GameMetrics) => {
    setMetrics(updatedMetrics);
  }, []);

  const handleGameOver = useCallback((finalMetrics: GameMetrics) => {
    setMetrics(finalMetrics);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col gap-4">
        {/* Game HUD Bar */}
        <GameHUD
          metrics={metrics}
          isHandDetected={isHandDetected}
          gestureBadge={gestureBadge}
          isPinching={isPinching}
          onOpenDemoGuide={() => setIsDemoGuideOpen(true)}
        />

        {/* Interactive 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          {/* MAIN GAME CANVAS SECTION (7 cols on desktop) */}
          <section className="lg:col-span-8 flex flex-col gap-3 relative">
            <div className="relative w-full">
              <GameCanvas
                gameEngineRef={gameEngineRef}
                onMetricsUpdate={handleMetricsUpdate}
                onGameOver={handleGameOver}
              />

              {/* Start Screen Overlay */}
              {metrics.status === 'IDLE' && (
                <StartScreen
                  isCameraStreaming={isCameraStreaming}
                  isCameraLoading={isCameraLoading}
                  onStartCamera={startCamera}
                  onStartGame={handleStartGame}
                />
              )}

              {/* Game Over Screen Overlay */}
              {metrics.status === 'GAMEOVER' && (
                <GameOverModal metrics={metrics} onPlayAgain={handlePlayAgain} />
              )}
            </div>

            {/* Quick In-Game Controls Bar */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-white/5 text-xs font-mono">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleStartGame}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all shadow-md active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>RESTART</span>
                </button>
              </div>

              {/* Controls hint */}
              <div className="hidden sm:flex items-center gap-2 text-slate-400 text-[11px]">
                <Keyboard className="w-3.5 h-3.5 text-cyan-400" />
                <span>Space / Mouse Click to Shoot</span>
              </div>
            </div>
          </section>

          {/* COMPUTER VISION & SENSORS SIDEBAR (4 cols on desktop) */}
          <aside className="lg:col-span-4 flex flex-col gap-3">
            {/* Live Camera Feed Box */}
            <CameraFeed
              videoRef={videoRef}
              cameraCanvasRef={cameraCanvasRef}
              isStreaming={isCameraStreaming}
              isLoading={isCameraLoading}
              cameraError={cameraError}
              modelStatus={modelStatus}
              isHandDetected={isHandDetected}
              mirrored={mirrored}
              onToggleMirror={() => setMirrored((prev) => !prev)}
              onStartCamera={startCamera}
              onStopCamera={stopCamera}
              onUseMouseMode={handleStartGame}
            />

            {/* Quick Gesture Guide Card */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 flex flex-col gap-2.5 font-mono text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                CONTROLS REFERENCE
              </span>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5 flex items-center gap-2.5">
                <span className="text-xl">☝️</span>
                <div>
                  <strong className="text-cyan-400 block text-xs">INDEX FINGER AIM</strong>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Aim your index fingertip to move the crosshair.
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5 flex items-center gap-2.5">
                <span className="text-xl">🤏</span>
                <div>
                  <strong className="text-pink-400 block text-xs">COMBINE FINGERS TO SHOOT</strong>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Touch thumb & index together to shoot fast! Separate to stop.
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5 flex items-center gap-2.5">
                <span className="text-xl">🖱️</span>
                <div>
                  <strong className="text-indigo-400 block text-xs">MOUSE & TOUCH BACKUP</strong>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Move cursor and click (or tap / press Space) to shoot.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Demo Guide Modal */}
      <PresentationGuide
        isOpen={isDemoGuideOpen}
        onClose={() => setIsDemoGuideOpen(false)}
      />
    </div>
  );
}
