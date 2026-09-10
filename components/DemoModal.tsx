'use client';

import React from 'react';
import { X, Cpu, Eye, Binary, ShieldCheck, CheckCircle2, Award, Sparkles } from 'lucide-react';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoModal: React.FC<DemoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-white/15 p-6 sm:p-8 shadow-2xl text-left ring-1 ring-white/10 scrollbar-thin scrollbar-thumb-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-white">HandSolve</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                College Project Demo
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-Time Hand Gesture Computer Vision & A* Puzzle Solver
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-6 mt-5 text-sm text-slate-300">
          {/* Section 1: Architecture Pipeline */}
          <div>
            <h4 className="flex items-center gap-2 text-white font-bold text-sm mb-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              1. System Architecture Pipeline
            </h4>
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/5 font-mono text-xs text-slate-300 space-y-1">
              <p className="text-cyan-400 font-semibold">Webcam (Browser MediaDevices)</p>
              <p className="text-slate-500">  ↓ 30-60 FPS video stream</p>
              <p className="text-indigo-400 font-semibold">MediaPipe Tasks Vision (WebAssembly + GPU)</p>
              <p className="text-slate-500">  ↓ 21 normalized 3D hand landmarks</p>
              <p className="text-pink-400 font-semibold">Gesture Detector (EMA Smoothing + Scale Normalized Pinch)</p>
              <p className="text-slate-500">  ↓ Coordinate mapping, pinch hysteresis, directional drag</p>
              <p className="text-amber-400 font-semibold">3x3 Sliding Puzzle State & Solvability Engine</p>
              <p className="text-slate-500">  ↓ A* Manhattan heuristic optimal solver</p>
              <p className="text-emerald-400 font-semibold">Real-Time UI Guidance & Move Validation</p>
            </div>
          </div>

          {/* Section 2: Computer Vision Pipeline */}
          <div>
            <h4 className="flex items-center gap-2 text-white font-bold text-sm mb-2">
              <Eye className="w-4 h-4 text-indigo-400" />
              2. Computer Vision & Gesture Recognition
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 leading-relaxed list-disc list-inside">
              <li>
                <strong className="text-slate-200">Zero Server Uploads:</strong> MediaPipe Tasks Vision runs 100% in client-side WebAssembly. No video frames leave the device.
              </li>
              <li>
                <strong className="text-slate-200">Scale-Invariant Pinch:</strong> Euclidean distance between Thumb Tip (#4) and Index Tip (#8) is normalized by the hand's pixel scale (Wrist to Middle MCP #9). This guarantees accurate pinch detection regardless of camera distance.
              </li>
              <li>
                <strong className="text-slate-200">Jitter Resistance:</strong> Exponential Moving Average (EMA, α=0.45) smooths fingertip trajectory. Cooldown debounce (450ms) ensures stable single moves.
              </li>
            </ul>
          </div>

          {/* Section 3: A* Algorithm & Solvability */}
          <div>
            <h4 className="flex items-center gap-2 text-white font-bold text-sm mb-2">
              <Binary className="w-4 h-4 text-amber-400" />
              3. A* Search Algorithm & Solvability Proof
            </h4>
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2 text-xs text-slate-400">
              <p>
                <strong className="text-white">Heuristic Function: </strong>
                $$f(n) = g(n) + h(n)$$
                where $g(n)$ is moves made, and $h(n)$ is the sum of Manhattan Distances to goal positions plus Linear Conflicts (+2 moves when tiles block each other on target line).
              </p>
              <p>
                <strong className="text-white">Solvability Rule: </strong>
                In an 8-puzzle (3x3 grid), any state is solvable if and only if the number of inversions is <span className="text-emerald-400 font-semibold">even</span>. Shuffles strictly verify this condition to guarantee 100% solvability.
              </p>
            </div>
          </div>

          {/* Section 4: College Presentation Talking Points */}
          <div>
            <h4 className="flex items-center gap-2 text-white font-bold text-sm mb-2">
              <Award className="w-4 h-4 text-emerald-400" />
              4. Key Presentation Talking Points
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/40 border border-white/5">
                <p className="font-semibold text-white">Interactive AI Vision</p>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Natural human-computer interaction (HCI) replacing touchscreens with spatial air gestures.
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/40 border border-white/5">
                <p className="font-semibold text-white">Full Accessibility Fallback</p>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Graceful degradation: works smoothly with mouse, keyboard, or touch if camera is unavailable.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all shadow-md"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
