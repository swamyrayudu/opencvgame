'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Clock, Footprints, RotateCcw, X, Award } from 'lucide-react';

interface VictoryModalProps {
  isOpen: boolean;
  movesCount: number;
  timerSeconds: number;
  onPlayAgain: () => void;
  onClose: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  movesCount,
  timerSeconds,
  onPlayAgain,
  onClose,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Fire confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#6366f1', '#ec4899', '#f59e0b', '#10b981'],
        });
      } catch {
        // Fallback if canvas-confetti fails
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-white/15 p-6 shadow-2xl text-center ring-1 ring-white/10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Trophy Glow */}
        <div className="mx-auto flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 shadow-xl shadow-amber-500/30 ring-4 ring-amber-400/20 mb-4 animate-bounce">
          <Trophy className="w-10 h-10" />
        </div>

        <h3 className="text-2xl font-black text-white">Puzzle Solved!</h3>
        <p className="text-xs text-slate-400 mt-1">
          Awesome job! All 8 tiles are back in numerical order.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 my-5">
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 flex flex-col items-center">
            <Footprints className="w-4 h-4 text-cyan-400 mb-1" />
            <span className="text-[11px] text-slate-400 uppercase font-medium">Total Moves</span>
            <span className="text-xl font-bold text-white font-mono">{movesCount}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 flex flex-col items-center">
            <Clock className="w-4 h-4 text-amber-400 mb-1" />
            <span className="text-[11px] text-slate-400 uppercase font-medium">Time Taken</span>
            <span className="text-xl font-bold text-white font-mono">{formattedTime}</span>
          </div>
        </div>

        {/* Play Again Button */}
        <button
          onClick={onPlayAgain}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Shuffle & Play Again</span>
        </button>
      </div>
    </div>
  );
};
