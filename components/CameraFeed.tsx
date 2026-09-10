'use client';

import React from 'react';
import { Camera, CameraOff, RefreshCw, AlertCircle, ShieldCheck, MousePointer } from 'lucide-react';

interface CameraFeedProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  cameraCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  isStreaming: boolean;
  isLoading: boolean;
  cameraError: string | null;
  modelStatus: 'idle' | 'loading' | 'ready' | 'error';
  isHandDetected: boolean;
  mirrored: boolean;
  onToggleMirror: () => void;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onUseMouseMode: () => void;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({
  videoRef,
  cameraCanvasRef,
  isStreaming,
  isLoading,
  cameraError,
  modelStatus,
  isHandDetected,
  mirrored,
  onToggleMirror,
  onStartCamera,
  onStopCamera,
  onUseMouseMode,
}) => {
  return (
    <div className="w-full flex flex-col gap-2.5">
      {/* Video & Skeleton Overlay Box */}
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shadow-xl ring-1 ring-white/5">
        {/* Real Video Element */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`w-full h-full object-cover transition-transform duration-200 ${
            mirrored ? 'scale-x-[-1]' : ''
          } ${isStreaming ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Hand Landmark Overlay Canvas */}
        <canvas
          ref={cameraCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />

        {/* Inactive or Error State Overlay */}
        {!isStreaming && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 z-20">
            {cameraError ? (
              <div className="flex flex-col items-center max-w-xs gap-2.5">
                <div className="p-2.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">Camera Unavailable</h4>
                <p className="text-[11px] text-slate-400 leading-tight">{cameraError}</p>

                <div className="flex flex-col gap-1.5 w-full mt-1">
                  <button
                    onClick={onUseMouseMode}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all"
                  >
                    <MousePointer className="w-3.5 h-3.5" />
                    <span>USE MOUSE MODE</span>
                  </button>
                  <button
                    onClick={onStartCamera}
                    className="w-full py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                  >
                    Retry Camera
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center max-w-xs gap-3">
                <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shadow-inner">
                  <Camera className="w-7 h-7" />
                  <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500"></span>
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Hand Gesture Tracking</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Aim with your index finger and pinch to fire.
                  </p>
                </div>
                <button
                  onClick={onStartCamera}
                  disabled={isLoading}
                  className="mt-1 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Starting...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-3.5 h-3.5" />
                      <span>START CAMERA</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Live HUD Badges inside Camera */}
        {isStreaming && (
          <>
            <div className="absolute top-2.5 left-2.5 z-30 flex items-center gap-2">
              <div className="px-2.5 py-1 rounded-lg bg-slate-950/85 backdrop-blur border border-white/10 flex items-center gap-1.5 text-[11px] font-bold text-white shadow-md">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Camera Active</span>
              </div>
            </div>

            <div className="absolute bottom-2.5 right-2.5 z-30 flex items-center gap-1.5">
              <button
                onClick={onToggleMirror}
                className="px-2 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-[10px] font-medium border border-white/10"
              >
                {mirrored ? 'Mirrored' : 'Normal'}
              </button>
              <button
                onClick={onStopCamera}
                className="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[10px] font-medium border border-rose-500/30 flex items-center gap-1"
              >
                <CameraOff className="w-3 h-3" />
                <span>Stop</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Privacy Notice */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/50 border border-white/5 text-[11px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>Camera processing happens locally in your browser. No camera video is uploaded.</span>
      </div>
    </div>
  );
};
