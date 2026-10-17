import React, { useState } from 'react';
import {
  Search,
  Undo2,
  Redo2,
  Clock,
  Sun,
  Moon,
  Settings,
  Bell,
  Upload,
  Check,
  Edit2,
  X,
  SlidersHorizontal,
  Rocket,
} from 'lucide-react';
import { Project } from '../types';

interface TopNavProps {
  project: Project;
  onRenameProject: (newName: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onUploadClick: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onOpenVercelDeploy: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  project,
  onRenameProject,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  searchQuery,
  onSearchChange,
  onUploadClick,
  darkMode,
  onToggleDarkMode,
  onOpenSettings,
  onOpenHistory,
  onOpenVercelDeploy,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(project.name);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleTitleSubmit = () => {
    if (titleInput.trim()) {
      onRenameProject(titleInput.trim());
    } else {
      setTitleInput(project.name);
    }
    setIsEditingTitle(false);
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between gap-4 select-none shrink-0 z-20">
      {/* Zone 1: Project Title & Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-xs font-semibold text-slate-400 hidden sm:inline">Workspace /</span>
        {isEditingTitle ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSubmit();
                if (e.key === 'Escape') {
                  setTitleInput(project.name);
                  setIsEditingTitle(false);
                }
              }}
              autoFocus
              className="text-sm font-semibold text-slate-900 border border-violet-400 rounded px-2 py-0.5 focus:outline-hidden focus:ring-1 focus:ring-violet-500 w-48 sm:w-64"
            />
            <button
              onClick={handleTitleSubmit}
              className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-slate-100 rounded"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setTitleInput(project.name);
                setIsEditingTitle(false);
              }}
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => {
              setTitleInput(project.name);
              setIsEditingTitle(true);
            }}
            className="group flex items-center gap-1.5 cursor-pointer py-1 px-1.5 -ml-1.5 rounded hover:bg-slate-100 transition-colors"
            title="Click to rename project"
          >
            <h1 className="text-sm font-semibold text-slate-900 truncate max-w-[200px] sm:max-w-xs">
              {project.name}
            </h1>
            <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}

        {/* Mode Indicator Tag */}
        <span
          className={`hidden md:inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full ${
            project.mode === 'mode-a'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          {project.mode === 'mode-a' ? 'Original BG Preserved' : 'Transparent PNG Mode'}
        </span>
      </div>

      {/* Zone 2: Search & Undo / Redo */}
      <div className="flex items-center gap-2">
        {/* Project Search Bar */}
        <div className="relative hidden md:block w-48 lg:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search projects & tools..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
          />
        </div>

        {/* Undo / Redo Buttons */}
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className={`p-1.5 rounded-md transition-colors ${
              canUndo
                ? 'text-slate-700 hover:bg-white hover:shadow-xs'
                : 'text-slate-300 cursor-not-allowed'
            }`}
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <div className="w-[1px] h-3.5 bg-slate-200 mx-0.5" />
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className={`p-1.5 rounded-md transition-colors ${
              canRedo
                ? 'text-slate-700 hover:bg-white hover:shadow-xs'
                : 'text-slate-300 cursor-not-allowed'
            }`}
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* History Modal Trigger */}
        <button
          onClick={onOpenHistory}
          title="Editing History & Snapshots"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
        >
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">History</span>
          <span className="bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded-full text-[10px] font-mono tabular-nums">
            {project.history.length}
          </span>
        </button>
      </div>

      {/* Zone 3: Actions & Settings */}
      <div className="flex items-center gap-2">
        {/* Vercel Deploy Guide */}
        <button
          onClick={onOpenVercelDeploy}
          title="Vercel Deployment & 100% Speed Guide"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-slate-900 to-violet-950 hover:from-slate-800 hover:to-violet-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors border border-violet-800/50 cursor-pointer"
        >
          <Rocket className="w-3.5 h-3.5 text-violet-400" />
          <span className="hidden md:inline">Deploy to Vercel</span>
        </button>

        {/* Upload Button */}
        <button
          onClick={onUploadClick}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-semibold shadow-xs shadow-violet-200 transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Upload Image</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleDarkMode}
          title={darkMode ? 'Switch to Light Studio' : 'Switch to Dark Studio'}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notifications Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 relative"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-violet-600 absolute top-1.5 right-1.5 ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800">Notifications</span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="py-2 space-y-2 text-xs">
                <div className="p-2 bg-violet-50 rounded-lg text-violet-800">
                  <div className="font-semibold">AI Photo Enhance Pro Ready</div>
                  <div className="text-[11px] text-violet-600 mt-0.5">
                    Super-resolution 4K/8K upscaler and background-preserving neural models loaded.
                  </div>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg text-slate-700">
                  <div className="font-semibold">High-DPI TIFF Export Supported</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Exports up to 600 DPI print-ready master files.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          title="Studio Preferences"
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
