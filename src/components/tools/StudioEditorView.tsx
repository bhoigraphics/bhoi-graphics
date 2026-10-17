import React, { useState } from 'react';
import { Sliders, RotateCw, RotateCcw, FlipHorizontal, FlipVertical, Crop, Check } from 'lucide-react';
import { Project } from '../../types';
import { loadImage } from '../../utils/imageEngine';

interface StudioEditorViewProps {
  project: Project;
  onApplyStudioTransform: (newUrl: string) => void;
}

export const StudioEditorView: React.FC<StudioEditorViewProps> = ({
  project,
  onApplyStudioTransform,
}) => {
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [aspectRatioCrop, setAspectRatioCrop] = useState<'free' | '1:1' | '4:5' | '16:9'>('free');
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyTransform = async () => {
    setIsApplying(true);
    try {
      const img = await loadImage(project.currentUrl);
      const canvas = document.createElement('canvas');

      const isQuarterTurn = rotation % 180 !== 0;
      canvas.width = isQuarterTurn ? img.naturalHeight : img.naturalWidth;
      canvas.height = isQuarterTurn ? img.naturalWidth : img.naturalHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      ctx.restore();

      onApplyStudioTransform(canvas.toDataURL('image/png'));
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-violet-600" />
            <span>Image Editing Studio</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Perform lossless image rotation, horizontal/vertical reflection mirroring, and compositional canvas alignment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                Rotation & Orientation
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Rotate 90° CCW</span>
                </button>
                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Rotate 90° CW</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                Mirror Reflection
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFlipH(!flipH)}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                    flipH
                      ? 'border-violet-600 bg-violet-50 text-violet-900'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                  <span>Flip Horizontal</span>
                </button>
                <button
                  onClick={() => setFlipV(!flipV)}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                    flipV
                      ? 'border-violet-600 bg-violet-50 text-violet-900'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <FlipVertical className="w-3.5 h-3.5" />
                  <span>Flip Vertical</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                Aspect Ratio Framing
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['free', '1:1', '4:5', '16:9'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatioCrop(ratio)}
                    className={`py-1.5 text-xs font-semibold rounded-lg border text-center transition-colors ${
                      aspectRatioCrop === ratio
                        ? 'border-violet-600 bg-violet-50 text-violet-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {ratio === 'free' ? 'Original' : ratio}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleApplyTransform}
              disabled={isApplying}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Apply Studio Transforms</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="text-xs font-semibold text-slate-700 mb-2">Transform Preview</div>
            <div className="flex-1 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden min-h-64 relative p-4">
              <img
                src={project.currentUrl}
                alt="Source"
                referrerPolicy="no-referrer"
                style={{
                  transform: `rotate(${rotation}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`,
                  transition: 'transform 0.2s ease-out',
                }}
                className="max-h-64 object-contain rounded"
              />
            </div>
            <div className="mt-3 text-center text-xs text-slate-500 font-mono">
              Orientation: {rotation}° · Mirrored: {flipH ? 'H' : ''} {flipV ? 'V' : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
