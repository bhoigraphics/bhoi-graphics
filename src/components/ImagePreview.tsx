import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Grid,
  Move,
  SplitSquareVertical,
  Columns,
  ShieldCheck,
  Scissors,
  Sparkles,
  Info,
} from 'lucide-react';
import { CanvasMode, Project } from '../types';

interface ImagePreviewProps {
  project: Project;
  enhancedCanvas: HTMLCanvasElement | null;
  onModeChange: (mode: CanvasMode) => void;
  isProcessing: boolean;
  progressMessage: string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  project,
  enhancedCanvas,
  onModeChange,
  isProcessing,
  progressMessage,
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0-100
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panModeActive, setPanModeActive] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');
  const [showCheckerboard, setShowCheckerboard] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const enhancedCanvasHolderRef = useRef<HTMLDivElement>(null);

  // Mount enhanced canvas into preview
  useEffect(() => {
    if (enhancedCanvas && enhancedCanvasHolderRef.current) {
      enhancedCanvasHolderRef.current.innerHTML = '';
      enhancedCanvas.style.width = '100%';
      enhancedCanvas.style.height = '100%';
      enhancedCanvas.style.objectFit = 'contain';
      enhancedCanvasHolderRef.current.appendChild(enhancedCanvas);
    }
  }, [enhancedCanvas]);

  // Handle slider drag
  const handleSliderMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clampedPct = Math.min(100, Math.max(0, (x / rect.width) * 100));
    setSliderPosition(clampedPct);
  }, []);

  const handleMouseDownSlider = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingSlider(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingSlider) {
        handleSliderMove(e.clientX);
      } else if (isPanning) {
        setPan((prev) => ({
          x: prev.x + (e.clientX - panStart.x),
          y: prev.y + (e.clientY - panStart.y),
        }));
        setPanStart({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = () => {
      setIsDraggingSlider(false);
      setIsPanning(false);
    };

    if (isDraggingSlider || isPanning) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSlider, isPanning, handleSliderMove, panStart]);

  // Zoom controls
  const handleZoomIn = () => setZoom((z) => Math.min(4, +(z + 0.25).toFixed(2)));
  const handleZoomOut = () => setZoom((z) => Math.max(0.25, +(z - 0.25).toFixed(2)));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
  const handleActualSize = () => {
    setZoom(1.5);
    setPan({ x: 0, y: 0 });
  };

  // Pan handlers
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (panModeActive || zoom > 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-100 min-h-0 relative overflow-hidden select-none">
      {/* Top Bar inside Canvas: Background Preservation Mode Selector */}
      <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 z-10 shadow-xs">
        {/* Mode Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => onModeChange('mode-a')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              project.mode === 'mode-a'
                ? 'bg-white text-violet-700 shadow-xs ring-1 ring-violet-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="whitespace-nowrap">Mode A: Enhance Image — Keep Original Background</span>
          </button>

          <button
            onClick={() => onModeChange('mode-b')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              project.mode === 'mode-b'
                ? 'bg-white text-violet-700 shadow-xs ring-1 ring-violet-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scissors className="w-4 h-4 text-violet-600 shrink-0" />
            <span className="whitespace-nowrap">Mode B: Remove Background — Export Transparent PNG</span>
          </button>
        </div>

        {/* View Options & Zoom Bar */}
        <div className="flex items-center gap-2 text-xs text-slate-600">
          {/* Slider vs Side-by-side */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              onClick={() => setViewMode('slider')}
              title="Split comparison slider"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'slider' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-500'
              }`}
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('side-by-side')}
              title="Side-by-side comparison"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'side-by-side' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-500'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Checkerboard Background Toggle for PNG transparency */}
          <button
            onClick={() => setShowCheckerboard(!showCheckerboard)}
            title="Toggle checkerboard background for transparent PNG"
            className={`p-1.5 rounded-lg border transition-colors ${
              showCheckerboard
                ? 'bg-violet-50 text-violet-700 border-violet-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          {/* Pan hand tool */}
          <button
            onClick={() => setPanModeActive(!panModeActive)}
            title="Pan / Hand tool"
            className={`p-1.5 rounded-lg border transition-colors ${
              panModeActive
                ? 'bg-violet-50 text-violet-700 border-violet-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Move className="w-3.5 h-3.5" />
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg px-1 py-0.5">
            <button
              onClick={handleZoomOut}
              className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-2 py-0.5 text-[11px] font-mono tabular-nums text-slate-700 hover:bg-slate-100 rounded"
              title="Fit to Screen"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleActualSize}
            title="Actual Size 100%"
            className="p-1.5 bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div
        className={`flex-1 relative overflow-hidden flex items-center justify-center p-4 sm:p-6 ${
          showCheckerboard ? 'bg-checkerboard' : 'bg-slate-200'
        } ${panModeActive ? 'cursor-grab active:cursor-grabbing' : ''}`}
        onMouseDown={handleCanvasMouseDown}
      >
        {/* Processing Indicator Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-40 transition-opacity">
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4 text-center border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center mx-auto mb-3 animate-spin">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">AI Super-Resolution Processing</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                {progressMessage || 'Enhancing micro-details, sharpening edges, and preserving backgrounds...'}
              </p>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-violet-600 to-indigo-500 h-2 rounded-full w-3/4 animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {/* Comparison Views */}
        {viewMode === 'slider' ? (
          // INTERACTIVE BEFORE / AFTER SLIDER
          <div
            ref={containerRef}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isPanning ? 'none' : 'transform 0.15s ease-out',
            }}
            className="relative max-w-full max-h-[calc(100vh-250px)] aspect-auto rounded-xl shadow-lg overflow-hidden border border-slate-300 bg-white"
          >
            {/* UNDER LAYER: After / Enhanced Canvas */}
            <div className="relative w-full h-full">
              <div ref={enhancedCanvasHolderRef} className="w-full h-full flex items-center justify-center" />
              
              {/* After Enhance Badge */}
              <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-xs pointer-events-none z-10 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-violet-400" />
                <span>After Enhance</span>
              </div>
            </div>

            {/* TOP LAYER: Original / Before Image (Clipped by slider position) */}
            <div
              style={{
                clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
              }}
              className="absolute inset-0 w-full h-full pointer-events-none"
            >
              <img
                src={project.originalUrl}
                alt="Before Enhance"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />

              {/* Before Enhance Badge */}
              <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-xs pointer-events-none z-10">
                <span>Before Enhance</span>
              </div>
            </div>

            {/* DRAGGABLE VERTICAL SLIDER DIVIDER */}
            <div
              style={{ left: `${sliderPosition}%` }}
              onMouseDown={handleMouseDownSlider}
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-2xl cursor-ew-resize z-20 group"
            >
              {/* Slider Grab Handle Knob */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md border-2 border-violet-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <div className="flex items-center gap-0.5 text-violet-700">
                  <span className="w-0.5 h-3 bg-violet-600 rounded-full" />
                  <span className="w-0.5 h-3 bg-violet-600 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          // SIDE-BY-SIDE VIEW
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-full max-h-[calc(100vh-250px)]"
          >
            {/* Before Card */}
            <div className="relative bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden flex flex-col">
              <div className="p-2 border-b border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Before Enhance (Original)</span>
                <span className="font-mono text-[11px] text-slate-400">
                  {project.width} × {project.height} px
                </span>
              </div>
              <div className="flex-1 flex items-center justify-center p-2 min-h-64">
                <img
                  src={project.originalUrl}
                  alt="Original"
                  referrerPolicy="no-referrer"
                  className="max-h-[50vh] object-contain rounded"
                />
              </div>
            </div>

            {/* After Card */}
            <div className="relative bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden flex flex-col">
              <div className="p-2 border-b border-slate-100 flex items-center justify-between text-xs font-semibold text-violet-700">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> After Enhance Pro
                </span>
                <span className="font-mono text-[11px] text-violet-600">
                  {project.width} × {project.height} px
                </span>
              </div>
              <div className="flex-1 flex items-center justify-center p-2 min-h-64">
                <div ref={enhancedCanvasHolderRef} className="max-h-[50vh] flex items-center justify-center" />
              </div>
            </div>
          </div>
        )}

        {/* Quick Canvas Rule Hint Bar */}
        <div className="absolute bottom-3 left-4 bg-white/90 backdrop-blur-xs border border-slate-200 text-slate-600 text-[11px] px-3 py-1.5 rounded-lg shadow-xs hidden sm:flex items-center gap-2 pointer-events-none">
          <Info className="w-3.5 h-3.5 text-violet-600" />
          <span>
            {project.mode === 'mode-a'
              ? 'Mode A active: Original background and composition 100% preserved.'
              : 'Mode B active: Background transparent alpha cutout ready for PNG export.'}
          </span>
        </div>
      </div>
    </div>
  );
};
