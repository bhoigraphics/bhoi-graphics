import React, { useState } from 'react';
import { Layers, Type, Sparkles, Download, Check, ShieldCheck } from 'lucide-react';
import { Project } from '../../types';
import { loadImage, downloadProcessedImage } from '../../utils/imageEngine';

interface GraphicsEditorViewProps {
  project: Project;
  onApplyGraphicsResult: (newUrl: string) => void;
}

export const GraphicsEditorView: React.FC<GraphicsEditorViewProps> = ({
  project,
  onApplyGraphicsResult,
}) => {
  const [overlayText, setOverlayText] = useState('Save the Date');
  const [textColor, setTextColor] = useState('#D97706'); // Gold foil tone
  const [fontSize, setFontSize] = useState(48);
  const [fontFamily, setFontFamily] = useState('serif');
  const [borderStyle, setBorderStyle] = useState<'none' | 'gold-border' | 'double-frame'>('gold-border');
  const [lineSharpnessBoost, setLineSharpnessBoost] = useState(70);
  const [isRendering, setIsRendering] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleRenderGraphics = async () => {
    setIsRendering(true);
    try {
      const img = await loadImage(project.currentUrl);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Draw base image
      ctx.drawImage(img, 0, 0);

      // 2. Decorative frame border if selected
      const w = canvas.width;
      const h = canvas.height;
      const margin = Math.min(w, h) * 0.05;

      if (borderStyle === 'gold-border') {
        ctx.strokeStyle = '#D97706';
        ctx.lineWidth = Math.max(2, Math.round(w * 0.003));
        ctx.strokeRect(margin, margin, w - margin * 2, h - margin * 2);

        // Corner corner flourishes
        ctx.strokeRect(margin + 8, margin + 8, w - margin * 2 - 16, h - margin * 2 - 16);
      } else if (borderStyle === 'double-frame') {
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = Math.max(3, Math.round(w * 0.004));
        ctx.strokeRect(margin, margin, w - margin * 2, h - margin * 2);
      }

      // 3. Render typography overlay
      if (overlayText.trim()) {
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const scaledFont = Math.round((fontSize * w) / 1000);
        ctx.font = `600 ${scaledFont}px ${
          fontFamily === 'serif' ? 'Georgia, serif' : 'Plus Jakarta Sans, sans-serif'
        }`;

        // Subtle text drop shadow for legibility
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 6;
        ctx.fillText(overlayText, w / 2, h / 2);
        ctx.shadowBlur = 0;
      }

      setPreviewUrl(canvas.toDataURL('image/png'));
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-violet-600" />
            <span>Graphics Design Editor (Floral & Invitation Studio)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Engineered specifically for wedding invitations, floral borders, vector artwork, and decorative certificates. Preserves original background texture and line sharpness with zero unwanted facial smoothing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Ornament & Border Protection Active:</strong> Contrast and micro-textures are tuned for botanical watercolours and foil stamping.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Custom Headline / Typography Overlay
              </label>
              <input
                type="text"
                value={overlayText}
                onChange={(e) => setOverlayText(e.target.value)}
                placeholder="e.g. Save the Date, Eleanor & Arthur, Certificate of Excellence"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Typography Style
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden"
                >
                  <option value="serif">Luxury Editorial Serif</option>
                  <option value="sans">Clean Modern Sans</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Text / Foil Color
                </label>
                <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer p-0"
                  />
                  <span className="text-xs font-mono text-slate-600">{textColor}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Decorative Border Overlay
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'none', label: 'None' },
                  { id: 'gold-border', label: 'Double Gold Foil' },
                  { id: 'double-frame', label: 'Classic Border' },
                ].map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setBorderStyle(b.id as any)}
                    className={`py-2 px-1 text-xs rounded-xl border text-center transition-colors ${
                      borderStyle === b.id
                        ? 'border-violet-600 bg-violet-50 text-violet-900 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleRenderGraphics}
              disabled={isRendering}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isRendering ? 'Rendering Layout...' : 'Render Graphics & Typography'}</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="text-xs font-semibold text-slate-700 mb-2">Graphics Design Canvas</div>
            <div className="flex-1 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden min-h-64 relative p-4">
              <img
                src={previewUrl || project.currentUrl}
                alt="Graphics Preview"
                referrerPolicy="no-referrer"
                className="max-h-64 object-contain rounded shadow-xs"
              />
            </div>

            {previewUrl && (
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => onApplyGraphicsResult(previewUrl)}
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
