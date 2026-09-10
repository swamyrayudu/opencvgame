'use client';

import React, { useState } from 'react';
import { PuzzleSolution, PuzzleMove } from '../lib/puzzle/puzzleTypes';
import { ChevronDown, ChevronUp, ArrowRight, Zap, CheckCircle, Navigation } from 'lucide-react';

interface SolutionPanelProps {
  solution: PuzzleSolution | null;
  nextMove: PuzzleMove | null;
  isSolved: boolean;
}

export const SolutionPanel: React.FC<SolutionPanelProps> = ({ solution, nextMove, isSolved }) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  if (isSolved) {
    return (
      <div className="w-full p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-300">Puzzle Solved!</h4>
            <p className="text-xs text-emerald-400/80">Every tile is in its optimal target position.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-2 rounded-2xl bg-slate-900/80 border border-white/10 p-3.5 backdrop-blur-xl shadow-xl">
      {/* Active Next Move Callout */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Navigation className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Next Move Guidance:
          </span>
        </div>

        {solution && (
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
            <Zap className="w-3 h-3 text-cyan-400" />
            {solution.stepsCount} steps ({solution.solveTimeMs}ms)
          </span>
        )}
      </div>

      {/* Prominent Next Move Banner */}
      {nextMove ? (
        <div className="mt-1 flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-indigo-500/15 border border-amber-500/30 text-amber-200 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-base shadow-md">
              {nextMove.tile}
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Slide Tile {nextMove.tile}</span>
                <span className="text-amber-400 uppercase font-black">{nextMove.direction}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Pinch Tile {nextMove.tile} and drag {nextMove.direction.toLowerCase()} or click it
              </p>
            </div>
          </div>

          <div className="text-2xl font-black text-amber-400 animate-pulse">
            {nextMove.direction === 'UP' && '↑'}
            {nextMove.direction === 'DOWN' && '↓'}
            {nextMove.direction === 'LEFT' && '←'}
            {nextMove.direction === 'RIGHT' && '→'}
          </div>
        </div>
      ) : (
        <div className="mt-1 p-3 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center text-xs text-slate-400">
          Click <strong className="text-amber-300 font-semibold">Find Solution</strong> to reveal step-by-step A* guidance.
        </div>
      )}

      {/* Expandable Solution Steps Drawer */}
      {solution && solution.moves.length > 0 && (
        <div className="mt-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 py-1 font-medium transition-colors"
          >
            <span>View all {solution.moves.length} steps</span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expanded && (
            <div className="mt-2 max-h-40 overflow-y-auto pr-1 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
              {solution.moves.map((move, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                    idx === 0
                      ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                      : 'bg-slate-950/50 text-slate-300 border border-white/5'
                  }`}
                >
                  <span className="text-slate-400">Step {idx + 1}.</span>
                  <div className="flex items-center gap-1.5">
                    <span>Tile {move.tile}</span>
                    <ArrowRight className="w-3 h-3 text-cyan-400" />
                    <span className="font-semibold text-white">{move.direction}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
