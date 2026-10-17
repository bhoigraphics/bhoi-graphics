import React, { useState } from 'react';
import { UserCheck, Sparkles, Sliders, Check, Download } from 'lucide-react';
import { Project } from '../../types';
import { loadImage, processImageOnCanvas, downloadProcessedImage } from '../../utils/imageEngine';

interface PortraitEnhancerViewProps {
  project: Project;
  onApplyPortraitSettings: (settings: any) => void;
}

export const PortraitEnhancerView: React.FC<PortraitEnhancerViewProps> = ({
  project,
  onApplyPortraitSettings,
}) => {
  const [skinSmoothing, setSkinSmoothing] = useState(50);
  const [blemishReduction, setBlemishReduction] = useState(45);
  const [eyeBrightening, setEyeBrightening] = useState(30);
  const [warmthGlow, setWarmthGlow] = useState(15);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleProcessPortrait = async () => {
    setIsProcessing(true);
    try {
      const img = await loadImage(project.currentUrl);
      const settings = {
        ...project.settings,
        skinSmoothing,
        blemishReduction,
        brightness: eyeBrightening * 0.2,
        whiteBalance: warmthGlow * 0.4,
        sharpness: 45,
        detailEnhancement: 40,
      };
      const canvas = processImageOnCanvas(img, settings, 'portrait', false, 'preserve');
      setPreviewUrl(canvas.toDataURL('image/png'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-violet-600" />
            <span>Portrait and Headshot Enhancer</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Gently polish skin complexion, remove micro-blemishes, brighten eyes, and balance studio headshot lighting while preserving authentic skin pores.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 font-semibold">Skin Smoothing Intensity</span>
                <span className="font-mono tabular-nums text-violet-700 font-bold">{skinSmoothing}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={skinSmoothing}
                onChange={(e) => setSkinSmoothing(parseInt(e.target.value))}
                className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 font-semibold">Blemish & Spot Softening</span>
                <span className="font-mono tabular-nums text-violet-700 font-bold">{blemishReduction}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={blemishReduction}
                onChange={(e) => setBlemishReduction(parseInt(e.target.value))}
                className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 font-semibold">Eye & Iris Sparkle</span>
                <span className="font-mono tabular-nums text-violet-700 font-bold">{eyeBrightening}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={eyeBrightening}
                onChange={(e) => setEyeBrightening(parseInt(e.target.value))}
                className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 font-semibold">Golden Studio Warmth</span>
                <span className="font-mono tabular-nums text-violet-700 font-bold">{warmthGlow}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={warmthGlow}
                onChange={(e) => setWarmthGlow(parseInt(e.target.value))}
                className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            <button
              onClick={handleProcessPortrait}
              disabled={isProcessing}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isProcessing ? 'Retouching Features...' : 'Run Portrait Retouch'}</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="text-xs font-semibold text-slate-700 mb-2">Retouched Output</div>
            <div className="flex-1 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden min-h-64 relative p-4">
              <img
                src={previewUrl || project.currentUrl}
                alt="Portrait"
                referrerPolicy="no-referrer"
                className="max-h-64 object-contain rounded"
              />
            </div>

            {previewUrl && (
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() =>
                    onApplyPortraitSettings({
                      skinSmoothing,
                      blemishReduction,
                      brightness: eyeBrightening * 0.2,
                      whiteBalance: warmthGlow * 0.4,
                    })
                  }
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  Apply to Photo Enhance Pro
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
