'use client';

import React from 'react';
import { BoardState, PuzzleMove, MoveDirection } from '../lib/puzzle/puzzleTypes';
import { canMoveTile } from '../lib/puzzle/puzzleUtils';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

interface PuzzleBoardProps {
  board: BoardState;
  nextRecommendedMove: PuzzleMove | null;
  lastMoveWasCorrect: boolean;
  hoveredIndex: number | null;
  selectedIndex: number | null;
  isSolved: boolean;
  onTileClick: (index: number) => void;
}

export const PuzzleBoard: React.FC<PuzzleBoardProps> = ({
  board,
  nextRecommendedMove,
  lastMoveWasCorrect,
  hoveredIndex,
  selectedIndex,
  isSolved,
  onTileClick,
}) => {
  const renderDirectionIcon = (direction: MoveDirection) => {
    const iconClass = 'w-5 h-5 sm:w-6 sm:h-6 text-amber-300 animate-bounce drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]';
    switch (direction) {
      case 'UP':
        return <ArrowUp className={iconClass} />;
      case 'DOWN':
        return <ArrowDown className={iconClass} />;
      case 'LEFT':
        return <ArrowLeft className={iconClass} />;
      case 'RIGHT':
        return <ArrowRight className={iconClass} />;
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-3 sm:p-5 rounded-3xl bg-slate-900/80 border border-white/10 shadow-2xl backdrop-blur-xl w-full max-w-md mx-auto ring-1 ring-white/5">
      {/* 3x3 Grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full aspect-square p-2 sm:p-3 rounded-2xl bg-slate-950/80 border border-white/5 shadow-inner">
        {board.map((tile, index) => {
          const isEmpty = tile === 0;
          const isLegal = canMoveTile(board, index);
          const isRecommended = nextRecommendedMove && nextRecommendedMove.fromIndex === index;
          const isHovered = hoveredIndex === index;
          const isSelected = selectedIndex === index;

          if (isEmpty) {
            return (
              <div
                key={`empty-${index}`}
                className="relative rounded-xl border border-dashed border-slate-800/80 bg-slate-950/40 flex items-center justify-center transition-all duration-300"
              >
                <div className="w-3 h-3 rounded-full bg-slate-800/60"></div>
              </div>
            );
          }

          return (
            <button
              key={`tile-${tile}`}
              onClick={() => onTileClick(index)}
              disabled={!isLegal && !isHovered}
              aria-label={`Tile ${tile}`}
              className={`relative rounded-xl flex flex-col items-center justify-center font-bold text-2xl sm:text-4xl transition-all duration-200 select-none shadow-md group ${
                isSelected
                  ? 'bg-gradient-to-tr from-pink-600 via-rose-500 to-pink-400 text-white ring-4 ring-pink-400/50 scale-95 shadow-pink-500/40 z-20'
                  : isHovered
                  ? 'bg-gradient-to-tr from-cyan-600 via-cyan-500 to-indigo-500 text-white ring-2 ring-cyan-300 shadow-cyan-500/30 scale-102 z-10'
                  : isRecommended
                  ? 'bg-gradient-to-tr from-indigo-700 via-indigo-600 to-cyan-700 text-white ring-2 ring-amber-400 shadow-amber-500/25 animate-pulse'
                  : isLegal
                  ? 'bg-gradient-to-tr from-slate-800 via-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-slate-100 hover:text-white border border-white/10 hover:border-cyan-500/50 active:scale-95 cursor-pointer'
                  : 'bg-slate-800/70 border border-white/5 text-slate-400 cursor-not-allowed'
              }`}
            >
              {/* Tile Number */}
              <span className="drop-shadow-md">{tile}</span>

              {/* Position indicator subscript */}
              <span className="absolute bottom-1 right-2 text-[9px] sm:text-[10px] font-mono text-white/40">
                #{tile}
              </span>

              {/* Recommended Direction Indicator Arrow */}
              {isRecommended && (
                <div className="absolute top-1 sm:top-2 flex items-center justify-center">
                  {renderDirectionIcon(nextRecommendedMove.direction)}
                </div>
              )}

              {/* Pinch / Selection badge */}
              {isSelected && (
                <span className="absolute top-1 left-2 text-[9px] font-bold uppercase tracking-wider text-pink-200 bg-pink-900/60 px-1 rounded">
                  Grabbed
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Correct Move Banner / Solved Status Flash */}
      {lastMoveWasCorrect && (
        <div className="absolute inset-x-4 -top-3 z-30 flex items-center justify-center">
          <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/40 animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            <span>✓ Correct Move! Nice!</span>
          </div>
        </div>
      )}
    </div>
  );
};
