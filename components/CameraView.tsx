'use client';

import React from 'react';
import { Camera, CameraOff, RefreshCw, AlertCircle, Sparkles, Shield, Eye, HelpCircle } from 'lucide-react';
import { HandTrackingData } from '../lib/puzzle/puzzleTypes';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isStreaming: boolean;
  isLoading: boolean;
  cameraError: string | null;
  modelStatus: 'idle' | 'loading' | 'ready' | 'error';
  trackingData: HandTrackingData;
  mirrored: boolean;
  onToggleMirror: () => void;
  onStartCamera: () => void;
  onStopCamera: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({
  videoRef,
  canvasRef,
  isStreaming,
  isLoading,
  cameraError,
  modelStatus,
  trackingData,
  mirrored,
  onToggleMirror,
  onStartCamera,
  onStopCamera,
}) => {
  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Video & Canvas Container */}
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900/90 border border-white/10 shadow-2xl ring-1 ring-white/5 group">
        {/* Real video element */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`w-full h-full object-cover transition-transform duration-200 ${
            mirrored ? 'scale-x-[-1]' : ''
          } ${isStreaming ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Real-time Hand Landmarks Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />

        {/* 3x3 Interaction Virtual Grid Overlay for visual targeting */}
        {isStreaming && (
          <div className="absolute inset-0 pointer-events-none z-10 p-[12%] opacity-30 group-hover:opacity-60 transition-opacity">
            <div className="w-full h-full grid grid-cols-3 grid-rows-3 border-2 border-dashed border-cyan-500/40 rounded-xl">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((idx) => {
                const isHovered = trackingData.hoveredTileIndex === idx;
                const isSelected = trackingData.selectedTileIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`border border-cyan-500/20 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-pink-500/30 border-pink-400 font-bold text-pink-300'
                        : isHovered
                        ? 'bg-cyan-500/20 border-cyan-400 font-semibold text-cyan-300'
                        : 'text-slate-500/40'
                    }`}
                  >
                    <span className="text-[10px] font-mono">Pos {idx + 1}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Inactive or Error Overlay */}
        {!isStreaming && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-900/95 via-slate-950 to-slate-900 z-20">
            {cameraError ? (
              <div className="flex flex-col items-center max-w-sm gap-3">
                <div className="p-3 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-white">Camera Unavailable</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{cameraError}</p>
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 text-[11px] text-cyan-300">
                  💡 Tip: You can still fully play, solve, and auto-solve the puzzle using mouse or touch controls!
                </div>
                <button
                  onClick={onStartCamera}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/30 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Try Again
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center max-w-xs gap-3">
                <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shadow-inner">
                  <Camera className="w-8 h-8" />
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500"></span>
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white">Live Computer Vision</h3>
                <p className="text-xs text-slate-400">
                  Point and pinch in the air to control the sliding puzzle in real-time.
                </p>
                <button
                  onClick={onStartCamera}
                  disabled={isLoading}
                  className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-cyan-500/25 transition-all transform active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Starting Camera...
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      Start Camera
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Model Loading Badge Overlay */}
        {modelStatus === 'loading' && (
          <div className="absolute top-3 right-3 z-30 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur border border-cyan-500/30 text-cyan-300 text-[11px] flex items-center gap-2 shadow-lg">
            <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
            <span>Loading MediaPipe AI...</span>
          </div>
        )}

        {/* Live Tracking Status Floating HUD */}
        {isStreaming && (
          <div className="absolute top-3 left-3 z-30 flex flex-wrap gap-2">
            {/* Camera Status */}
            <div className="px-2.5 py-1 rounded-lg bg-slate-900/85 backdrop-blur border border-white/10 flex items-center gap-2 text-xs font-medium text-white shadow-lg">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Camera Active</span>
            </div>

            {/* Hand Status */}
            <div
              className={`px-2.5 py-1 rounded-lg backdrop-blur border flex items-center gap-2 text-xs font-medium shadow-lg transition-colors ${
                trackingData.detected
                  ? 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300'
                  : 'bg-slate-900/85 border-slate-700/50 text-slate-400'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  trackingData.detected ? 'bg-cyan-400' : 'bg-slate-500'
                }`}
              ></span>
              <span>{trackingData.detected ? 'Hand Detected' : 'No Hand'}</span>
            </div>
          </div>
        )}

        {/* Camera Action Buttons (Bottom Bar inside preview) */}
        {isStreaming && (
          <div className="absolute bottom-3 right-3 z-30 flex items-center gap-2">
            <button
              onClick={onToggleMirror}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 backdrop-blur border border-white/15 text-slate-300 hover:text-white text-xs font-medium transition-all shadow-md"
              title="Flip Mirror"
            >
              Flip: {mirrored ? 'Mirrored' : 'Normal'}
            </button>
            <button
              onClick={onStopCamera}
              className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 backdrop-blur border border-rose-500/30 text-rose-300 hover:text-rose-200 text-xs font-medium transition-all shadow-md flex items-center gap-1.5"
            >
              <CameraOff className="w-3.5 h-3.5" />
              Stop
            </button>
          </div>
        )}
      </div>

      {/* Status Bar / Telemetry Cards */}
      <div className="grid grid-cols-3 gap-2 w-full">
        {/* Gesture Card */}
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Gesture</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={`text-xs font-bold ${
                trackingData.isPinching
                  ? 'text-pink-400'
                  : trackingData.gesture.startsWith('MOVE')
                  ? 'text-emerald-400'
                  : trackingData.gesture === 'POINT'
                  ? 'text-cyan-400'
                  : 'text-slate-400'
              }`}
            >
              {trackingData.gesture === 'NONE' ? 'IDLE' : trackingData.gesture}
            </span>
          </div>
        </div>

        {/* Target Tile Card */}
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Target</span>
          <span className="text-xs font-bold text-white mt-0.5">
            {trackingData.selectedTileIndex !== null
              ? `Selected: #${trackingData.selectedTileIndex + 1}`
              : trackingData.hoveredTileIndex !== null
              ? `Hover: #${trackingData.hoveredTileIndex + 1}`
              : 'None'}
          </span>
        </div>

        {/* Pinch Tension / Confidence Card */}
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Pinch State</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={`text-xs font-bold ${
                trackingData.isPinching ? 'text-pink-400' : 'text-slate-400'
              }`}
            >
              {trackingData.isPinching ? 'PINCHING' : 'OPEN'}
            </span>
          </div>
        </div>
      </div>

      {/* Privacy Guarantee Note */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/40 border border-white/5 text-[11px] text-slate-400">
        <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>Camera processing happens locally in your browser. No camera video is uploaded.</span>
      </div>
    </div>
  );
};
