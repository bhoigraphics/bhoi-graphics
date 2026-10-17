import React, { useState } from 'react';
import {
  Sliders,
  RotateCcw,
  Sparkles,
  Layers,
  User,
  Wand2,
  ChevronDown,
  ChevronUp,
  Sun,
  Zap,
  Droplet,
  Compass,
  Focus,
  Eye,
  Shapes,
  Palette,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { EnhanceQuality, EnhanceSettings, TargetDomain } from '../types';
import { DEFAULT_SETTINGS, PRESET_RECIPES } from '../utils/imageEngine';

interface EnhanceSettingsPanelProps {
  settings: EnhanceSettings;
  onUpdateSettings: (newSettings: EnhanceSettings) => void;
  targetDomain: TargetDomain;
  onUpdateDomain: (domain: TargetDomain) => void;
  quality: EnhanceQuality;
  onUpdateQuality: (q: EnhanceQuality) => void;
  onApplyEnhancement: () => void;
  isProcessing: boolean;
  onReset: () => void;
}

export const EnhanceSettingsPanel: React.FC<EnhanceSettingsPanelProps> = ({
  settings,
  onUpdateSettings,
  targetDomain,
  onUpdateDomain,
  quality,
  onUpdateQuality,
  onApplyEnhancement,
  isProcessing,
  onReset,
}) => {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    quickActions: false,
    pngShape: false,
    bokeh: false,
    deblur: false,
    portrait: false,
    tone: false,
    color: false,
  });

  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key: keyof EnhanceSettings, value: number) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  const handleApplyPreset = (presetKey: string) => {
    const recipe = PRESET_RECIPES[presetKey];
    if (recipe) {
      onUpdateSettings({
        ...DEFAULT_SETTINGS,
        ...recipe,
      });
    }
  };

  return (
    <aside className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0 select-none z-20 shadow-xs">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 tracking-tight">Enhancement Controls</h2>
            <p className="text-[11px] text-slate-400">Live AI & Filter Calibration</p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 transition-colors px-2 py-1 rounded hover:bg-slate-100"
          title="Reset sliders to defaults"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Domain Selector (Portrait vs Graphics/Floral vs PNG Shape vs General) */}
        <div>
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
            Target Type
          </label>
          <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl text-center">
            <button
              onClick={() => onUpdateDomain('png-shape')}
              className={`flex flex-col items-center py-2 px-1 rounded-lg text-[11px] font-semibold transition-all ${
                targetDomain === 'png-shape'
                  ? 'bg-white text-violet-700 shadow-xs ring-1 ring-violet-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shapes className="w-3.5 h-3.5 mb-1 text-violet-600" />
              <span>PNG Shape</span>
            </button>

            <button
              onClick={() => onUpdateDomain('portrait')}
              className={`flex flex-col items-center py-2 px-1 rounded-lg text-[11px] font-semibold transition-all ${
                targetDomain === 'portrait'
                  ? 'bg-white text-violet-700 shadow-xs ring-1 ring-violet-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5 mb-1" />
              <span>Portrait</span>
            </button>

            <button
              onClick={() => onUpdateDomain('graphics')}
              className={`flex flex-col items-center py-2 px-1 rounded-lg text-[11px] font-semibold transition-all ${
                targetDomain === 'graphics'
                  ? 'bg-white text-violet-700 shadow-xs ring-1 ring-violet-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 mb-1" />
              <span>Graphics</span>
            </button>

            <button
              onClick={() => onUpdateDomain('general')}
              className={`flex flex-col items-center py-2 px-1 rounded-lg text-[11px] font-semibold transition-all ${
                targetDomain === 'general'
                  ? 'bg-white text-violet-700 shadow-xs ring-1 ring-violet-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5 mb-1" />
              <span>General</span>
            </button>
          </div>
          {targetDomain === 'png-shape' && (
            <p className="text-[10px] text-violet-700 font-medium mt-1.5 leading-tight bg-violet-50 p-2 rounded-lg border border-violet-100">
              <strong>PNG Shape Mode Active:</strong> Sharpens transparent edges, smooths vector contours, and eliminates pixelated staircases.
            </p>
          )}
        </div>

        {/* 1-CLICK PRO AI ENHANCERS (Highlighted for user request) */}
        <div className="bg-gradient-to-br from-violet-50 via-indigo-50/50 to-purple-50 p-3 rounded-xl border border-violet-200">
          <div className="flex items-center gap-1.5 text-xs font-bold text-violet-900 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            <span>1-Click AI Instant Enhancers</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {/* Flagship Preset directly answering user request */}
            <button
              onClick={() => {
                onUpdateDomain('png-shape');
                handleApplyPreset('fullHdCleanShapeNoBlue');
              }}
              className="col-span-2 text-left p-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 rounded-xl transition-all group shadow-sm ring-1 ring-violet-400"
            >
              <div className="text-xs font-bold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Full HD Shape (No Blue Line + 100% White BG Cut + 100% Denoise)</span>
                </span>
                <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded font-bold">FULL HD</span>
              </div>
              <div className="text-[10px] text-violet-100 mt-1 leading-tight">
                Without blue line proper drawing, 100% noise reduce, 100% white background remove karke full HD quality.
              </div>
            </button>

            <button
              onClick={() => {
                onUpdateDomain('png-shape');
                handleApplyPreset('cleanLineArtWhiteBg');
              }}
              className="col-span-2 text-left p-2 bg-white hover:bg-violet-100/70 border border-violet-300 rounded-xl transition-colors group shadow-2xs"
            >
              <div className="text-xs font-bold text-violet-900 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Shapes className="w-3.5 h-3.5 text-violet-600" />
                  <span>Clean Line Art (Pure Black Lines + Transparent BG)</span>
                </span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">100% PRO</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Draws genuine crisp lines without blue tint & removes white paper background.
              </div>
            </button>

            <button
              onClick={() => {
                onUpdateDomain('png-shape');
                handleApplyPreset('pngShapeHD');
              }}
              className="text-left p-2 bg-white hover:bg-violet-100/70 border border-violet-200 rounded-lg transition-colors group shadow-2xs"
            >
              <div className="text-[11px] font-bold text-violet-900 flex items-center gap-1">
                <Shapes className="w-3 h-3 text-violet-600" />
                <span>PNG Shape to HD</span>
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">Vector-crisp edges</div>
            </button>

            <button
              onClick={() => handleApplyPreset('deblurPhotoHD')}
              className="text-left p-2 bg-white hover:bg-violet-100/70 border border-violet-200 rounded-lg transition-colors group shadow-2xs"
            >
              <div className="text-[11px] font-bold text-indigo-900 flex items-center gap-1">
                <Focus className="w-3 h-3 text-indigo-600" />
                <span>Blur Photo to HD</span>
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">Focus & deblur fix</div>
            </button>

            <button
              onClick={() => handleApplyPreset('backgroundBlurBokeh')}
              className="text-left p-2 bg-white hover:bg-violet-100/70 border border-violet-200 rounded-lg transition-colors group shadow-2xs"
            >
              <div className="text-[11px] font-bold text-purple-900 flex items-center gap-1">
                <Eye className="w-3 h-3 text-purple-600" />
                <span>Blur Background</span>
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">DSLR Bokeh effect</div>
            </button>

            <button
              onClick={() => handleApplyPreset('hdrColorPop')}
              className="text-left p-2 bg-white hover:bg-violet-100/70 border border-violet-200 rounded-lg transition-colors group shadow-2xs"
            >
              <div className="text-[11px] font-bold text-pink-900 flex items-center gap-1">
                <Palette className="w-3 h-3 text-pink-600" />
                <span>Enhance Colour</span>
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">Vibrant HDR pop</div>
            </button>
          </div>

          {/* Dedicated Toggles for Blue Line Protection, White Background Cutout & 100% Denoise */}
          <div className="mt-3 pt-2.5 border-t border-violet-200/60 space-y-2.5">
            {/* No Blue Lines Toggle */}
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-800 block leading-tight">Without Blue Line (Defringe)</span>
                <span className="text-[10px] text-slate-500">Draws pure crisp original lines without blue tint</span>
              </div>
              <button
                onClick={() => onUpdateSettings({ ...settings, removeBlueFringe: !settings.removeBlueFringe })}
                className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${
                  settings.removeBlueFringe ? 'bg-violet-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                    settings.removeBlueFringe ? 'left-4.5' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* 100% White Background Removal Toggle */}
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-800 block leading-tight">100% Remove White Background</span>
                <span className="text-[10px] text-slate-500">Pure transparent PNG (no white residue)</span>
              </div>
              <button
                onClick={() => onUpdateSettings({ ...settings, removeWhiteBg: !settings.removeWhiteBg })}
                className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${
                  settings.removeWhiteBg ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                    settings.removeWhiteBg ? 'left-4.5' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* 100% Noise Reduction Toggle */}
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-800 block leading-tight">100% Noise & Artifact Reduction</span>
                <span className="text-[10px] text-slate-500">Median + bilateral grain elimination</span>
              </div>
              <button
                onClick={() =>
                  onUpdateSettings({
                    ...settings,
                    noiseReduction: settings.noiseReduction === 100 ? 0 : 100,
                  })
                }
                className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${
                  settings.noiseReduction === 100 ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                    settings.noiseReduction === 100 ? 'left-4.5' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Quality Selector */}
        <div>
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
            Enhancement Engine Quality
          </label>
          <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl">
            {(['low', 'medium', 'high', 'maximum'] as EnhanceQuality[]).map((q) => (
              <button
                key={q}
                onClick={() => onUpdateQuality(q)}
                className={`py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                  quality === q
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* SECTION: PNG Shape to HD & Edge Crisper */}
        <div className="border border-violet-200 bg-violet-50/30 rounded-xl p-3 space-y-3">
          <div
            onClick={() => toggleSection('pngShape')}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-violet-900">
              <Shapes className="w-3.5 h-3.5 text-violet-600" />
              <span>PNG Shape to HD & Anti-Aliasing</span>
            </div>
            {collapsedSections.pngShape ? (
              <ChevronDown className="w-3.5 h-3.5 text-violet-400" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5 text-violet-400" />
            )}
          </div>

          {!collapsedSections.pngShape && (
            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700 font-medium">Shape Edge Crispness</span>
                  <span className="font-mono tabular-nums text-violet-700 font-bold">
                    {settings.shapeEdgeCrisp}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.shapeEdgeCrisp}
                  onChange={(e) => handleChange('shapeEdgeCrisp', parseInt(e.target.value))}
                  className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block leading-tight">
                  Smooths pixelated staircases and sharpens transparent PNG alpha silhouettes.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* SECTION: DSLR Background Blur / Bokeh */}
        <div className="border border-slate-200 rounded-xl p-3 space-y-3">
          <div
            onClick={() => toggleSection('bokeh')}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Eye className="w-3.5 h-3.5 text-purple-600" />
              <span>Blur Background (DSLR Bokeh)</span>
            </div>
            {collapsedSections.bokeh ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            )}
          </div>

          {!collapsedSections.bokeh && (
            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700 font-medium">Background Blur Intensity</span>
                  <span className="font-mono tabular-nums text-purple-700 font-bold">
                    {settings.backgroundBlur}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.backgroundBlur}
                  onChange={(e) => handleChange('backgroundBlur', parseInt(e.target.value))}
                  className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block leading-tight">
                  Blurs background surroundings while preserving the central subject in sharp focus.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* SECTION: Blur Photo ko HD me convert (Focus Deblur) */}
        <div className="border border-slate-200 rounded-xl p-3 space-y-3">
          <div
            onClick={() => toggleSection('deblur')}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Focus className="w-3.5 h-3.5 text-indigo-600" />
              <span>Blur Photo to HD (Focus Deblur)</span>
            </div>
            {collapsedSections.deblur ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            )}
          </div>

          {!collapsedSections.deblur && (
            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700 font-medium">Deblur & Motion Recovery</span>
                  <span className="font-mono tabular-nums text-indigo-700 font-bold">
                    {settings.deblurAmount}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.deblurAmount}
                  onChange={(e) => handleChange('deblurAmount', parseInt(e.target.value))}
                  className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block leading-tight">
                  High-frequency laplacian deblur to restore lost sharpness from blurry/out-of-focus photos.
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700 font-medium">Sharpness</span>
                  <span className="font-mono tabular-nums text-slate-500">{settings.sharpness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.sharpness}
                  onChange={(e) => handleChange('sharpness', parseInt(e.target.value))}
                  className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700 font-medium">Detail Enhancement</span>
                  <span className="font-mono tabular-nums text-slate-500">{settings.detailEnhancement}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.detailEnhancement}
                  onChange={(e) => handleChange('detailEnhancement', parseInt(e.target.value))}
                  className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-700 font-medium">Noise Reduction</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleChange('noiseReduction', 100)}
                      className="text-[10px] bg-slate-100 hover:bg-violet-100 text-violet-700 font-bold px-1.5 py-0.5 rounded transition-colors"
                      title="Set 100% clean noise removal"
                    >
                      100% Clean
                    </button>
                    <span className="font-mono tabular-nums text-slate-700 font-bold">
                      {settings.noiseReduction === 100 ? '100% (Clean)' : `${settings.noiseReduction}%`}
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.noiseReduction}
                  onChange={(e) => handleChange('noiseReduction', parseInt(e.target.value))}
                  className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block leading-tight">
                  Wipes out speckled noise, grain, and JPEG artifacts while preserving clean drawn lines.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* SECTION: Enhance Colour & HDR */}
        <div className="border border-slate-200 rounded-xl p-3 space-y-3">
          <div
            onClick={() => toggleSection('color')}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Droplet className="w-3.5 h-3.5 text-pink-500" />
              <span>Enhance Colour & HDR Pop</span>
            </div>
            {collapsedSections.color ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            )}
          </div>

          {!collapsedSections.color && (
            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700 font-medium">HDR Colour Boost</span>
                  <span className="font-mono tabular-nums text-pink-700 font-bold">
                    {settings.hdrColorBoost}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.hdrColorBoost}
                  onChange={(e) => handleChange('hdrColorBoost', parseInt(e.target.value))}
                  className="w-full accent-pink-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700 font-medium">Saturation & Vibrance</span>
                  <span className="font-mono tabular-nums text-slate-500">
                    {settings.saturation > 0 ? `+${settings.saturation}` : settings.saturation}%
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={settings.saturation}
                  onChange={(e) => handleChange('saturation', parseInt(e.target.value))}
                  className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700 font-medium">White Balance</span>
                  <span className="font-mono tabular-nums text-slate-500">
                    {settings.whiteBalance > 0
                      ? `+${settings.whiteBalance} (Warm)`
                      : settings.whiteBalance < 0
                      ? `${settings.whiteBalance} (Cool)`
                      : '0'}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={settings.whiteBalance}
                  onChange={(e) => handleChange('whiteBalance', parseInt(e.target.value))}
                  className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700 font-medium">Colour Correction</span>
                  <span className="font-mono tabular-nums text-slate-500">{settings.colorCorrection}%</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={settings.colorCorrection}
                  onChange={(e) => handleChange('colorCorrection', parseInt(e.target.value))}
                  className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* SECTION: Exposure & Tone */}
        <div className="border border-slate-200 rounded-xl p-3 space-y-3">
          <div
            onClick={() => toggleSection('tone')}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Exposure, Contrast & Shadows</span>
            </div>
            {collapsedSections.tone ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            )}
          </div>

          {!collapsedSections.tone && (
            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700 font-medium">Brightness</span>
                  <span className="font-mono tabular-nums text-slate-500">
                    {settings.brightness > 0 ? `+${settings.brightness}` : settings.brightness}%
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={settings.brightness}
                  onChange={(e) => handleChange('brightness', parseInt(e.target.value))}
                  className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700 font-medium">Contrast</span>
                  <span className="font-mono tabular-nums text-slate-500">
                    {settings.contrast > 0 ? `+${settings.contrast}` : settings.contrast}%
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={settings.contrast}
                  onChange={(e) => handleChange('contrast', parseInt(e.target.value))}
                  className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700 font-medium">Shadow Recovery</span>
                  <span className="font-mono tabular-nums text-slate-500">{settings.shadowRecovery}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.shadowRecovery}
                  onChange={(e) => handleChange('shadowRecovery', parseInt(e.target.value))}
                  className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700 font-medium">Highlight Recovery</span>
                  <span className="font-mono tabular-nums text-slate-500">{settings.highlightRecovery}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.highlightRecovery}
                  onChange={(e) => handleChange('highlightRecovery', parseInt(e.target.value))}
                  className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* SECTION: Portrait Retouching */}
        {targetDomain === 'portrait' && (
          <div className="border border-violet-100 bg-violet-50/40 rounded-xl p-3 space-y-3">
            <div
              onClick={() => toggleSection('portrait')}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-violet-900">
                <User className="w-3.5 h-3.5 text-violet-600" />
                <span>Portrait Specific Retouch</span>
              </div>
              {collapsedSections.portrait ? (
                <ChevronDown className="w-3.5 h-3.5 text-violet-400" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5 text-violet-400" />
              )}
            </div>

            {!collapsedSections.portrait && (
              <div className="space-y-3 pt-1">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-700 font-medium">Skin Smoothing</span>
                    <span className="font-mono tabular-nums text-slate-500">{settings.skinSmoothing}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.skinSmoothing}
                    onChange={(e) => handleChange('skinSmoothing', parseInt(e.target.value))}
                    className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-700 font-medium">Blemish & Spot Reduction</span>
                    <span className="font-mono tabular-nums text-slate-500">{settings.blemishReduction}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.blemishReduction}
                    onChange={(e) => handleChange('blemishReduction', parseInt(e.target.value))}
                    className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <button
          onClick={onApplyEnhancement}
          disabled={isProcessing}
          className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all ${
            isProcessing
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-violet-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{isProcessing ? 'Processing Neural Model...' : 'Apply AI Enhancement'}</span>
        </button>
      </div>
    </aside>
  );
};
