'use client';

import React from 'react';
import { Shuffle, Lightbulb, Play, Square, RotateCcw, Flame, Sparkles } from 'lucide-react';

interface ControlsProps {
  onShuffle: (difficulty: 'easy' | 'medium' | 'hard') => void;
  onFindSolution: () => void;
  onAutoSolve: () => void;
  onStopAutoSolve: () => void;
  onReset: () => void;
  isAutoSolving: boolean;
  isSolved: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  onDifficultyChange: (difficulty: 'easy' | 'medium' | 'hard') => void;
}

export const Controls: React.FC<ControlsProps> = ({
  onShuffle,
  onFindSolution,
  onAutoSolve,
  onStopAutoSolve,
  onReset,
  isAutoSolving,
  isSolved,
  difficulty,
  onDifficultyChange,
}) => {
  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Primary Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
        {/* Shuffle Button */}
        <button
          onClick={() => onShuffle(difficulty)}
          disabled={isAutoSolving}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-white/10 text-white text-xs sm:text-sm font-semibold transition-all shadow-md disabled:opacity-50"
        >
          <Shuffle className="w-4 h-4 text-cyan-400" />
          <span>Shuffle</span>
        </button>

        {/* Find Solution Button */}
        <button
          onClick={onFindSolution}
          disabled={isAutoSolving || isSolved}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/30 text-amber-300 hover:text-amber-200 text-xs sm:text-sm font-semibold transition-all shadow-md active:scale-95 disabled:opacity-40"
        >
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span>Find Solution</span>
        </button>

        {/* Auto Solve / Stop Auto Solve Button */}
        {isAutoSolving ? (
          <button
            onClick={onStopAutoSolve}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-rose-600/30"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>Stop Auto</span>
          </button>
        ) : (
          <button
            onClick={onAutoSolve}
            disabled={isSolved}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 active:scale-95 text-white text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-40"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Auto Solve</span>
          </button>
        )}

        {/* Reset Button */}
        <button
          onClick={onReset}
          disabled={isAutoSolving}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-white/10 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-all shadow-md disabled:opacity-50"
        >
          <RotateCcw className="w-4 h-4 text-slate-400" />
          <span>Reset</span>
        </button>
      </div>

      {/* Difficulty Selector Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs">
        <span className="text-slate-400 font-medium">Difficulty:</span>
        <div className="flex items-center gap-1">
          {(['easy', 'medium', 'hard'] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => onDifficultyChange(diff)}
              className={`px-2.5 py-1 rounded-lg font-medium capitalize transition-all ${
                difficulty === diff
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
