'use client';

import React, { useState } from 'react';
import { Sparkles, Volume2, VolumeX, BookOpen, ShieldCheck, Hand } from 'lucide-react';
import { soundEffects } from '../lib/audio/soundEffects';

interface NavbarProps {
  onOpenDemoGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenDemoGuide }) => {
  const [isMuted, setIsMuted] = useState<boolean>(() => soundEffects.getMuted());

  const handleToggleSound = () => {
    const muted = soundEffects.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header className="w-full border-b border-white/10 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-lg shadow-cyan-500/25 ring-1 ring-white/20">
            <Hand className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-indigo-200">
                HandSolve
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                AI Vision
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden md:block">
              Real-Time Hand Gesture 3x3 Puzzle Solver
            </p>
          </div>
        </div>

        {/* Action Controls & Badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Privacy badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Client-Side</span>
          </div>

          {/* Audio toggle */}
          <button
            onClick={handleToggleSound}
            aria-label={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all shadow-sm"
            title={isMuted ? 'Sound Muted' : 'Sound Active'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Presentation Demo Guide */}
          <button
            onClick={onOpenDemoGuide}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs sm:text-sm font-medium transition-all shadow-sm hover:shadow-indigo-500/10"
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span className="hidden xs:inline">Project Guide</span>
          </button>
        </div>
      </div>
    </header>
  );
};
