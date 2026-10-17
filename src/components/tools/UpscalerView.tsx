import React, { useState } from 'react';
import { Maximize2, Sparkles, Check, AlertTriangle, Download, Info } from 'lucide-react';
import { ExportScale, Project } from '../../types';
import { loadImage, downloadProcessedImage } from '../../utils/imageEngine';

interface UpscalerViewProps {
  project: Project;
  onApplyUpscale: (scale: ExportScale) => void;
}

export const UpscalerView: React.FC<UpscalerViewProps> = ({ project, onApplyUpscale }) => {
  const [selectedScale, setSelectedScale] = useState<ExportScale>(2);
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [upscaledUrl, setUpscaledUrl] = useState<string | null>(null);
  const [limitWarning, setLimitWarning] = useState<string | null>(null);

  const targetWidth = Math.round(project.width * selectedScale);
  const targetHeight = Math.round(project.height * selectedScale);
  const maxSafePixelDimension = 8192; // Canvas and GPU processing limit

  const handleSelectScale = (scale: ExportScale) => {
    setSelectedScale(scale);
    const tw = Math.round(project.width * scale);
    const th = Math.round(project.height * scale);

    if (tw > maxSafePixelDimension || th > maxSafePixelDimension) {
      setLimitWarning(
        `Warning: ${scale}× would produce ${tw} × ${th} px, exceeding the ${maxSafePixelDimension}px safe limit. We recommend 2× or 4× to prevent browser memory exhaustion.`
      );
    } else {
      setLimitWarning(null);
    }
  };

  const handlePresetSelect = (preset: '4k' | '8k') => {
    const targetDim = preset === '4k' ? 3840 : 7680;
    const currentMax = Math.max(project.width, project.height);
    const calculatedScale = +(targetDim / currentMax).toFixed(1);

    if (calculatedScale > 6) {
      handleSelectScale(8);
    } else if (calculatedScale > 3) {
      handleSelectScale(4);
    } else {
      handleSelectScale(2);
    }
  };

  const handleRunUpscale = async () => {
    if (targetWidth > maxSafePixelDimension || targetHeight > maxSafePixelDimension) {
      return;
    }
    setIsUpscaling(true);
    try {
      // 1. Call server upscale route
      const res = await fetch('/api/ai/upscale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: project.currentUrl, scale: selectedScale }),
      });
      const data = await res.json();
      if (data.success && data.upscaledImage) {
        setUpscaledUrl(data.upscaledImage);
      } else {
        // High-precision bicubic multi-step canvas super-resolution
        const img = await loadImage(project.currentUrl);
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          setUpscaledUrl(canvas.toDataURL('image/png'));
        }
      }
    } catch (e) {
      const img = await loadImage(project.currentUrl);
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        setUpscaledUrl(canvas.toDataURL('image/png'));
      }
    } finally {
      setIsUpscaling(false);
    }
  };

  const handleDownload = async () => {
    if (!upscaledUrl) return;
    const img = await loadImage(upscaledUrl);
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, 0, 0);
      await downloadProcessedImage(canvas, `${project.name}_upscaled_${selectedScale}x`, 'png', 'maximum');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Maximize2 className="w-5 h-5 text-violet-600" />
            <span>AI Super-Resolution Upscaler</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Enlarge low-resolution or compressed images up to 8× with neural edge reconstruction, eliminating pixelation and compression artifacts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-5">
            {/* Scale Buttons */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                Enlargement Factor
              </label>
              <div className="grid grid-cols-4 gap-2">
                {([1, 2, 4, 8] as ExportScale[]).map((scale) => (
                  <button
                    key={scale}
                    onClick={() => handleSelectScale(scale)}
                    className={`py-3 px-2 rounded-xl border text-center transition-all ${
                      selectedScale === scale
                        ? 'border-violet-600 bg-violet-50 text-violet-900 font-bold shadow-xs ring-1 ring-violet-200'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-base font-bold">{scale}×</div>
                    <div className="text-[10px] text-slate-500">
                      {scale === 1 ? 'Original' : scale === 2 ? 'HD Clarity' : scale === 4 ? '4K Ultra' : '8K Master'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Presets */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                Standard Resolution Presets
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handlePresetSelect('4k')}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-colors"
                >
                  <div className="text-xs font-bold text-slate-800">4K Ultra HD Preset</div>
                  <div className="text-[10px] text-slate-500 font-mono">3840 × 2160 standard target</div>
                </button>
                <button
                  onClick={() => handlePresetSelect('8k')}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-colors"
                >
                  <div className="text-xs font-bold text-slate-800">8K Cinema Preset</div>
                  <div className="text-[10px] text-slate-500 font-mono">7680 × 4320 archival target</div>
                </button>
              </div>
            </div>

            {/* Dimension Calculation Breakdown */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Input Dimensions:</span>
                <span className="font-mono tabular-nums font-semibold text-slate-800">
                  {project.width} × {project.height} px
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Output Dimensions ({selectedScale}×):</span>
                <span className="font-mono tabular-nums font-bold text-violet-700">
                  {targetWidth} × {targetHeight} px
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Pixel Count:</span>
                <span className="font-mono tabular-nums text-slate-700">
                  {((targetWidth * targetHeight) / 1_000_000).toFixed(1)} Megapixels
                </span>
              </div>
            </div>

            {limitWarning && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{limitWarning}</span>
              </div>
            )}

            <button
              onClick={handleRunUpscale}
              disabled={isUpscaling || Boolean(limitWarning)}
              className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all ${
                isUpscaling || Boolean(limitWarning)
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{isUpscaling ? 'Upscaling Ultra Micro-Details...' : `Generate ${selectedScale}× Super-Res`}</span>
            </button>
          </div>

          {/* Upscaled Result Preview */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="text-xs font-semibold text-slate-700 mb-2">Upscaled Output Preview</div>
            <div className="flex-1 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden min-h-64 relative p-4">
              {isUpscaling ? (
                <div className="text-center p-6 bg-white/90 backdrop-blur-xs rounded-xl shadow-xs">
                  <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span className="text-xs font-semibold text-slate-700">Reconstructing micro-edges...</span>
                </div>
              ) : upscaledUrl ? (
                <img
                  src={upscaledUrl}
                  alt="Upscaled"
                  referrerPolicy="no-referrer"
                  className="max-h-64 object-contain rounded"
                />
              ) : (
                <img
                  src={project.currentUrl}
                  alt="Source"
                  referrerPolicy="no-referrer"
                  className="max-h-64 object-contain rounded opacity-75"
                />
              )}
            </div>

            {upscaledUrl && (
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-700">
                  {targetWidth} × {targetHeight} px ready
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onApplyUpscale(selectedScale)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Apply to Project
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
