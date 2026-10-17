import React from 'react';
import {
  Sparkles,
  Wand2,
  Scissors,
  Eraser,
  UserCheck,
  Maximize2,
  Sliders,
  FileImage,
  Palette,
  Layers,
  History,
  ArrowRight,
  ShieldCheck,
  Shapes,
  Focus,
} from 'lucide-react';
import { ToolId } from '../../types';

interface ExploreToolsViewProps {
  onLaunchTool: (tool: ToolId) => void;
}

export const ExploreToolsView: React.FC<ExploreToolsViewProps> = ({ onLaunchTool }) => {
  const toolsList = [
    {
      id: 'enhance-pro' as ToolId,
      name: 'AI Photo Enhance Pro',
      category: 'Flagship Super-Resolution',
      desc: 'Deep neural enhancement with original background preservation, Before/After slider, and 300+ DPI export.',
      icon: Sparkles,
      color: 'from-violet-600 to-indigo-600',
      badge: 'PRO FLAGSHIP',
    },
    {
      id: 'png-shape-hd' as ToolId,
      name: 'PNG Shape to Ultra HD',
      category: 'Vector-Crisp Anti-Aliasing',
      desc: 'Converts low-res PNG shapes, logos, and stickers to crisp HD with anti-aliased edge smoothing.',
      icon: Shapes,
      color: 'from-purple-600 to-violet-600',
      badge: 'NEW',
    },
    {
      id: 'deblur-bokeh' as ToolId,
      name: 'Blur Photo Fix & Background Bokeh',
      category: 'Focus & Depth of Field',
      desc: 'Recovers sharp focus from blurry photos, adds studio DSLR background bokeh, and boosts HDR colour pop.',
      icon: Focus,
      color: 'from-indigo-600 to-pink-600',
      badge: 'POPULAR',
    },
    {
      id: 'generator' as ToolId,
      name: 'AI Image Generator',
      category: 'Generative Synthesis',
      desc: 'Create photorealistic portraits, commercial product mockups, and illustrations from text prompts.',
      icon: Wand2,
      color: 'from-fuchsia-600 to-pink-600',
    },
    {
      id: 'bg-remover' as ToolId,
      name: 'Background Remover',
      category: 'Alpha Transparency',
      desc: 'Precision subject isolation with clean edges and instant transparent PNG export (Mode B).',
      icon: Scissors,
      color: 'from-rose-500 to-orange-500',
    },
    {
      id: 'object-remover' as ToolId,
      name: 'AI Object Remover',
      category: 'Inpainting & Clean up',
      desc: 'Erase unwanted photobombers, text watermarks, wires, and spots with interactive brush selection.',
      icon: Eraser,
      color: 'from-amber-500 to-emerald-500',
    },
    {
      id: 'portrait' as ToolId,
      name: 'Portrait & Headshot Enhancer',
      category: 'Face & Beauty',
      desc: 'Subtle skin smoothing, blemish reduction, eye sparkle, and natural studio lighting retouching.',
      icon: UserCheck,
      color: 'from-cyan-500 to-blue-500',
    },
    {
      id: 'upscaler' as ToolId,
      name: 'AI Image Upscaler',
      category: 'Ultra-Clarity 4K / 8K',
      desc: 'Enlarge small images 2×, 4×, and 8× up to 8192px with micro-texture reconstruction.',
      icon: Maximize2,
      color: 'from-blue-600 to-violet-600',
    },
    {
      id: 'graphics' as ToolId,
      name: 'Graphics Design Editor',
      category: 'Invitations & Borders',
      desc: 'Designed for wedding invitations, floral borders, and typography overlays without facial blur.',
      icon: Layers,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'restoration' as ToolId,
      name: 'Old Photo Restoration',
      category: 'Historical Archive',
      desc: 'Revive damaged vintage photos, remove scratches, restore faded contrast, and colorize monochrome film.',
      icon: History,
      color: 'from-stone-600 to-slate-800',
    },
    {
      id: 'png-converter' as ToolId,
      name: 'PNG Converter',
      category: 'Format Optimization',
      desc: 'Convert any format to 24-bit/32-bit transparent PNG, WebP, or master uncompressed TIFF.',
      icon: FileImage,
      color: 'from-indigo-500 to-purple-600',
    },
    {
      id: 'color' as ToolId,
      name: 'Colour Correction Suite',
      category: 'Color Grading',
      desc: 'White balance, vibrance, shadows, highlight recovery, and professional cinematic color matrices.',
      icon: Palette,
      color: 'from-pink-500 to-rose-600',
    },
    {
      id: 'studio' as ToolId,
      name: 'Image Editing Studio',
      category: 'Transforms & Crops',
      desc: 'Aspect ratio cropping, 90-degree rotations, flips, vignette, and grain grading.',
      icon: Sliders,
      color: 'from-slate-600 to-zinc-700',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-md">
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-300 bg-violet-800/60 px-3 py-1 rounded-full inline-block mb-3">
              PixorAI Creative Studio 3.2
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              AI Photo Enhance Pro & Image Toolkit
            </h1>
            <p className="text-slate-300 text-sm mt-2 leading-relaxed">
              Desktop-first photo workspace featuring genuine AI super-resolution, background-preserving enhancement, interactive Before/After comparison, and master high-DPI export.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => onLaunchTool('enhance-pro')}
                className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-900/50 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Open AI Photo Enhance Pro</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {toolsList.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                onClick={() => onLaunchTool(tool.id)}
                className="group bg-white rounded-xl p-5 border border-slate-200 hover:border-violet-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${tool.color} text-white flex items-center justify-center shadow-xs`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    {tool.badge && (
                      <span className="text-[10px] font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                    {tool.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{tool.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-violet-600 group-hover:translate-x-1 transition-transform">
                  <span>Open Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
