'use client';

import React from 'react';
import { Play, Camera, MousePointer, Target, Zap, Shield } from 'lucide-react';

interface StartScreenProps {
  isCameraStreaming: boolean;
  isCameraLoading: boolean;
  onStartCamera: () => void;
  onStartGame: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  isCameraStreaming,
  isCameraLoading,
  onStartCamera,
  onStartGame,
}) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-white/15 p-6 sm:p-8 shadow-2xl text-center ring-1 ring-white/10">
        {/* Futuristic Glowing Emblem */}
        <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-xl shadow-cyan-500/30 ring-4 ring-cyan-400/20 mb-4">
          <Target className="w-8 h-8" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide font-mono">
          HAND SHOOTER
        </h2>
        <p className="text-xs text-cyan-400 font-mono tracking-widest uppercase mt-1">
          Real-Time Hand Gesture Game
        </p>

        {/* Controls Tutorial Box */}
        <div className="my-5 p-4 rounded-2xl bg-slate-950/80 border border-white/5 text-left text-xs text-slate-300 space-y-2.5 font-mono">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            HOW TO PLAY
          </span>
          <div className="flex items-center gap-2.5">
            <span className="text-lg">☝️</span>
            <div>
              <strong className="text-cyan-300">Move Index Finger:</strong>
              <p className="text-[11px] text-slate-400">Aim crosshair at incoming drones</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-lg">🤏</span>
            <div>
              <strong className="text-pink-300">Combine Fingers (Thumb + Index):</strong>
              <p className="text-[11px] text-slate-400">Touch fingers together to shoot fast! Separate to stop.</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-lg">🖱️</span>
            <div>
              <strong className="text-indigo-300">Mouse / Touch Fallback:</strong>
              <p className="text-[11px] text-slate-400">Move cursor to aim, click or Space to shoot</p>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col gap-2.5">
          {!isCameraStreaming ? (
            <>
              <button
                onClick={onStartCamera}
                disabled={isCameraLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-sm tracking-wider uppercase shadow-lg shadow-cyan-500/25 transition-all active:scale-95 disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
                <span>{isCameraLoading ? 'STARTING CAMERA...' : 'START CAMERA'}</span>
              </button>

              <button
                onClick={onStartGame}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors border border-white/10"
              >
                <MousePointer className="w-3.5 h-3.5" />
                <span>PLAY WITH MOUSE / TOUCH</span>
              </button>
            </>
          ) : (
            <button
              onClick={onStartGame}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-base tracking-wider uppercase shadow-lg shadow-emerald-500/30 transition-all active:scale-95 animate-pulse"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>START GAME</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
