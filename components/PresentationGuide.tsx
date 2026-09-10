'use client';

import React from 'react';
import { X, Cpu, Eye, Target, ShieldCheck, Crosshair, Sparkles } from 'lucide-react';

interface PresentationGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PresentationGuide: React.FC<PresentationGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-white/15 p-6 sm:p-8 shadow-2xl text-left ring-1 ring-white/10 scrollbar-thin scrollbar-thumb-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-white font-mono">HAND SHOOTER</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Project Evaluation Guide
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-Time Hand Gesture Arcade Game Architecture & Computer Vision
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-6 mt-5 text-sm text-slate-300">
          {/* Section 1: Pipeline */}
          <div>
            <h4 className="flex items-center gap-2 text-white font-bold text-sm mb-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              1. System Architecture & Vision Pipeline
            </h4>
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/5 font-mono text-xs text-slate-300 space-y-1">
              <p className="text-cyan-400 font-semibold">1. WebCam Capture</p>
              <p className="text-slate-500">   navigator.mediaDevices.getUserMedia(30-60 FPS local video)</p>
              <p className="text-indigo-400 font-semibold">2. MediaPipe Tasks Vision</p>
              <p className="text-slate-500">   Client-side WebAssembly + GPU Delegate extracts 21 3D landmarks</p>
              <p className="text-pink-400 font-semibold">3. Hand Aim & Gesture Detector</p>
              <p className="text-slate-500">   Index tip (#8) smoothed via EMA; Thumb (#4) to Index (#8) pinch detection</p>
              <p className="text-amber-400 font-semibold">4. HTML5 Canvas Game Engine</p>
              <p className="text-slate-500">   Rotational turret, projectile physics, drone spawning, AABB collisions</p>
            </div>
          </div>

          {/* Section 2: Mathematical Algorithms */}
          <div>
            <h4 className="flex items-center gap-2 text-white font-bold text-sm mb-2">
              <Eye className="w-4 h-4 text-indigo-400" />
              2. Core Algorithms & Mathematics
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                <strong className="text-cyan-300 font-mono">Index Tip EMA Smoothing</strong>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Prevents camera trembling:
                  <br />
                  <code className="text-white font-mono font-bold">
                    aim = α · raw + (1 - α) · prev
                  </code>
                  <br />
                  With α = 0.55 for snappy, jitter-free reticle motion.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                <strong className="text-pink-300 font-mono">Scale-Invariant Pinch</strong>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Normalized by hand scale (wrist to middle MCP):
                  <br />
                  <code className="text-white font-mono font-bold">
                    ratio = dist(thumb, index) / scale
                  </code>
                  <br />
                  Pinch &lt; 0.38, Release &gt; 0.52 (hysteresis).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                <strong className="text-amber-300 font-mono">Edge-Triggered Firing</strong>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Fires strictly on transition:
                  <br />
                  <code className="text-white font-mono font-bold">
                    FIRE = isPinch && !wasPinch
                  </code>
                  <br />
                  Guarantees 1 pinch = 1 bullet.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                <strong className="text-emerald-300 font-mono">AABB Circle Collision</strong>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Determines closest drone boundary point:
                  <br />
                  <code className="text-white font-mono font-bold">
                    dist²(bullet, closestPoint) ≤ r²
                  </code>
                  <br />
                  Real-time microsecond collision detection.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Project Highlights */}
          <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-white/5 text-xs space-y-2">
            <h5 className="font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Evaluation Highlights
            </h5>
            <ul className="list-disc list-inside text-slate-400 text-[11px] space-y-1">
              <li><strong>Cost: ₹0.00</strong> — Zero external paid APIs, zero API keys.</li>
              <li><strong>100% Privacy</strong> — Camera stream remains in browser memory; never uploaded.</li>
              <li><strong>Reliable Demonstration</strong> — Full mouse, keyboard (Space), and touch fallbacks.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all shadow-md"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
