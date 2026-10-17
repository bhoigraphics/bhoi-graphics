import React, { useState } from 'react';
import { Palette, RotateCcw, Sparkles } from 'lucide-react';
import { Project } from '../../types';
import { loadImage, processImageOnCanvas } from '../../utils/imageEngine';

interface ColorCorrectionViewProps {
  project: Project;
  onApplyColorSettings: (newSettings: any) => void;
}

export const ColorCorrectionView: React.FC<ColorCorrectionViewProps> = ({
  project,
  onApplyColorSettings,
}) => {
  const [temperature, setTemperature] = useState(project.settings.whiteBalance || 0);
  const [tint, setTint] = useState(project.settings.colorCorrection || 0);
  const [vibrance, setVibrance] = useState(project.settings.saturation || 10);
  const [shadowLift, setShadowLift] = useState(project.settings.shadowRecovery || 15);
  const [highlightDim, setHighlightDim] = useState(project.settings.highlightRecovery || 10);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleUpdate = async (newTemp: number, newTint: number, newVib: number, newShad: number, newHigh: number) => {
    const img = await loadImage(project.currentUrl);
    const s = {
      ...project.settings,
      whiteBalance: newTemp,
      colorCorrection: newTint,
      saturation: newVib,
      shadowRecovery: newShad,
      highlightRecovery: newHigh,
    };
    const canvas = processImageOnCanvas(img, s, project.targetDomain, false, 'preserve');
    setPreviewUrl(canvas.toDataURL('image/png'));
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Palette className="w-5 h-5 text-violet-600" />
            <span>Colour Correction & Color Grading</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Fine-tune photographic white balance, shadow exposure lift, highlight recovery, and color saturation matrices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 font-semibold">White Balance / Temperature</span>
                <span className="font-mono tabular-nums text-violet-700 font-bold">
                  {temperature > 0 ? `+${temperature} (Warm)` : temperature < 0 ? `${temperature} (Cool)` : '0'}
                </span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={temperature}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setTemperature(val);
                  handleUpdate(val, tint, vibrance, shadowLift, highlightDim);
                }}
                className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 font-semibold">Colour Tint</span>
                <span className="font-mono tabular-nums text-violet-700 font-bold">{tint}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={tint}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setTint(val);
                  handleUpdate(temperature, val, vibrance, shadowLift, highlightDim);
                }}
                className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 font-semibold">Vibrance / Saturation</span>
                <span className="font-mono tabular-nums text-violet-700 font-bold">{vibrance}%</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={vibrance}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setVibrance(val);
                  handleUpdate(temperature, tint, val, shadowLift, highlightDim);
                }}
                className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 font-semibold">Shadow Recovery</span>
                <span className="font-mono tabular-nums text-violet-700 font-bold">{shadowLift}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={shadowLift}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setShadowLift(val);
                  handleUpdate(temperature, tint, vibrance, val, highlightDim);
                }}
                className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 font-semibold">Highlight Compression</span>
                <span className="font-mono tabular-nums text-violet-700 font-bold">{highlightDim}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={highlightDim}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setHighlightDim(val);
                  handleUpdate(temperature, tint, vibrance, shadowLift, val);
                }}
                className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            <button
              onClick={() => {
                setTemperature(0);
                setTint(0);
                setVibrance(0);
                setShadowLift(0);
                setHighlightDim(0);
                handleUpdate(0, 0, 0, 0, 0);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Color Balance</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="text-xs font-semibold text-slate-700 mb-2">Graded Preview</div>
            <div className="flex-1 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden min-h-64 relative p-4">
              <img
                src={previewUrl || project.currentUrl}
                alt="Preview"
                referrerPolicy="no-referrer"
                className="max-h-64 object-contain rounded"
              />
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() =>
                  onApplyColorSettings({
                    whiteBalance: temperature,
                    colorCorrection: tint,
                    saturation: vibrance,
                    shadowRecovery: shadowLift,
                    highlightRecovery: highlightDim,
                  })
                }
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                Apply to Photo Enhance Pro
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
