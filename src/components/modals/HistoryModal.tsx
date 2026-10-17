import React from 'react';
import { Clock, RotateCcw, X, Check, ShieldCheck } from 'lucide-react';
import { Project } from '../../types';

interface HistoryModalProps {
  project: Project;
  onRestoreStep: (stepIndex: number) => void;
  onRestoreOriginal: () => void;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  project,
  onRestoreStep,
  onRestoreOriginal,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-violet-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Editing History & Snapshots</h3>
              <p className="text-[11px] text-slate-500">Track and jump between enhancement states</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-2">
          {/* Restore Original Card */}
          <div className="p-3 bg-violet-50/60 border border-violet-200 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-violet-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Original Master File</span>
              </div>
              <div className="text-[11px] text-violet-700">
                Created: {new Date(project.createdAt).toLocaleTimeString()}
              </div>
            </div>
            <button
              onClick={() => {
                onRestoreOriginal();
                onClose();
              }}
              className="px-3 py-1.5 bg-white border border-violet-300 text-violet-700 hover:bg-violet-100 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
            >
              Restore Original
            </button>
          </div>

          {/* History Steps */}
          {project.history.map((step, idx) => {
            const isCurrent = idx === project.historyIndex;
            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                  isCurrent
                    ? 'border-violet-600 bg-violet-50/30 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="text-xs text-slate-900 font-semibold flex items-center gap-1.5">
                    {isCurrent && <Check className="w-3.5 h-3.5 text-violet-600" />}
                    <span>{step.title}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {new Date(step.timestamp).toLocaleTimeString()} · Mode:{' '}
                    {step.mode === 'mode-a' ? 'Original BG' : 'Transparent Cutout'}
                  </div>
                </div>

                {!isCurrent && (
                  <button
                    onClick={() => {
                      onRestoreStep(idx);
                      onClose();
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Jump</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
