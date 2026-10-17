import React, { useState } from 'react';
import { Shapes, Sparkles, Download, Check, RefreshCw, ZoomIn, Grid, ArrowRight } from 'lucide-react';
import { Project, ExportScale } from '../../types';
import { loadImage, processImageOnCanvas, downloadProcessedImage } from '../../utils/imageEngine';

interface PngShapeHdViewProps {
  project: Project;
  onApplyToProject: (newUrl: string, newSettings?: any) => void;
}

export const PngShapeHdView: React.FC<PngShapeHdViewProps> = ({
  project,
  onApplyToProject,
}) => {
  const [edgeCrispness, setEdgeCrispness] = useState<number>(85);
  const [sharpnessBoost, setSharpnessBoost] = useState<number>(80);
  const [antiAliasing, setAntiAliasing] = useState<number>(75);
  const [colorVibrance, setColorVibrance] = useState<number>(30);
  const [removeWhiteBg, setRemoveWhiteBg] = useState<boolean>(true);
  const [removeBlueFringe, setRemoveBlueFringe] = useState<boolean>(true);
  const [noiseReduction, setNoiseReduction] = useState<number>(100);
  const [scale, setScale] = useState<ExportScale>(2);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hdResultUrl, setHdResultUrl] = useState<string | null>(null);

  const handleConvertShapeToHd = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const img = await loadImage(project.currentUrl);
      const settings = {
        ...project.settings,
        shapeEdgeCrisp: edgeCrispness,
        sharpness: sharpnessBoost,
        detailEnhancement: antiAliasing,
        hdrColorBoost: colorVibrance,
        removeWhiteBg,
        removeBlueFringe,
        noiseReduction,
        contrast: 22,
        saturation: 25,
      };

      const canvas = processImageOnCanvas(
        img,
        settings,
        'png-shape',
        removeWhiteBg,
        removeWhiteBg ? 'remove-white' : 'preserve',
        '#FFFFFF',
        scale
      );

      setHdResultUrl(canvas.toDataURL('image/png'));
    } catch (e: any) {
      console.error('HD conversion error:', e);
      setErrorMessage(e?.message || 'Error processing high-resolution shape. Please try 2× Full HD scale.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadHdShape = async () => {
    if (!hdResultUrl) return;
    const img = await loadImage(hdResultUrl);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, 0, 0);
      await downloadProcessedImage(canvas, `${project.name}_shape_HD_${scale}x`, 'png', 'maximum');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center shadow-xs">
              <Shapes className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">PNG Shape to Ultra HD Converter</h2>
              <p className="text-xs text-slate-500">
                Transforms low-res PNG shapes, logos, stickers, and cutouts into vector-sharp, crystal-clear Ultra HD quality.
              </p>
            </div>
          </div>
        </div>

        {/* 1-Click Preset Bar */}
        <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 rounded-2xl p-4 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-200" />
              <h3 className="text-sm font-bold">1-Click Full HD Shape Mode</h3>
            </div>
            <p className="text-xs text-violet-100 mt-0.5">
              Without blue line proper draw • 100% noise reduce • 100% white background remove • Full HD quality
            </p>
          </div>
          <button
            onClick={() => {
              setEdgeCrispness(95);
              setSharpnessBoost(90);
              setAntiAliasing(85);
              setColorVibrance(25);
              setRemoveWhiteBg(true);
              setRemoveBlueFringe(true);
              setNoiseReduction(100);
              setScale(2);
            }}
            className="px-4 py-2 bg-white text-violet-900 hover:bg-violet-50 text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
          >
            Apply Full HD Preset
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Controls Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="p-3 bg-violet-50 border border-violet-100 rounded-xl text-violet-900 text-xs">
              <strong>Vector-Crisp Anti-Aliasing:</strong> Removes jagged pixel steps from PNG shape edges, purges dirty transparent fringes, and reconstructs crisp contours.
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 font-semibold">Shape Edge Crispness & Vectorization</span>
                <span className="font-mono tabular-nums text-violet-700 font-bold">{edgeCrispness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={edgeCrispness}
                onChange={(e) => setEdgeCrispness(parseInt(e.target.value))}
                className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 font-semibold">High-Frequency Line Sharpness</span>
                <span className="font-mono tabular-nums text-violet-700 font-bold">{sharpnessBoost}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sharpnessBoost}
                onChange={(e) => setSharpnessBoost(parseInt(e.target.value))}
                className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 font-semibold">Alpha Edge Anti-Aliasing</span>
                <span className="font-mono tabular-nums text-violet-700 font-bold">{antiAliasing}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={antiAliasing}
                onChange={(e) => setAntiAliasing(parseInt(e.target.value))}
                className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 font-semibold">Color Richness & Contrast</span>
                <span className="font-mono tabular-nums text-violet-700 font-bold">{colorVibrance}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={colorVibrance}
                onChange={(e) => setColorVibrance(parseInt(e.target.value))}
                className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* White Background Removal Toggle */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">Remove 100% White Background</span>
                  <span className="text-[10px] text-slate-500">Converts solid white paper/canvas to transparent cutout</span>
                </div>
                <button
                  onClick={() => setRemoveWhiteBg(!removeWhiteBg)}
                  className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${
                    removeWhiteBg ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                      removeWhiteBg ? 'left-4.5' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* No Blue Lines Toggle */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
                <div>
                  <span className="font-bold text-slate-900 block">No Blue Lines (Defringe Halos)</span>
                  <span className="text-[10px] text-slate-500">Draws pure crisp original lines without blue tint</span>
                </div>
                <button
                  onClick={() => setRemoveBlueFringe(!removeBlueFringe)}
                  className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${
                    removeBlueFringe ? 'bg-violet-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                      removeBlueFringe ? 'left-4.5' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* 100% Noise Reduction Toggle */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
                <div>
                  <span className="font-bold text-slate-900 block">100% Noise & Artifact Reduction</span>
                  <span className="text-[10px] text-slate-500">Eliminates speckled grain and compression noise</span>
                </div>
                <button
                  onClick={() => setNoiseReduction(noiseReduction === 100 ? 0 : 100)}
                  className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${
                    noiseReduction === 100 ? 'bg-violet-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                      noiseReduction === 100 ? 'left-4.5' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Resolution Scaling */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Output HD Scaling Factor
                </label>
                <span className="text-[11px] font-mono text-violet-700 font-semibold">
                  {scale === 1 ? '1× Standard HD' : scale === 2 ? '2× Full HD (Recommended)' : scale === 4 ? '4× Ultra HD 4K' : '8× Max Detail'}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {([1, 2, 4, 8] as ExportScale[]).map((sc) => (
                  <button
                    key={sc}
                    onClick={() => setScale(sc)}
                    className={`py-2 text-xs font-bold rounded-xl border text-center transition-colors ${
                      scale === sc
                        ? 'border-violet-600 bg-violet-50 text-violet-900 shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {sc}× {sc === 2 ? 'FHD' : sc === 4 ? '4K' : ''}
                  </button>
                ))}
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center justify-between">
                <span>{errorMessage}</span>
                <button onClick={() => setErrorMessage(null)} className="font-bold underline text-red-800 ml-2">
                  Dismiss
                </button>
              </div>
            )}

            <button
              onClick={handleConvertShapeToHd}
              disabled={isProcessing}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isProcessing ? 'Converting Shape to HD...' : 'Convert PNG Shape to Ultra HD'}</span>
            </button>
          </div>

          {/* Result Card with Checkerboard */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
              <span>HD Shape Preview</span>
              <span className="text-[11px] text-slate-400 font-mono">
                {hdResultUrl ? `${project.width * scale} × ${project.height * scale} px` : `${project.width} × ${project.height} px`}
              </span>
            </div>

            <div className="flex-1 rounded-xl bg-checkerboard border border-slate-200 flex items-center justify-center overflow-hidden min-h-64 relative p-4">
              {isProcessing ? (
                <div className="text-center p-6 bg-white/90 backdrop-blur-xs rounded-xl shadow-xs">
                  <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span className="text-xs font-semibold text-slate-700">Vectorizing shape edges...</span>
                </div>
              ) : hdResultUrl ? (
                <img
                  src={hdResultUrl}
                  alt="HD Shape"
                  referrerPolicy="no-referrer"
                  className="max-h-64 object-contain rounded"
                />
              ) : (
                <img
                  src={project.currentUrl}
                  alt="Original Shape"
                  referrerPolicy="no-referrer"
                  className="max-h-64 object-contain rounded opacity-80"
                />
              )}
            </div>

            {hdResultUrl && (
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    onApplyToProject(hdResultUrl, {
                      shapeEdgeCrisp: edgeCrispness,
                      sharpness: sharpnessBoost,
                      detailEnhancement: antiAliasing,
                      hdrColorBoost: colorVibrance,
                    });
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Apply to Project
                </button>
                <button
                  onClick={handleDownloadHdShape}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download HD PNG Shape</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
