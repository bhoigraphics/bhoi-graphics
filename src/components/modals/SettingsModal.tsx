import React, { useState } from 'react';
import { Settings, X, Check, ShieldCheck, Cpu } from 'lucide-react';
import { ExportFormat } from '../../types';

interface SettingsModalProps {
  defaultFormat: ExportFormat;
  onUpdateDefaultFormat: (fmt: ExportFormat) => void;
  defaultDpi: number;
  onUpdateDefaultDpi: (dpi: number) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  defaultFormat,
  onUpdateDefaultFormat,
  defaultDpi,
  onUpdateDefaultDpi,
  onClose,
}) => {
  const [useHardwareAcc, setUseHardwareAcc] = useState(true);
  const [autoDenoise, setAutoDenoise] = useState(true);

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-violet-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Studio Preferences</h3>
              <p className="text-[11px] text-slate-500">Configure engine defaults and export specs</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs">
          {/* Default Export Format */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1.5">
              Default Export Format
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['png', 'jpg', 'webp', 'tiff'] as ExportFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => onUpdateDefaultFormat(fmt)}
                  className={`py-2 px-1 rounded-xl border uppercase font-bold text-center transition-colors ${
                    defaultFormat === fmt
                      ? 'border-violet-600 bg-violet-50 text-violet-900'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Default DPI */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1.5">
              Default Print DPI
            </label>
            <select
              value={defaultDpi}
              onChange={(e) => onUpdateDefaultDpi(parseInt(e.target.value))}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
            >
              <option value="72">72 DPI (Standard Web Display)</option>
              <option value="150">150 DPI (Draft Proofing)</option>
              <option value="300">300 DPI (Commercial Photographic Print)</option>
              <option value="600">600 DPI (Fine Art Archival)</option>
            </select>
          </div>

          {/* Hardware Acceleration */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-violet-600" />
              <div>
                <span className="font-semibold text-slate-800 block">GPU Shader Acceleration</span>
                <span className="text-[11px] text-slate-500">Accelerates convolution & upscaling</span>
              </div>
            </div>
            <button
              onClick={() => setUseHardwareAcc(!useHardwareAcc)}
              className={`w-10 h-5 rounded-full transition-colors relative ${
                useHardwareAcc ? 'bg-violet-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                  useHardwareAcc ? 'left-5.5' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Background Preservation Guarantee */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-emerald-800 leading-relaxed">
              <strong>Strict Background Preservation:</strong> PixorAI adheres to Mode A by default. Original backgrounds, composition, floral borders, and invitation margins will never be degraded or made transparent unless you explicitly toggle Mode B.
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
