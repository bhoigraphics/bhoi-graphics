import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid,
  Move,
  SplitSquareVertical,
  Columns,
  ShieldCheck,
  Scissors,
  Sparkles,
  Info,
  RotateCcw,
  Hand,
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
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');
  const [showCheckerboard, setShowCheckerboard] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
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
    e.stopPropagation();
    setIsDraggingSlider(true);
  };

  // Keyboard Spacebar listener for temporary pan hand tool
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Native Non-Passive Wheel Event for Smooth Zoom In / Zoom Out
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY;
      const factor = delta > 0 ? 1.15 : 0.88;

      setZoom((prevZoom) => {
        const nextZoom = Math.min(5, Math.max(0.25, +(prevZoom * factor).toFixed(2)));
        if (nextZoom <= 1 && prevZoom <= 1) {
          setPan({ x: 0, y: 0 });
        }
        return nextZoom;
      });
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', handleWheel);
  }, []);

  // Global Mouse Move and Mouse Up handlers
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
  const handleZoomIn = () => {
    setZoom((z) => Math.min(5, +(z + 0.25).toFixed(2)));
  };

  const handleZoomOut = () => {
    setZoom((z) => {
      const next = Math.max(0.25, +(z - 0.25).toFixed(2));
      if (next <= 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleSetExactZoom = (targetZoom: number) => {
    setZoom(targetZoom);
    if (targetZoom <= 1) {
      setPan({ x: 0, y: 0 });
    }
  };

  // Double click toggles between 100% and 200% zoom
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (zoom > 1) {
      handleResetZoom();
    } else {
      setZoom(2);
    }
  };

  // Canvas / Image Mouse Down handler (handles Pan vs Slider jump)
  const handleMouseDownOnCanvas = (e: React.MouseEvent) => {
    // If clicking slider handle, that is handled separately by handleMouseDownSlider
    if (panModeActive || isSpacePressed || zoom > 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    } else if (containerRef.current) {
      // At 1x zoom, clicking directly jumps the slider position
      handleSliderMove(e.clientX);
      setIsDraggingSlider(true);
    }
  };

  // Touch Pinch-to-zoom handlers for mobile/tablets
  const touchStartDist = useRef<number | null>(null);
  const touchStartZoom = useRef<number>(1);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDist.current = dist;
      touchStartZoom.current = zoom;
    } else if (e.touches.length === 1 && (zoom > 1 || panModeActive)) {
      setPanStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setIsPanning(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDist.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = dist / touchStartDist.current;
      const nextZoom = Math.min(5, Math.max(0.25, +(touchStartZoom.current * scale).toFixed(2)));
      setZoom(nextZoom);
    } else if (e.touches.length === 1 && isPanning) {
      setPan((prev) => ({
        x: prev.x + (e.touches[0].clientX - panStart.x),
        y: prev.y + (e.touches[0].clientY - panStart.y),
      }));
      setPanStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchEnd = () => {
    touchStartDist.current = null;
    setIsPanning(false);
  };

  const shouldShowGrabCursor = panModeActive || isSpacePressed || (zoom > 1 && !isDraggingSlider);

  return (
    <div className="flex-1 flex flex-col bg-slate-100 min-h-0 relative overflow-hidden select-none">
      {/* Top Bar inside Canvas: Background Preservation Mode Selector */}
      <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 z-20 shadow-xs">
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

          {/* Pan hand tool toggle */}
          <button
            onClick={() => setPanModeActive(!panModeActive)}
            title="Pan / Hand tool (or hold Spacebar and drag)"
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              panModeActive
                ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Hand className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Pan</span>
          </button>

          {/* Zoom In / Zoom Out header controls */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg px-1 py-0.5 shadow-2xs">
            <button
              onClick={handleZoomOut}
              className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors"
              title="Zoom Out (or scroll wheel down)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-2 py-0.5 text-[11px] font-mono tabular-nums text-slate-700 hover:bg-slate-100 rounded font-bold"
              title="Click to reset to Fit"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors"
              title="Zoom In (or scroll wheel up)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleResetZoom}
            title="Reset Zoom & Pan (Fit to Screen)"
            className="p-1.5 bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport Area */}
      <div
        ref={viewportRef}
        className={`flex-1 relative overflow-hidden flex items-center justify-center p-4 sm:p-6 ${
          showCheckerboard ? 'bg-checkerboard' : 'bg-slate-200'
        } ${
          shouldShowGrabCursor
            ? isPanning
              ? 'cursor-grabbing'
              : 'cursor-grab'
            : ''
        }`}
        onMouseDown={handleMouseDownOnCanvas}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleClick}
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
          // INTERACTIVE BEFORE / AFTER SLIDER WITH ZOOM & PAN
          <div
            ref={containerRef}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isPanning ? 'none' : 'transform 0.12s ease-out',
            }}
            className="relative max-w-full max-h-[calc(100vh-250px)] aspect-auto rounded-xl shadow-xl overflow-hidden border border-slate-300 bg-white"
          >
            {/* UNDER LAYER: After / Enhanced Canvas */}
            <div className="relative w-full h-full">
              <div ref={enhancedCanvasHolderRef} className="w-full h-full flex items-center justify-center" />

              {/* After Enhance Badge */}
              <div className="absolute top-3 right-3 bg-slate-900/85 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-xs pointer-events-none z-10 flex items-center gap-1.5 border border-white/10">
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
              <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-xs pointer-events-none z-10 border border-white/10">
                <span>Before Enhance</span>
              </div>
            </div>

            {/* DRAGGABLE VERTICAL SLIDER DIVIDER */}
            <div
              style={{ left: `${sliderPosition}%` }}
              onMouseDown={handleMouseDownSlider}
              className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl cursor-ew-resize z-20 group"
            >
              {/* Slider Grab Handle Knob with Glowing Ring */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-xl border-2 border-violet-600 flex items-center justify-center group-hover:scale-115 transition-transform cursor-ew-resize">
                <div className="flex items-center gap-1 text-violet-700">
                  <span className="w-0.5 h-3.5 bg-violet-600 rounded-full" />
                  <span className="w-0.5 h-3.5 bg-violet-600 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          // SIDE-BY-SIDE VIEW WITH SYNCHRONIZED ZOOM & PAN
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isPanning ? 'none' : 'transform 0.12s ease-out',
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
        <div className="absolute bottom-3 left-4 bg-white/90 backdrop-blur-xs border border-slate-200 text-slate-600 text-[11px] px-3 py-1.5 rounded-lg shadow-xs hidden sm:flex items-center gap-2 pointer-events-none z-30">
          <Info className="w-3.5 h-3.5 text-violet-600" />
          <span>
            {project.mode === 'mode-a'
              ? 'Mode A active: Original background and composition 100% preserved.'
              : 'Mode B active: Background transparent alpha cutout ready for PNG export.'}
          </span>
        </div>

        {/* FLOATING ZOOM & PAN HUD ISLAND (Bottom Center / Right) */}
        <div className="absolute bottom-3 right-4 z-30 flex items-center gap-1.5 bg-slate-900/90 text-white backdrop-blur-md px-3 py-1.5 rounded-xl shadow-xl border border-slate-700/60 text-xs">
          {/* Zoom Out Button */}
          <button
            onClick={handleZoomOut}
            title="Zoom Out (Scroll Down)"
            className="p-1 hover:bg-slate-700/70 rounded-lg transition-colors text-slate-300 hover:text-white"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          {/* Quick Zoom Presets */}
          <div className="flex items-center gap-1 font-mono text-[11px] px-1 border-x border-slate-700">
            <button
              onClick={() => handleSetExactZoom(1)}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                zoom === 1 ? 'bg-violet-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Fit to Screen (100%)"
            >
              Fit
            </button>
            <button
              onClick={() => handleSetExactZoom(2)}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                zoom === 2 ? 'bg-violet-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="200% Zoom (Micro Details)"
            >
              2×
            </button>
            <button
              onClick={() => handleSetExactZoom(4)}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                zoom === 4 ? 'bg-violet-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="400% Zoom (Pixel Precision)"
            >
              4×
            </button>
            <span className="text-violet-300 font-bold ml-1 min-w-[38px] text-right">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Zoom In Button */}
          <button
            onClick={handleZoomIn}
            title="Zoom In (Scroll Up)"
            className="p-1 hover:bg-slate-700/70 rounded-lg transition-colors text-slate-300 hover:text-white"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          {/* Reset Zoom & Center */}
          <button
            onClick={handleResetZoom}
            title="Reset Pan & Zoom"
            className="p-1 hover:bg-slate-700/70 rounded-lg transition-colors text-slate-300 hover:text-white ml-0.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Interactive Hint */}
          <div className="hidden lg:flex items-center gap-1 text-[10px] text-slate-400 pl-2 border-l border-slate-700">
            <span>Scroll: Zoom</span>
            <span>•</span>
            <span>Drag: Pan</span>
            <span>•</span>
            <span>Double Click: 2×</span>
          </div>
        </div>
      </div>
    </div>
  );
};
