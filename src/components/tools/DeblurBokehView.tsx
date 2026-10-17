import React, { useState } from 'react';
import { Focus, Eye, Palette, Sparkles, Check, Download, Wand2, RefreshCw } from 'lucide-react';
import { Project } from '../../types';
import { loadImage, processImageOnCanvas, downloadProcessedImage } from '../../utils/imageEngine';

interface DeblurBokehViewProps {
  project: Project;
  onApplyDeblurBokeh: (newUrl: string, settings: any) => void;
}

export const DeblurBokehView: React.FC<DeblurBokehViewProps> = ({
  project,
  onApplyDeblurBokeh,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'deblur' | 'bokeh' | 'color'>('all');
  const [deblurAmount, setDeblurAmount] = useState<number>(85);
  const [backgroundBlur, setBackgroundBlur] = useState<number>(65);
  const [hdrColorBoost, setHdrColorBoost] = useState<number>(60);
  const [sharpness, setSharpness] = useState<number>(75);
  const [saturation, setSaturation] = useState<number>(30);
  const [contrast, setContrast] = useState<number>(20);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleProcess = async () => {
    setIsProcessing(true);
    try {
      const img = await loadImage(project.currentUrl);
      const settings = {
        ...project.settings,
        deblurAmount,
        backgroundBlur,
        hdrColorBoost,
        sharpness,
        saturation,
        contrast,
      };

      const canvas = processImageOnCanvas(img, settings, 'general', false, 'preserve');
      setPreviewUrl(canvas.toDataURL('image/png'));
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!previewUrl) return;
    const img = await loadImage(previewUrl);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, 0, 0);
      await downloadProcessedImage(canvas, `${project.name}_deblur_bokeh_hd`, 'png', 'maximum');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Blur Photo Fix, Background Bokeh & Colour Enhancer
              </h2>
              <p className="text-xs text-slate-500">
                Turn blurry out-of-focus photos into sharp HD, add DSLR studio background blur (bokeh), and enhance vibrant HDR colours.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-200/60 p-1 rounded-xl w-fit">
          {[
            { id: 'all', label: 'All 3 Combined (Recommended)' },
            { id: 'deblur', label: 'Blur Photo to HD' },
            { id: 'bokeh', label: 'Blur Background (Bokeh)' },
            { id: 'color', label: 'Enhance Colour' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-violet-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            {/* 1. Blur photo to HD */}
            {(activeTab === 'all' || activeTab === 'deblur') && (
              <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                  <Focus className="w-3.5 h-3.5 text-indigo-600" />
                  <span>1. Blur Photo to HD (Focus Deblur)</span>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-700 font-medium">Deblur & Motion Recovery</span>
                    <span className="font-mono tabular-nums text-indigo-700 font-bold">{deblurAmount}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={deblurAmount}
                    onChange={(e) => setDeblurAmount(parseInt(e.target.value))}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* 2. Blur Background Bokeh */}
            {(activeTab === 'all' || activeTab === 'bokeh') && (
              <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                  <Eye className="w-3.5 h-3.5 text-purple-600" />
                  <span>2. Blur Background (DSLR Bokeh)</span>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-700 font-medium">Background Blur Intensity</span>
                    <span className="font-mono tabular-nums text-purple-700 font-bold">{backgroundBlur}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={backgroundBlur}
                    onChange={(e) => setBackgroundBlur(parseInt(e.target.value))}
                    className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block leading-tight">
                    Main subject remains in crystal-sharp focus while ambient background blurs softly.
                  </span>
                </div>
              </div>
            )}

            {/* 3. Enhance Colour */}
            {(activeTab === 'all' || activeTab === 'color') && (
              <div className="p-3 bg-pink-50/50 rounded-xl border border-pink-100 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-pink-900">
                  <Palette className="w-3.5 h-3.5 text-pink-600" />
                  <span>3. Enhance Colour & HDR Pop</span>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-700 font-medium">HDR Dynamic Colour Boost</span>
                    <span className="font-mono tabular-nums text-pink-700 font-bold">{hdrColorBoost}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={hdrColorBoost}
                    onChange={(e) => setHdrColorBoost(parseInt(e.target.value))}
                    className="w-full accent-pink-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-700 font-medium">Colour Vibrance</span>
                    <span className="font-mono tabular-nums text-slate-600 font-semibold">{saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="100"
                    value={saturation}
                    onChange={(e) => setSaturation(parseInt(e.target.value))}
                    className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleProcess}
              disabled={isProcessing}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isProcessing ? 'Processing Deblur, Bokeh & Colour...' : 'Apply HD Deblur, Bokeh & Colour'}</span>
            </button>
          </div>

          {/* Result Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
              <span>Enhanced HD Output</span>
              <span className="text-[11px] text-slate-400 font-mono">
                {project.width} × {project.height} px
              </span>
            </div>

            <div className="flex-1 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden min-h-64 relative p-4">
              {isProcessing ? (
                <div className="text-center p-6 bg-white/90 backdrop-blur-xs rounded-xl shadow-xs">
                  <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span className="text-xs font-semibold text-slate-700">Reconstructing sharpness & depth...</span>
                </div>
              ) : previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Enhanced"
                  referrerPolicy="no-referrer"
                  className="max-h-64 object-contain rounded"
                />
              ) : (
                <img
                  src={project.currentUrl}
                  alt="Current"
                  referrerPolicy="no-referrer"
                  className="max-h-64 object-contain rounded opacity-80"
                />
              )}
            </div>

            {previewUrl && (
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    onApplyDeblurBokeh(previewUrl, {
                      deblurAmount,
                      backgroundBlur,
                      hdrColorBoost,
                      sharpness,
                      saturation,
                      contrast,
                    });
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Apply to Project
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Enhanced HD</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
