'use client';

import React, { useState } from 'react';
import { GameMetrics } from '../lib/game/types';
import { Volume2, VolumeX, Shield, Heart, Crosshair, Target, Zap, Hand } from 'lucide-react';
import { gameAudio } from '../lib/audio/gameAudio';

interface GameHUDProps {
  metrics: GameMetrics;
  isHandDetected: boolean;
  gestureBadge: 'IDLE' | 'AIMING' | 'SHOOTING';
  isPinching: boolean;
  onOpenDemoGuide: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  metrics,
  isHandDetected,
  gestureBadge,
  isPinching,
  onOpenDemoGuide,
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(() => gameAudio.getMuted());

  const handleToggleMute = () => {
    const nextMute = gameAudio.toggleMute();
    setIsMuted(nextMute);
  };

  const renderHearts = () => {
    const maxHearts = metrics.maxLives || 5;
    const hearts = [];
    for (let i = 0; i < maxHearts; i++) {
      const isAlive = i < metrics.lives;
      hearts.push(
        <Heart
          key={i}
          className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${
            isAlive
              ? 'fill-rose-500 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.7)] scale-100'
              : 'fill-slate-800 text-slate-700 scale-90 opacity-30'
          }`}
        />
      );
    }
    return hearts;
  };

  return (
    <div className="w-full flex flex-col gap-2 p-3 sm:p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-2xl">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-lg shadow-cyan-500/25 ring-1 ring-white/20">
            <Target className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-wider text-white uppercase font-mono">
                HAND SHOOTER
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                CV Arcade
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Point index finger to aim • Pinch to shoot
            </p>
          </div>
        </div>

        {/* Right Header Buttons */}
        <div className="flex items-center gap-2">
          {/* Audio toggle */}
          <button
            onClick={handleToggleMute}
            className="p-2 rounded-xl bg-slate-800/80 border border-white/10 text-slate-300 hover:text-white transition-colors"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Guide button */}
          <button
            onClick={onOpenDemoGuide}
            className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-semibold transition-all"
          >
            Demo Guide
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-center font-mono">
        {/* Score */}
        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5 flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-wider text-slate-400">SCORE</span>
          <span className="text-xl sm:text-2xl font-black text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">
            {String(metrics.score).padStart(4, '0')}
          </span>
        </div>

        {/* Level */}
        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5 flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-wider text-slate-400">LEVEL</span>
          <span className="text-xl sm:text-2xl font-black text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]">
            {metrics.level}
          </span>
        </div>

        {/* Lives */}
        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5 flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-wider text-slate-400">LIVES</span>
          <div className="flex items-center gap-1 mt-1">{renderHearts()}</div>
        </div>

        {/* Accuracy */}
        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5 flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-wider text-slate-400">ACCURACY</span>
          <span className="text-lg sm:text-xl font-bold text-white mt-0.5">
            {metrics.accuracy}%
          </span>
        </div>

        {/* Hand Status & Gesture */}
        <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-slate-950/70 border border-white/5 flex flex-col items-center justify-center">
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <span
              className={`h-2 w-2 rounded-full ${
                isHandDetected ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'
              }`}
            ></span>
            <span className={isHandDetected ? 'text-cyan-300' : 'text-slate-500'}>
              {isHandDetected ? 'HAND ACTIVE' : 'NO HAND'}
            </span>
          </div>
          <span
            className={`text-[11px] font-bold uppercase mt-1 px-2 py-0.5 rounded ${
              isPinching
                ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 animate-pulse'
                : isHandDetected
                ? 'bg-cyan-500/10 text-cyan-400'
                : 'text-slate-500'
            }`}
          >
            {isPinching ? '💥 RAPID FIRE' : isHandDetected ? 'AIMING' : 'READY'}
          </span>
        </div>
      </div>
    </div>
  );
};
