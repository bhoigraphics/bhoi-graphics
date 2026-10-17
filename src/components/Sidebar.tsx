import React from 'react';
import {
  Compass,
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
  FolderOpen,
  Plus,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Shapes,
  Focus,
} from 'lucide-react';
import { ToolId, Project } from '../types';

interface SidebarProps {
  activeTool: ToolId;
  onSelectTool: (tool: ToolId) => void;
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  onDuplicateProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const TOOLS: { id: ToolId; name: string; icon: React.ElementType; isPrimary?: boolean; desc: string }[] = [
  { id: 'explore', name: 'Explore AI Tools', icon: Compass, desc: 'AI Studio Tool Directory' },
  { id: 'enhance-pro', name: 'AI Photo Enhance Pro', icon: Sparkles, isPrimary: true, desc: 'Flagship Super-Res & Tone' },
  { id: 'png-shape-hd', name: 'PNG Shape to HD', icon: Shapes, desc: 'Vector-Crisp Anti-Aliased' },
  { id: 'deblur-bokeh', name: 'Blur Photo & Bokeh HD', icon: Focus, desc: 'Deblur & Background Bokeh' },
  { id: 'generator', name: 'AI Image Generator', icon: Wand2, desc: 'Prompt to High-Res Art' },
  { id: 'bg-remover', name: 'Background Remover', icon: Scissors, desc: 'Precision Alpha Cutout' },
  { id: 'object-remover', name: 'AI Object Remover', icon: Eraser, desc: 'Magic Inpaint Brush' },
  { id: 'portrait', name: 'Portrait & Headshot', icon: UserCheck, desc: 'Natural Skin & Eye Glow' },
  { id: 'upscaler', name: 'AI Image Upscaler', icon: Maximize2, desc: '2×, 4×, 8× 4K/8K Engine' },
  { id: 'studio', name: 'Editing Studio', icon: Sliders, desc: 'Crop, Rotate & Presets' },
  { id: 'png-converter', name: 'PNG Converter', icon: FileImage, desc: 'Alpha PNG & 32-bit Depth' },
  { id: 'color', name: 'Colour Correction', icon: Palette, desc: 'HSL & Balance Grading' },
  { id: 'graphics', name: 'Graphics Design Editor', icon: Layers, desc: 'Frames, Invitations, Texts' },
  { id: 'restoration', name: 'Old Photo Restoration', icon: History, desc: 'Vintage Scratch & Colorize' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTool,
  onSelectTool,
  projects,
  activeProjectId,
  onSelectProject,
  onNewProject,
  onDuplicateProject,
  onDeleteProject,
  collapsed,
  onToggleCollapse,
}) => {
  return (
    <aside
      className={`relative flex flex-col bg-white border-r border-slate-200 transition-all duration-200 z-30 select-none ${
        collapsed ? 'w-18' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-violet-200">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 block leading-tight">
                Pixor<span className="text-violet-600">AI</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Studio Suite</span>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="mx-auto w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Tool Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {!collapsed && (
          <div className="px-3 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            AI Creative Tools
          </div>
        )}

        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;

          return (
            <button
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              title={tool.name}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all relative ${
                isActive
                  ? 'bg-violet-50 text-violet-700 font-semibold shadow-xs ring-1 ring-violet-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isActive
                    ? 'bg-violet-600 text-white'
                    : tool.isPrimary
                    ? 'bg-violet-100 text-violet-700'
                    : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] truncate">{tool.name}</span>
                    {tool.isPrimary && (
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-violet-100 text-violet-700 px-1.5 py-0.2 rounded shrink-0">
                        PRO
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate font-normal">
                    {tool.desc}
                  </div>
                </div>
              )}
            </button>
          );
        })}

        {/* Projects Shelf */}
        {!collapsed && (
          <div className="pt-5 pb-2">
            <div className="flex items-center justify-between px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5" /> Recent Projects
              </span>
              <button
                onClick={onNewProject}
                className="flex items-center gap-1 text-[11px] font-medium text-violet-600 hover:text-violet-700 transition-colors"
                title="Create or upload project"
              >
                <Plus className="w-3.5 h-3.5" /> New
              </button>
            </div>

            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {projects.map((proj) => {
                const isSelected = proj.id === activeProjectId;
                return (
                  <div
                    key={proj.id}
                    onClick={() => onSelectProject(proj.id)}
                    className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={proj.thumbnail}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-6 h-6 rounded object-cover border border-slate-200 shrink-0"
                      />
                      <span className="truncate">{proj.name}</span>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicateProject(proj.id);
                        }}
                        title="Duplicate"
                        className="p-1 text-slate-400 hover:text-slate-700 rounded"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      {projects.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteProject(proj.id);
                          }}
                          title="Delete"
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <span className="font-mono tabular-nums text-slate-500">v3.2 Studio Pro</span>
            <span className="text-emerald-600 font-medium">Ready</span>
          </div>
        ) : (
          <span className="font-mono text-[10px]">3.2</span>
        )}
      </div>
    </aside>
  );
};
