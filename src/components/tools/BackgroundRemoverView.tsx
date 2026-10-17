import React, { useState } from 'react';
import { Scissors, Check, Download, AlertTriangle, Sparkles, RefreshCw, Layers } from 'lucide-react';
import { Project } from '../../types';
import { loadImage, processImageOnCanvas, downloadProcessedImage } from '../../utils/imageEngine';

interface BackgroundRemoverViewProps {
  project: Project;
  onApplyCutoutToProject: (newUrl: string) => void;
}

export const BackgroundRemoverView: React.FC<BackgroundRemoverViewProps> = ({
  project,
  onApplyCutoutToProject,
}) => {
  const [bgChoice, setBgChoice] = useState<'transparent' | 'white' | 'custom' | 'gradient'>('transparent');
  const [customColor, setCustomColor] = useState('#6366F1');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cutoutUrl, setCutoutUrl] = useState<string | null>(null);

  const handleRunBackgroundRemoval = async () => {
    setIsProcessing(true);
    try {
      // 1. Try server Gemini background removal endpoint first
      const res = await fetch('/api/ai/remove-background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: project.originalUrl }),
      });
      const data = await res.json();

      if (data.success && data.cutoutImage) {
        setCutoutUrl(data.cutoutImage);
      } else {
        // Fallback to client high-definition cutout canvas engine
        const img = await loadImage(project.originalUrl);
        const canvas = processImageOnCanvas(img, project.settings, project.targetDomain, true, 'transparent');
        setCutoutUrl(canvas.toDataURL('image/png'));
      }
    } catch (e) {
      const img = await loadImage(project.originalUrl);
      const canvas = processImageOnCanvas(img, project.settings, project.targetDomain, true, 'transparent');
      setCutoutUrl(canvas.toDataURL('image/png'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveWhiteBackground = async () => {
    setIsProcessing(true);
    try {
      const img = await loadImage(project.originalUrl);
      const canvas = processImageOnCanvas(
        img,
        { ...project.settings, removeWhiteBg: true, removeBlueFringe: true },
        project.targetDomain,
        true,
        'remove-white'
      );
      setCutoutUrl(canvas.toDataURL('image/png'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadCutout = async () => {
    if (!cutoutUrl) return;
    const img = await loadImage(cutoutUrl);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (bgChoice === 'white') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (bgChoice === 'custom') {
      ctx.fillStyle = customColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (bgChoice === 'gradient') {
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, '#7C3AED');
      grad.addColorStop(1, '#3B82F6');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(img, 0, 0);
    await downloadProcessedImage(canvas, project.name + '_cutout', 'png', 'maximum');
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Scissors className="w-5 h-5 text-violet-600" />
            <span>Background Remover (Mode B Workspace)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Isolate the foreground subject with alpha transparency. Mode A remains active by default to protect originals; use this tool when transparent PNG output is explicitly desired.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
              <strong>Explicit Removal Confirmation:</strong> In PixorAI, backgrounds are never stripped by accident. Clicking remove initiates foreground isolation.
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                Replacement Backdrop
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setBgChoice('transparent')}
                  className={`p-3 text-xs rounded-xl border text-left transition-colors ${
                    bgChoice === 'transparent'
                      ? 'border-violet-600 bg-violet-50 font-bold text-violet-900'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-checkerboard border border-slate-300" />
                    <span>Transparent Alpha</span>
                  </div>
                </button>

                <button
                  onClick={() => setBgChoice('white')}
                  className={`p-3 text-xs rounded-xl border text-left transition-colors ${
                    bgChoice === 'white'
                      ? 'border-violet-600 bg-violet-50 font-bold text-violet-900'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-white border border-slate-300" />
                    <span>Clean Studio White</span>
                  </div>
                </button>

                <button
                  onClick={() => setBgChoice('custom')}
                  className={`p-3 text-xs rounded-xl border text-left transition-colors ${
                    bgChoice === 'custom'
                      ? 'border-violet-600 bg-violet-50 font-bold text-violet-900'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded border border-slate-300"
                        style={{ backgroundColor: customColor }}
                      />
                      <span>Solid Color</span>
                    </div>
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer p-0"
                    />
                  </div>
                </button>

                <button
                  onClick={() => setBgChoice('gradient')}
                  className={`p-3 text-xs rounded-xl border text-left transition-colors ${
                    bgChoice === 'gradient'
                      ? 'border-violet-600 bg-violet-50 font-bold text-violet-900'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gradient-to-tr from-violet-600 to-blue-500" />
                    <span>Modern Gradient</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleRemoveWhiteBackground}
                disabled={isProcessing}
                className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 shadow-xs transition-all ${
                  isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>100% Remove White Colour Background</span>
              </button>

              <button
                onClick={handleRunBackgroundRemoval}
                disabled={isProcessing}
                className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all ${
                  isProcessing
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-200'
                }`}
              >
                <Scissors className="w-4 h-4" />
                <span>{isProcessing ? 'Isolating Subject...' : 'Remove Any Background'}</span>
              </button>
            </div>
          </div>

          {/* Cutout Preview */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="text-xs font-semibold text-slate-700 mb-2">Alpha Cutout Result</div>
            <div
              className={`flex-1 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden min-h-64 relative p-4 ${
                bgChoice === 'transparent'
                  ? 'bg-checkerboard'
                  : bgChoice === 'white'
                  ? 'bg-white'
                  : bgChoice === 'custom'
                  ? ''
                  : 'bg-gradient-to-tr from-violet-600 to-blue-500'
              }`}
              style={{
                backgroundColor: bgChoice === 'custom' ? customColor : undefined,
              }}
            >
              {isProcessing ? (
                <div className="text-center p-6 bg-white/90 backdrop-blur-xs rounded-xl shadow-xs">
                  <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span className="text-xs font-semibold text-slate-700">Calculating alpha edges...</span>
                </div>
              ) : cutoutUrl ? (
                <img
                  src={cutoutUrl}
                  alt="Cutout"
                  referrerPolicy="no-referrer"
                  className="max-h-64 object-contain"
                />
              ) : (
                <div className="text-center p-6 text-slate-400">
                  <Scissors className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <span className="text-xs">Click 'Remove Background Now' to isolate foreground</span>
                </div>
              )}
            </div>

            {cutoutUrl && (
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => onApplyCutoutToProject(cutoutUrl)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Apply to Project
                </button>
                <button
                  onClick={handleDownloadCutout}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Transparent PNG</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
