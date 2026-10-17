import React, { useState } from 'react';
import { FileImage, Download, Check, Sparkles, Grid } from 'lucide-react';
import { ExportFormat, Project } from '../../types';
import { loadImage, downloadProcessedImage } from '../../utils/imageEngine';

interface PngConverterViewProps {
  project: Project;
}

export const PngConverterView: React.FC<PngConverterViewProps> = ({ project }) => {
  const [targetFormat, setTargetFormat] = useState<ExportFormat>('png');
  const [preserveAlpha, setPreserveAlpha] = useState(true);
  const [bitDepth, setBitDepth] = useState<'32' | '24'>('32');
  const [isExporting, setIsExporting] = useState(false);

  const handleConvertAndDownload = async () => {
    setIsExporting(true);
    try {
      const img = await loadImage(project.currentUrl);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (!preserveAlpha || targetFormat === 'jpg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);
      await downloadProcessedImage(canvas, project.name, targetFormat, 'maximum');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileImage className="w-5 h-5 text-violet-600" />
            <span>PNG Converter & Transparency Suite</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Convert any image into transparent 32-bit RGBA PNG, high-efficiency WebP, JPG, or uncompressed master TIFF files.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                Output Format
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['png', 'webp', 'jpg', 'tiff'] as ExportFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setTargetFormat(fmt)}
                    className={`py-2 px-1 text-xs uppercase font-bold rounded-xl border text-center transition-colors ${
                      targetFormat === fmt
                        ? 'border-violet-600 bg-violet-50 text-violet-900'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            {targetFormat === 'png' && (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">
                  PNG Bit Depth & Channel
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setBitDepth('32');
                      setPreserveAlpha(true);
                    }}
                    className={`p-3 text-xs rounded-xl border text-left transition-colors ${
                      bitDepth === '32'
                        ? 'border-violet-600 bg-violet-50 text-violet-900 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold">PNG-32 (RGBA Alpha)</div>
                    <div className="text-[10px] text-slate-500">Supports full transparency</div>
                  </button>
                  <button
                    onClick={() => {
                      setBitDepth('24');
                      setPreserveAlpha(false);
                    }}
                    className={`p-3 text-xs rounded-xl border text-left transition-colors ${
                      bitDepth === '24'
                        ? 'border-violet-600 bg-violet-50 text-violet-900 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold">PNG-24 (True Color)</div>
                    <div className="text-[10px] text-slate-500">Solid background flattening</div>
                  </button>
                </div>
              </div>
            )}

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Color Space:</span>
                <span className="font-mono font-semibold text-slate-800">sRGB IEC61966-2.1</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Native Resolution:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {project.width} × {project.height} px
                </span>
              </div>
            </div>

            <button
              onClick={handleConvertAndDownload}
              disabled={isExporting}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Encoding File...' : `Export as ${targetFormat.toUpperCase()}`}</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="text-xs font-semibold text-slate-700 mb-2">Transparency Checkerboard</div>
            <div className="flex-1 rounded-xl bg-checkerboard border border-slate-200 flex items-center justify-center overflow-hidden min-h-64 relative p-4">
              <img
                src={project.currentUrl}
                alt="Source"
                referrerPolicy="no-referrer"
                className="max-h-64 object-contain rounded"
              />
            </div>
            <div className="mt-3 text-center text-xs text-slate-500">
              The checkerboard pattern indicates transparent alpha pixels.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
