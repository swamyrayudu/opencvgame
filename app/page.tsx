'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
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
import {
  RotateCcw,
  Maximize2,
  Minimize2,
  Camera,
  Eye,
  EyeOff,
  Keyboard,
} from 'lucide-react';

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
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showPipCamera, setShowPipCamera] = useState<boolean>(true);

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

  // 4. Native & In-Window Fullscreen Toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {
          // Fallback to full-window maximized mode
          setIsFullscreen((prev) => !prev);
        });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {
          setIsFullscreen(false);
        });
      } else {
        setIsFullscreen(false);
      }
    }
  }, []);

  // Listen to browser fullscreen changes (e.g. user presses Esc key)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard shortcut 'F' to toggle fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey) {
        if (!['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
          e.preventDefault();
          toggleFullscreen();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFullscreen]);

  return (
    <div
      className={`bg-[#030712] text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 ${
        isFullscreen
          ? 'fixed inset-0 z-50 w-screen h-screen flex flex-col p-2 sm:p-3 overflow-hidden select-none'
          : 'flex flex-col min-h-screen'
      }`}
    >
      {/* FULLSCREEN IMMERSIVE THEATER LAYOUT */}
      {isFullscreen ? (
        <div className="flex flex-col h-full w-full justify-between gap-2 relative">
          {/* Top Floating Arcade HUD */}
          <GameHUD
            metrics={metrics}
            isHandDetected={isHandDetected}
            gestureBadge={gestureBadge}
            isPinching={isPinching}
            onOpenDemoGuide={() => setIsDemoGuideOpen(true)}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
          />

          {/* Centered Maximized Game Canvas */}
          <div className="flex-1 w-full flex items-center justify-center relative min-h-0">
            <div className="relative h-full aspect-[4/3] max-w-full flex items-center justify-center">
              <GameCanvas
                gameEngineRef={gameEngineRef}
                onMetricsUpdate={handleMetricsUpdate}
                onGameOver={handleGameOver}
                className="h-full w-full object-contain aspect-[4/3] max-h-[calc(100vh-145px)] shadow-2xl ring-2 ring-cyan-500/20"
              />

              {/* Start Screen Overlay */}
              {metrics.status === 'IDLE' && (
                <StartScreen
                  isCameraStreaming={isCameraStreaming}
                  isCameraLoading={isCameraLoading}
                  onStartCamera={startCamera}
                  onStartGame={handleStartGame}
                  isFullscreen={isFullscreen}
                  onToggleFullscreen={toggleFullscreen}
                />
              )}

              {/* Game Over Screen Overlay */}
              {metrics.status === 'GAMEOVER' && (
                <GameOverModal metrics={metrics} onPlayAgain={handlePlayAgain} />
              )}
            </div>

            {/* Floating Picture-in-Picture (PiP) Camera Feed */}
            <div
              className={`fixed bottom-14 right-4 z-40 transition-all duration-300 ${
                showPipCamera
                  ? 'w-52 sm:w-64 aspect-[4/3] opacity-100 scale-100'
                  : 'w-0 h-0 opacity-0 pointer-events-none scale-90'
              }`}
            >
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-cyan-500/30 bg-slate-950/90 backdrop-blur-xl ring-2 ring-cyan-500/20">
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
              </div>
            </div>
          </div>

          {/* Bottom Fullscreen Control Bar */}
          <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-slate-900/80 border border-white/10 backdrop-blur text-xs font-mono">
            <div className="flex items-center gap-2">
              <button
                onClick={handleStartGame}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all shadow-md active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RESTART</span>
              </button>

              {/* Toggle Camera PiP overlay button */}
              <button
                onClick={() => setShowPipCamera((prev) => !prev)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition-colors"
                title={showPipCamera ? 'Hide Camera Feed' : 'Show Camera Feed'}
              >
                {showPipCamera ? <EyeOff className="w-3.5 h-3.5 text-cyan-400" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPipCamera ? 'HIDE CAMERA' : 'SHOW CAMERA'}</span>
              </button>
            </div>

            <div className="flex items-center gap-3 text-slate-400 text-[11px]">
              <div className="hidden sm:flex items-center gap-1.5">
                <Keyboard className="w-3.5 h-3.5 text-cyan-400" />
                <span>Space / Mouse Click to Shoot • Press F for Window Mode</span>
              </div>

              <button
                onClick={toggleFullscreen}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 font-bold"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>EXIT FULLSCREEN</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* STANDARD RESPONSIVE 2-COLUMN LAYOUT */
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col gap-4">
          {/* Game HUD Bar */}
          <GameHUD
            metrics={metrics}
            isHandDetected={isHandDetected}
            gestureBadge={gestureBadge}
            isPinching={isPinching}
            onOpenDemoGuide={() => setIsDemoGuideOpen(true)}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
          />

          {/* Interactive 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
            {/* MAIN GAME CANVAS SECTION (8 cols on desktop) */}
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
                    isFullscreen={isFullscreen}
                    onToggleFullscreen={toggleFullscreen}
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

                  <button
                    onClick={toggleFullscreen}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 font-bold transition-all shadow-md active:scale-95"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>FULLSCREEN (F)</span>
                  </button>
                </div>

                {/* Controls hint */}
                <div className="hidden sm:flex items-center gap-2 text-slate-400 text-[11px]">
                  <Keyboard className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Space / Mouse Click to Shoot • Press F for Fullscreen</span>
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
                  <span className="text-xl">❤️</span>
                  <div>
                    <strong className="text-emerald-400 block text-xs">5 LIVES + HEALTH DRONES</strong>
                    <p className="text-[11px] text-slate-400 font-sans">
                      Shoot green + drones to recover lost hearts.
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
      )}

      {/* Demo Guide Modal */}
      <PresentationGuide
        isOpen={isDemoGuideOpen}
        onClose={() => setIsDemoGuideOpen(false)}
      />
    </div>
  );
}
