import React, { useState } from 'react';
import {
  X,
  Rocket,
  CheckCircle2,
  Copy,
  Check,
  Zap,
  Globe,
  ShieldCheck,
  Server,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface VercelDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VercelDeployModal: React.FC<VercelDeployModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-violet-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-violet-300">
              <Rocket className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                Deploy to Vercel (100% Full Working Speed)
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ready
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Apni website ko Vercel par 2 minute me live karein with blazing fast CDN speed.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-xs">
          {/* Speed Status Banner */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
            <Zap className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-emerald-950 text-sm">
                Full Working Speed Configuration Pre-Installed!
              </div>
              <p className="text-emerald-800 leading-relaxed">
                Aapki application me <strong>vercel.json</strong>, <strong>api/index.ts</strong>, <strong>SPA rewrites</strong>, aur <strong>immutable caching headers</strong> already configure ho chuke hain. Vercel par deploy hone ke baad images instantly process hongi without any lag.
              </p>
            </div>
          </div>

          {/* Step by Step Guide */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Vercel Deployment Steps (Step-by-Step)
            </h3>

            <div className="space-y-2.5">
              {/* Step 1 */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </div>
                <div className="flex-1 space-y-1">
                  <div className="font-bold text-slate-900">GitHub Repository Create & Push Karein</div>
                  <p className="text-slate-600">
                    Is project ke code ko apne GitHub account par push karein (e.g. <code>git push origin main</code>).
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </div>
                <div className="flex-1 space-y-1">
                  <div className="font-bold text-slate-900">Vercel Dashboard par Import Karein</div>
                  <p className="text-slate-600">
                    <a
                      href="https://vercel.com/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-600 underline font-semibold inline-flex items-center gap-1"
                    >
                      vercel.com/new <ExternalLink className="w-3 h-3" />
                    </a>{' '}
                    par jakar apna GitHub repo select karke <strong>Import</strong> button dabayein.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </div>
                <div className="flex-1 space-y-2">
                  <div className="font-bold text-slate-900">Build & Output Settings (Auto-Detected)</div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 bg-white border border-slate-200 rounded-lg flex justify-between items-center">
                      <span className="text-slate-500">Framework:</span>
                      <span className="font-semibold text-slate-800">Vite</span>
                    </div>
                    <div className="p-2 bg-white border border-slate-200 rounded-lg flex justify-between items-center">
                      <span className="text-slate-500">Build Command:</span>
                      <span className="font-mono font-semibold text-violet-600">npm run build</span>
                    </div>
                    <div className="p-2 bg-white border border-slate-200 rounded-lg flex justify-between items-center">
                      <span className="text-slate-500">Output Directory:</span>
                      <span className="font-mono font-semibold text-emerald-600">dist</span>
                    </div>
                    <div className="p-2 bg-white border border-slate-200 rounded-lg flex justify-between items-center">
                      <span className="text-slate-500">Node.js Version:</span>
                      <span className="font-semibold text-slate-800">20.x or 22.x</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 font-bold flex items-center justify-center shrink-0 text-xs">
                  4
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-900">Environment Variables (Optional)</div>
                    <button
                      onClick={() => copyToClipboard('GEMINI_API_KEY', 'env')}
                      className="text-violet-600 hover:text-violet-700 flex items-center gap-1 font-semibold text-[11px]"
                    >
                      {copiedKey === 'env' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy GEMINI_API_KEY</span>
                    </button>
                  </div>
                  <p className="text-slate-600">
                    Vercel dashboard me <strong>Environment Variables</strong> me <code>GEMINI_API_KEY</code> add kar sakte hain. Agar API key nahi bhi denge, tab bhi <strong>Pure Client-Side HD Engine 100% Free & Fast chalega</strong>!
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-xs">
                  5
                </div>
                <div className="flex-1 space-y-1">
                  <div className="font-bold text-slate-900">Click &quot;Deploy&quot; & Website Live!</div>
                  <p className="text-slate-600">
                    Deploy click karte hi 45 seconds me aapki fast website live ho jayegi with free custom domain (e.g. <code>your-app.vercel.app</code>) and free SSL!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CLI Alternative */}
          <div className="p-3.5 bg-slate-900 text-white rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300">Fast 1-Line Vercel CLI Deploy:</span>
              <button
                onClick={() => copyToClipboard('npx vercel --prod', 'cli')}
                className="text-violet-300 hover:text-white flex items-center gap-1 text-[11px]"
              >
                {copiedKey === 'cli' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Command</span>
              </button>
            </div>
            <pre className="font-mono bg-slate-950 p-2.5 rounded-lg text-emerald-400 text-xs overflow-x-auto">
              npx vercel --prod
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Ready for 10,000+ daily visitors on Vercel</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
          >
            Got it / Samajh Gaya
          </button>
        </div>
      </div>
    </div>
  );
};
