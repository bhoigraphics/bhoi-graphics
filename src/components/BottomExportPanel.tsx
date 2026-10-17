import React, { useState } from 'react';
import {
  Download,
  RotateCw,
  FolderArchive,
  Layers,
  Sparkles,
  Info,
  Check,
  ChevronUp,
  AlertTriangle,
} from 'lucide-react';
import { ExportBackground, ExportFormat, ExportScale, Project } from '../types';
import { calculateExportStats } from '../utils/imageEngine';

interface BottomExportPanelProps {
  project: Project;
  onScaleChange: (scale: ExportScale) => void;
  onFormatChange: (format: ExportFormat) => void;
  onQualityChange: (quality: string) => void;
  onBackgroundChange: (bg: ExportBackground, customColor?: string) => void;
  onDpiChange: (dpi: number) => void;
  onReEnhance: () => void;
  onDownloadNow: () => void;
  onBatchDownload: () => void;
  isProcessing: boolean;
}

export const BottomExportPanel: React.FC<BottomExportPanelProps> = ({
  project,
  onScaleChange,
  onFormatChange,
  onQualityChange,
  onBackgroundChange,
  onDpiChange,
  onReEnhance,
  onDownloadNow,
  onBatchDownload,
  isProcessing,
}) => {
  const [showConfirmTransparent, setShowConfirmTransparent] = useState(false);
  const [customColor, setCustomColor] = useState(project.customBgColor || '#FFFFFF');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const stats = calculateExportStats(
    project.width,
    project.height,
    project.exportScale,
    project.exportFormat,
    project.quality,
    project.dpi
  );

  const handleBgSelect = (val: ExportBackground) => {
    if (val === 'transparent' && project.mode === 'mode-a') {
      setShowConfirmTransparent(true);
    } else {
      onBackgroundChange(val, customColor);
    }
  };

  const confirmTransparentRemoval = () => {
    setShowConfirmTransparent(false);
    onBackgroundChange('transparent');
  };

  return (
    <div className="bg-white border-t border-slate-200 px-4 py-3 select-none shrink-0 z-30 shadow-lg">
      {/* Confirmation Modal for Transparent Background */}
      {showConfirmTransparent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Confirm Background Cutout</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
              You selected <strong>Transparent Background</strong>. This will switch from Mode A (Preserve Original Background) to Mode B (Alpha Cutout). Are you sure you want to isolate the foreground subject?
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowConfirmTransparent(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Keep Original Background
              </button>
              <button
                onClick={confirmTransparentRemoval}
                className="px-4 py-1.5 text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-lg shadow-xs transition-colors"
              >
                Yes, Remove Background
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Left Area: Scaling, Format, DPI */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Resolution Scale Buttons */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline mr-1">
              Scale:
            </span>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              {([0.5, 1, 2, 4, 8] as ExportScale[]).map((scale) => (
                <button
                  key={scale}
                  onClick={() => onScaleChange(scale)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                    project.exportScale === scale
                      ? 'bg-white text-violet-700 shadow-xs ring-1 ring-violet-200 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {scale}× {scale === 2 ? 'FHD' : scale === 4 ? '4K' : scale === 8 ? '8K' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Export Format Selector */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline mr-1">
              Format:
            </span>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              {(['png', 'jpg', 'webp', 'tiff'] as ExportFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => onFormatChange(fmt)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg uppercase transition-all ${
                    project.exportFormat === fmt
                      ? 'bg-white text-violet-700 shadow-xs ring-1 ring-violet-200 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Background Handling Dropdown */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline mr-1">
              Background:
            </span>
            <select
              value={project.exportBackground}
              onChange={(e) => handleBgSelect(e.target.value as ExportBackground)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-violet-500"
            >
              <option value="preserve">Preserve Original Background</option>
              <option value="remove-white">100% Remove White Background (Pure Transparent)</option>
              <option value="transparent">Transparent Background (Alpha PNG)</option>
              <option value="white">White Background</option>
              <option value="custom">Custom Solid Color</option>
            </select>

            {project.exportBackground === 'custom' && (
              <div className="flex items-center gap-1 ml-1">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => {
                    setCustomColor(e.target.value);
                    onBackgroundChange('custom', e.target.value);
                  }}
                  className="w-6 h-6 rounded border border-slate-300 cursor-pointer p-0"
                />
              </div>
            )}
          </div>

          {/* DPI Print Setting */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden md:inline mr-1">
              DPI:
            </span>
            <select
              value={project.dpi}
              onChange={(e) => onDpiChange(parseInt(e.target.value))}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2 py-1.5 focus:outline-hidden"
            >
              <option value="72">72 DPI (Web)</option>
              <option value="150">150 DPI (Draft)</option>
              <option value="300">300 DPI (Print Pro)</option>
              <option value="600">600 DPI (Archival)</option>
            </select>
          </div>
        </div>

        {/* Center/Right Area: Live Metadata & CTAs */}
        <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0">
          {/* Metadata Display Chips */}
          <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <div className="flex items-center gap-1 text-slate-900 font-bold">
              <span>{stats.finalW}</span> × <span>{stats.finalH}</span> px
            </div>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500">{stats.formattedSize}</span>
            <span className="text-slate-300 hidden xl:inline">·</span>
            <span className="text-slate-500 hidden xl:inline">
              {stats.printWidthInches}" × {stats.printHeightInches}" ({stats.printWidthCm} × {stats.printHeightCm} cm)
            </span>
          </div>

          {/* Re-Enhance Button */}
          <button
            onClick={onReEnhance}
            disabled={isProcessing}
            title="Re-run AI enhancement pass"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Re-Enhance</span>
          </button>

          {/* Batch Download Button */}
          <button
            onClick={onBatchDownload}
            title="Download all project files"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
          >
            <FolderArchive className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">Batch</span>
          </button>

          {/* Download Now Primary Button */}
          <button
            onClick={onDownloadNow}
            disabled={isProcessing}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>Download Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
