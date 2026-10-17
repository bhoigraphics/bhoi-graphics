import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Grid,
  SplitSquareVertical,
  Columns,
  ShieldCheck,
  Scissors,
  Sparkles,
  RotateCcw,
  Hand,
  Eye,
  Laptop,
  ChevronsLeftRight,
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
  const [isHoldingBefore, setIsHoldingBefore] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const enhancedCanvasHolderRef = useRef<HTMLDivElement>(null);
  const sideBySideCanvasHolderRef = useRef<HTMLDivElement>(null);

  // Mount enhanced canvas into preview (supports both slider and side-by-side modes)
  useEffect(() => {
    const activeHolder =
      viewMode === 'slider' ? enhancedCanvasHolderRef.current : sideBySideCanvasHolderRef.current;

    if (enhancedCanvas && activeHolder) {
      activeHolder.innerHTML = '';
      enhancedCanvas.style.width = '100%';
      enhancedCanvas.style.height = '100%';
      enhancedCanvas.style.objectFit = 'cover';
      enhancedCanvas.style.display = 'block';
      activeHolder.appendChild(enhancedCanvas);
    }
  }, [enhancedCanvas, viewMode]);

  // Handle slider drag calculation
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

  const handleTouchStartSlider = (e: React.TouchEvent) => {
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

  // Listen to Fullscreen changes
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Native Non-Passive Wheel Event for Smooth Focal Zoom In / Zoom Out
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY;
      const zoomFactor = delta > 0 ? 1.15 : 0.87;

      setZoom((prevZoom) => {
        const nextZoom = Math.min(6, Math.max(0.25, +(prevZoom * zoomFactor).toFixed(2)));
        if (nextZoom <= 1) {
          setPan({ x: 0, y: 0 });
          return nextZoom;
        }

        // Focal zoom: adjust pan so pointer stays visually pinned
        const rect = viewport.getBoundingClientRect();
        const mouseX = e.clientX - rect.left - rect.width / 2;
        const mouseY = e.clientY - rect.top - rect.height / 2;
        const scaleChange = nextZoom / prevZoom;

        setPan((prevPan) => ({
          x: mouseX - (mouseX - prevPan.x) * scaleChange,
          y: mouseY - (mouseY - prevPan.y) * scaleChange,
        }));

        return nextZoom;
      });
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', handleWheel);
  }, []);

  // Global Mouse & Touch Move / Up handlers for Slider & Panning
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

    const handleTouchMove = (e: TouchEvent) => {
      if (isDraggingSlider && e.touches[0]) {
        handleSliderMove(e.touches[0].clientX);
      }
    };

    const handleTouchEnd = () => {
      setIsDraggingSlider(false);
    };

    if (isDraggingSlider || isPanning) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
      window.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDraggingSlider, isPanning, handleSliderMove, panStart]);

  // Zoom controls
  const handleZoomIn = () => {
    setZoom((z) => Math.min(6, +(z + 0.25).toFixed(2)));
  };

  const handleZoomOut = () => {
    setZoom((z) => {
      const next = Math.max(0.25, +(z - 0.25).toFixed(2));
      if (next <= 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  // Fit to screen (Laptop view)
  const handleFitToScreen = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSliderPosition(50);
  };

  const handleSetExactZoom = (targetZoom: number) => {
    setZoom(targetZoom);
    if (targetZoom <= 1) {
      setPan({ x: 0, y: 0 });
    }
  };

  // Double click toggles between Fit (1x) and 2.5x Zoom
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (zoom > 1) {
      handleFitToScreen();
    } else {
      if (viewportRef.current) {
        const rect = viewportRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left - rect.width / 2;
        const clickY = e.clientY - rect.top - rect.height / 2;
        setPan({ x: -clickX * 1.5, y: -clickY * 1.5 });
      }
      setZoom(2.5);
    }
  };

  // Canvas / Image Mouse Down handler (handles Pan vs Slider click)
  const handleMouseDownOnCanvas = (e: React.MouseEvent) => {
    if (panModeActive || isSpacePressed || zoom > 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    } else if (containerRef.current) {
      handleSliderMove(e.clientX);
      setIsDraggingSlider(true);
    }
  };

  // Touch Pinch-to-zoom handlers for mobile/tablets/touch-laptops
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

  const handleTouchMoveCanvas = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDist.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = dist / touchStartDist.current;
      const nextZoom = Math.min(6, Math.max(0.25, +(touchStartZoom.current * scale).toFixed(2)));
      setZoom(nextZoom);
    } else if (e.touches.length === 1 && isPanning) {
      setPan((prev) => ({
        x: prev.x + (e.touches[0].clientX - panStart.x),
        y: prev.y + (e.touches[0].clientY - panStart.y),
      }));
      setPanStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchEndCanvas = () => {
    touchStartDist.current = null;
    setIsPanning(false);
  };

  // Fullscreen toggle
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      viewportRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const shouldShowGrabCursor = panModeActive || isSpacePressed || (zoom > 1 && !isDraggingSlider);

  // When holding before, show 100% before; otherwise use sliderPosition
  const effectiveSliderPosition = isHoldingBefore ? 100 : sliderPosition;

  return (
    <div className="flex-1 flex flex-col bg-slate-900 min-h-0 relative overflow-hidden select-none">
      {/* Top Bar: Mode Switcher & Quick View Options */}
      <div className="px-3 sm:px-4 py-2 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5 shrink-0 z-20 backdrop-blur-md">
        {/* Mode Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            onClick={() => onModeChange('mode-a')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              project.mode === 'mode-a'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="whitespace-nowrap">Mode A: Keep Background</span>
          </button>

          <button
            onClick={() => onModeChange('mode-b')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              project.mode === 'mode-b'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scissors className="w-3.5 h-3.5 text-violet-300 shrink-0" />
            <span className="whitespace-nowrap">Mode B: Transparent PNG</span>
          </button>
        </div>

        {/* View Options & Zoom Controls */}
        <div className="flex items-center gap-2 text-xs text-slate-300">
          {/* Slider vs Side-by-side */}
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
            <button
              onClick={() => setViewMode('slider')}
              title="Remini Split Comparison Slider (Before / After)"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'slider'
                  ? 'bg-violet-600 text-white font-semibold shadow-2xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('side-by-side')}
              title="Side-by-Side Dual View (Left Before / Right After)"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'side-by-side'
                  ? 'bg-violet-600 text-white font-semibold shadow-2xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Checkerboard Background Toggle */}
          <button
            onClick={() => setShowCheckerboard(!showCheckerboard)}
            title="Toggle checkerboard background for transparent PNG"
            className={`p-1.5 rounded-lg border transition-colors ${
              showCheckerboard
                ? 'bg-slate-800 text-violet-400 border-violet-500/50'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          {/* Pan hand tool toggle */}
          <button
            onClick={() => setPanModeActive(!panModeActive)}
            title="Pan / Hand tool (or hold Spacebar and drag)"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              panModeActive
                ? 'bg-violet-600 text-white border-violet-500 shadow-xs'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Hand className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pan</span>
          </button>

          {/* Fit to Screen (Laptop) Button */}
          <button
            onClick={handleFitToScreen}
            title="Fit to Laptop Screen (100% within display)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg transition-colors font-semibold"
          >
            <Laptop className="w-3.5 h-3.5 text-violet-400" />
            <span className="hidden md:inline">Fit Screen</span>
          </button>

          {/* Zoom In / Zoom Out header controls */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg px-1 py-0.5">
            <button
              onClick={handleZoomOut}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
              title="Zoom Out (or scroll wheel down)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleFitToScreen}
              className="px-2 py-0.5 text-[11px] font-mono tabular-nums text-slate-200 hover:bg-slate-800 rounded font-bold"
              title="Click to Reset Zoom (Fit)"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
              title="Zoom In (or scroll wheel up)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={handleToggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen (Laptop View)'}
            className="p-1.5 bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800 rounded-lg transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport Area */}
      <div
        ref={viewportRef}
        className={`flex-1 relative overflow-hidden flex items-center justify-center p-3 sm:p-6 ${
          showCheckerboard ? 'bg-checkerboard' : 'bg-slate-950'
        } ${
          shouldShowGrabCursor
            ? isPanning
              ? 'cursor-grabbing'
              : 'cursor-grab'
            : ''
        }`}
        onMouseDown={handleMouseDownOnCanvas}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMoveCanvas}
        onTouchEnd={handleTouchEndCanvas}
        onDoubleClick={handleDoubleClick}
      >
        {/* Processing Indicator Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-40 transition-opacity">
            <div className="bg-slate-900 rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 text-center border border-violet-500/30">
              <div className="w-12 h-12 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center mx-auto mb-3 animate-spin border border-violet-500/40">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">AI Super-Resolution Processing</h3>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                {progressMessage || 'Enhancing micro-details, sharpening edges, and preserving backgrounds...'}
              </p>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-violet-600 via-pink-500 to-indigo-500 h-2 rounded-full w-3/4 animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {/* Comparison Views */}
        {viewMode === 'slider' ? (
          // ==========================================
          // REMINI-STYLE SPLIT COMPARISON SLIDER
          // ==========================================
          <div
            ref={containerRef}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isPanning ? 'none' : 'transform 0.12s ease-out',
            }}
            className="relative max-w-full max-h-[calc(100vh-175px)] rounded-2xl shadow-2xl overflow-hidden border border-slate-700/60 bg-black"
          >
            {/* Natural sizing guide: perfectly fits on any laptop screen preserving aspect ratio */}
            <img
              src={project.originalUrl}
              alt=""
              aria-hidden="true"
              className="max-h-[calc(100vh-175px)] max-w-full w-auto h-auto block select-none pointer-events-none opacity-0"
            />

            {/* UNDER LAYER: AFTER / ENHANCED CANVAS (Revealed on Right side) */}
            <div className="absolute inset-0 w-full h-full bg-black">
              {enhancedCanvas ? (
                <div ref={enhancedCanvasHolderRef} className="w-full h-full flex items-center justify-center" />
              ) : (
                <img
                  src={project.enhancedUrl || project.currentUrl || project.originalUrl}
                  alt="After Enhance"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover select-none pointer-events-none"
                />
              )}

              {/* REMINI "AFTER" BADGE (Top Right) */}
              <div className="absolute top-3.5 right-3.5 z-20 pointer-events-none flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-950/85 backdrop-blur-md border border-violet-400/40 text-white shadow-xl text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-violet-300" />
                <span className="bg-gradient-to-r from-violet-200 via-pink-200 to-white bg-clip-text text-transparent">
                  AFTER
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-violet-600 text-white font-extrabold ml-0.5">
                  HD PRO
                </span>
              </div>
            </div>

            {/* TOP LAYER: BEFORE / ORIGINAL IMAGE (Revealed on Left side, clipped by slider) */}
            <div
              style={{
                clipPath: `polygon(0 0, ${effectiveSliderPosition}% 0, ${effectiveSliderPosition}% 100%, 0 100%)`,
                transition: isHoldingBefore ? 'clip-path 0.15s ease-out' : 'none',
              }}
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
            >
              <img
                src={project.originalUrl}
                alt="Before Enhance"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover select-none"
              />

              {/* REMINI "BEFORE" BADGE (Top Left) */}
              <div className="absolute top-3.5 left-3.5 z-20 pointer-events-none flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white shadow-xl text-xs font-bold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>BEFORE</span>
                <span className="text-[10px] text-slate-300 font-normal ml-0.5">Original</span>
              </div>
            </div>

            {/* REMINI VERTICAL SLIDER DIVIDER & GRAB KNOB */}
            <div
              style={{
                left: `${effectiveSliderPosition}%`,
                display: isHoldingBefore ? 'none' : 'block',
              }}
              onMouseDown={handleMouseDownSlider}
              onTouchStart={handleTouchStartSlider}
              className="absolute top-0 bottom-0 -ml-[1px] w-[2px] bg-white shadow-[0_0_12px_rgba(0,0,0,0.8)] cursor-ew-resize z-30 group"
            >
              {/* Circular Floating Remini Knob with < > arrows */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 backdrop-blur-md shadow-2xl border-2 border-violet-600 flex items-center justify-center cursor-ew-resize group-hover:scale-115 active:scale-95 transition-all">
                <ChevronsLeftRight className="w-5 h-5 text-violet-700" />
              </div>
            </div>
          </div>
        ) : (
          // ==========================================
          // SIDE-BY-SIDE DUAL VIEW
          // ==========================================
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isPanning ? 'none' : 'transform 0.12s ease-out',
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-full max-h-[calc(100vh-175px)]"
          >
            {/* Before Card */}
            <div className="relative bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden flex flex-col">
              <div className="px-3.5 py-2 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-300 bg-slate-950/80">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Before Enhance (Original)</span>
                </div>
                <span className="font-mono text-[11px] text-slate-400">
                  {project.width} × {project.height} px
                </span>
              </div>
              <div className="flex-1 flex items-center justify-center p-2 min-h-64">
                <img
                  src={project.originalUrl}
                  alt="Original Before"
                  referrerPolicy="no-referrer"
                  className="max-h-[calc(100vh-250px)] max-w-full object-contain rounded-xl select-none"
                />
              </div>
            </div>

            {/* After Card */}
            <div className="relative bg-slate-900 rounded-2xl shadow-xl border border-violet-500/30 overflow-hidden flex flex-col">
              <div className="px-3.5 py-2 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-violet-300 bg-slate-950/80">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  <span>After Enhance Pro HD</span>
                </div>
                <span className="font-mono text-[11px] text-violet-400 font-bold">
                  {project.width} × {project.height} px
                </span>
              </div>
              <div className="flex-1 flex items-center justify-center p-2 min-h-64">
                {enhancedCanvas ? (
                  <div
                    ref={sideBySideCanvasHolderRef}
                    className="max-h-[calc(100vh-250px)] max-w-full flex items-center justify-center"
                  />
                ) : (
                  <img
                    src={project.enhancedUrl || project.currentUrl || project.originalUrl}
                    alt="After Enhance"
                    referrerPolicy="no-referrer"
                    className="max-h-[calc(100vh-250px)] max-w-full object-contain rounded-xl select-none"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* REMINI "HOLD TO COMPARE" BUTTON (Bottom Left) */}
        {viewMode === 'slider' && (
          <div className="absolute bottom-3 left-4 z-30 flex items-center gap-2">
            <button
              onMouseDown={() => setIsHoldingBefore(true)}
              onMouseUp={() => setIsHoldingBefore(false)}
              onMouseLeave={() => setIsHoldingBefore(false)}
              onTouchStart={() => setIsHoldingBefore(true)}
              onTouchEnd={() => setIsHoldingBefore(false)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold backdrop-blur-md shadow-xl border transition-all select-none ${
                isHoldingBefore
                  ? 'bg-amber-500 text-black border-amber-400 scale-95'
                  : 'bg-slate-900/90 text-white hover:bg-slate-800 border-slate-700/80 hover:border-slate-500'
              }`}
              title="Click and hold to view 100% original photo"
            >
              <Eye className="w-4 h-4 text-amber-400" />
              <span>{isHoldingBefore ? 'Viewing Before' : 'Hold for Before'}</span>
            </button>
          </div>
        )}

        {/* FLOATING ZOOM & PAN HUD ISLAND (Bottom Right) */}
        <div className="absolute bottom-3 right-4 z-30 flex items-center gap-1 bg-slate-900/95 text-white backdrop-blur-md px-2.5 py-1.5 rounded-2xl shadow-2xl border border-slate-700/80 text-xs">
          {/* Zoom Out Button */}
          <button
            onClick={handleZoomOut}
            title="Zoom Out (Scroll Down / Trackpad)"
            className="p-1.5 hover:bg-slate-800 rounded-xl transition-colors text-slate-300 hover:text-white"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          {/* Quick Zoom Presets */}
          <div className="flex items-center gap-1 font-mono text-[11px] px-1 border-x border-slate-800">
            <button
              onClick={handleFitToScreen}
              className={`px-2 py-0.5 rounded-lg transition-colors font-bold ${
                zoom === 1 ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Fit to Laptop Screen"
            >
              Fit
            </button>
            <button
              onClick={() => handleSetExactZoom(1)}
              className={`px-1.5 py-0.5 rounded-lg transition-colors font-bold ${
                zoom === 1 ? 'text-violet-300' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="100% Native Resolution (1:1)"
            >
              1×
            </button>
            <button
              onClick={() => handleSetExactZoom(2)}
              className={`px-1.5 py-0.5 rounded-lg transition-colors font-bold ${
                zoom === 2 ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="200% Super Detail (2× Zoom)"
            >
              2×
            </button>
            <button
              onClick={() => handleSetExactZoom(4)}
              className={`px-1.5 py-0.5 rounded-lg transition-colors font-bold ${
                zoom === 4 ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="400% Ultra Pixel Inspection (4× Zoom)"
            >
              4×
            </button>
            <span className="text-violet-400 font-bold ml-1 min-w-[38px] text-right">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Zoom In Button */}
          <button
            onClick={handleZoomIn}
            title="Zoom In (Scroll Up / Trackpad)"
            className="p-1.5 hover:bg-slate-800 rounded-xl transition-colors text-slate-300 hover:text-white"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          {/* Reset Pan & Zoom */}
          <button
            onClick={handleFitToScreen}
            title="Reset Pan, Zoom & Center (Fit Screen)"
            className="p-1.5 hover:bg-slate-800 rounded-xl transition-colors text-slate-300 hover:text-white ml-0.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Interactive Hint */}
          <div className="hidden xl:flex items-center gap-1.5 text-[10px] text-slate-400 pl-2 border-l border-slate-800">
            <span>Scroll: Zoom</span>
            <span>•</span>
            <span>Drag: Pan</span>
            <span>•</span>
            <span>Double Click: 2.5×</span>
          </div>
        </div>
      </div>
    </div>
  );
};
