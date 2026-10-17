import React, { useState } from 'react';
import { Wand2, Sparkles, Image, Check, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';

interface ImageGeneratorViewProps {
  onUseGeneratedImage: (imgUrl: string, name: string) => void;
}

export const ImageGeneratorView: React.FC<ImageGeneratorViewProps> = ({ onUseGeneratedImage }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3' | '3:4'>('1:1');
  const [stylePreset, setStylePreset] = useState('Photorealistic Studio');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const presets = [
    { name: 'Photorealistic Studio', promptSuffix: ', professional studio lighting, 85mm lens f/1.8, high detail' },
    { name: 'Luxury Wedding', promptSuffix: ', romantic warm glow, fine lace embroidery, soft bokeh, delicate florals' },
    { name: 'Vintage 1940s Film', promptSuffix: ', authentic monochrome sepia photo, film grain texture, vintage family archive' },
    { name: 'Commercial Product', promptSuffix: ', clean minimalist product photography on stone pedestal, rim lighting, 8k resolution' },
    { name: 'Botanical Floral Frame', promptSuffix: ', luxury watercolor wedding border, gold foil accents, crisp white background' },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setErrorMessage(null);

    const fullPrompt = `${prompt.trim()}${
      presets.find((p) => p.name === stylePreset)?.promptSuffix || ''
    }`;

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt, aspectRatio }),
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        setGeneratedResult(data.imageUrl);
      } else {
        setErrorMessage(data.error || 'Failed to generate image. Please check API configuration.');
      }
    } catch (e: any) {
      setErrorMessage(e?.message || 'Network error during image generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-violet-600" />
            <span>AI Image Generator</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Generate photorealistic assets or illustrations using Gemini neural image models, then import directly into AI Photo Enhance Pro.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Image Prompt
              </label>
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your desired image (e.g. 'A breathtaking studio portrait of an elegant woman with delicate bridal lace veil and soft warm natural lighting')..."
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:bg-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            </div>

            {/* Style Presets */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Style Preset
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {presets.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => setStylePreset(p.name)}
                    className={`text-left text-xs p-2 rounded-lg border transition-colors ${
                      stylePreset === p.name
                        ? 'bg-violet-50 text-violet-800 border-violet-300 font-semibold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-5 gap-1 bg-slate-100 p-1 rounded-xl">
                {(['1:1', '16:9', '9:16', '4:3', '3:4'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      aspectRatio === ratio
                        ? 'bg-white text-violet-700 shadow-xs ring-1 ring-violet-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all ${
                isGenerating || !prompt.trim()
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Generating Image...' : 'Generate AI Image'}</span>
            </button>
          </div>

          {/* Preview Result */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="text-xs font-semibold text-slate-700 mb-2">Generated Output</div>
            <div className="flex-1 bg-slate-100 rounded-xl border border-dashed border-slate-300 flex items-center justify-center overflow-hidden min-h-64 relative">
              {isGenerating ? (
                <div className="text-center p-6">
                  <div className="w-10 h-10 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <span className="text-xs font-semibold text-slate-700">Synthesizing image with Gemini AI...</span>
                </div>
              ) : generatedResult ? (
                <img
                  src={generatedResult}
                  alt="Generated"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center p-6 text-slate-400">
                  <Image className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <span className="text-xs">Your generated asset will appear here</span>
                </div>
              )}
            </div>

            {generatedResult && (
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => onUseGeneratedImage(generatedResult, prompt.slice(0, 24) || 'AI Generated')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <span>Edit in Photo Enhance Pro</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
