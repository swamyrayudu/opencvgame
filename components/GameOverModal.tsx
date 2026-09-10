'use client';

import React from 'react';
import { RotateCcw, Skull, Trophy, Target, Crosshair } from 'lucide-react';
import { GameMetrics } from '../lib/game/types';

interface GameOverModalProps {
  metrics: GameMetrics;
  onPlayAgain: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ metrics, onPlayAgain }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-rose-500/30 p-6 sm:p-8 shadow-2xl text-center ring-1 ring-rose-500/20">
        {/* Skull Emblem */}
        <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-xl shadow-rose-500/20 mb-4 animate-bounce">
          <Skull className="w-8 h-8" />
        </div>

        <h3 className="text-2xl sm:text-3xl font-black text-rose-400 font-mono tracking-wider">
          GAME OVER
        </h3>
        <p className="text-xs text-slate-400 mt-1">The drones breached the danger defense line!</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 my-5 font-mono">
          {/* Final Score */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 flex flex-col items-center">
            <Trophy className="w-4 h-4 text-amber-400 mb-1" />
            <span className="text-[9px] text-slate-400 uppercase">SCORE</span>
            <span className="text-base font-black text-amber-300 mt-0.5">
              {metrics.score}
            </span>
          </div>

          {/* Drones Destroyed */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 flex flex-col items-center">
            <Target className="w-4 h-4 text-cyan-400 mb-1" />
            <span className="text-[9px] text-slate-400 uppercase">KILLS</span>
            <span className="text-base font-black text-white mt-0.5">
              {metrics.dronesDestroyed}
            </span>
          </div>

          {/* Accuracy */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 flex flex-col items-center">
            <Crosshair className="w-4 h-4 text-emerald-400 mb-1" />
            <span className="text-[9px] text-slate-400 uppercase">ACCURACY</span>
            <span className="text-base font-black text-emerald-300 mt-0.5">
              {metrics.accuracy}%
            </span>
          </div>
        </div>

        {/* Play Again Button */}
        <button
          onClick={onPlayAgain}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-sm tracking-wider uppercase shadow-lg shadow-cyan-500/25 transition-all active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>PLAY AGAIN</span>
        </button>
      </div>
    </div>
  );
};
