'use client';

import React from 'react';
import { Hand, Pointer, Move, MousePointerClick } from 'lucide-react';

export const GestureGuide: React.FC = () => {
  return (
    <div className="w-full flex flex-col gap-2 p-3.5 rounded-2xl bg-slate-900/60 border border-white/5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Hand Gesture Controls
        </span>
        <span className="text-[11px] text-cyan-400 font-medium">Interactive Guide</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
        {/* Step 1: Point */}
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-cyan-400">
            <Pointer className="w-4 h-4" />
            <span className="text-xs font-bold text-white">1. Point</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Extend index finger over the tile you wish to control.
          </p>
        </div>

        {/* Step 2: Pinch */}
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-pink-400">
            <Hand className="w-4 h-4" />
            <span className="text-xs font-bold text-white">2. Pinch</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Touch thumb tip and index tip together to grab the tile.
          </p>
        </div>

        {/* Step 3: Move */}
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-emerald-400">
            <Move className="w-4 h-4" />
            <span className="text-xs font-bold text-white">3. Slide</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Move pinched hand toward the empty slot to slide the tile!
          </p>
        </div>
      </div>

      {/* Mouse Fallback Tip */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/40 border border-white/5 text-[11px] text-slate-400 mt-1">
        <MousePointerClick className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <span>
          <strong className="text-slate-300">Backup Control:</strong> You can always click or tap any tile adjacent to the blank space directly!
        </span>
      </div>
    </div>
  );
};
