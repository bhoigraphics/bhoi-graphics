import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Project, ToolId, EnhanceSettings, CanvasMode, TargetDomain, ExportScale, ExportFormat, ExportBackground } from './types';
import { SAMPLE_PROJECTS } from './data/sampleProjects';
import { DEFAULT_SETTINGS, loadImage, processImageOnCanvas, downloadProcessedImage } from './utils/imageEngine';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { ImagePreview } from './components/ImagePreview';
import { EnhanceSettingsPanel } from './components/EnhanceSettingsPanel';
import { BottomExportPanel } from './components/BottomExportPanel';

// Dedicated Tool Views
import { ExploreToolsView } from './components/tools/ExploreToolsView';
import { ImageGeneratorView } from './components/tools/ImageGeneratorView';
import { BackgroundRemoverView } from './components/tools/BackgroundRemoverView';
import { ObjectRemoverView } from './components/tools/ObjectRemoverView';
import { PortraitEnhancerView } from './components/tools/PortraitEnhancerView';
import { UpscalerView } from './components/tools/UpscalerView';
import { StudioEditorView } from './components/tools/StudioEditorView';
import { PngConverterView } from './components/tools/PngConverterView';
import { ColorCorrectionView } from './components/tools/ColorCorrectionView';
import { GraphicsEditorView } from './components/tools/GraphicsEditorView';
import { PhotoRestorationView } from './components/tools/PhotoRestorationView';
import { PngShapeHdView } from './components/tools/PngShapeHdView';
import { DeblurBokehView } from './components/tools/DeblurBokehView';

// Modals
import { HistoryModal } from './components/modals/HistoryModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { VercelDeployModal } from './components/modals/VercelDeployModal';

export default function App() {
  const [projects, setProjects] = useState<Project[]>(SAMPLE_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState<string>('sample-1');
  const [activeTool, setActiveTool] = useState<ToolId>('enhance-pro');
  const [collapsedSidebar, setCollapsedSidebar] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showVercelDeployModal, setShowVercelDeployModal] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressMessage, setProgressMessage] = useState<string>('');

  const [enhancedCanvas, setEnhancedCanvas] = useState<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  // Helper to update active project
  const updateActiveProject = useCallback(
    (updater: Partial<Project> | ((prev: Project) => Project)) => {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== activeProjectId) return p;
          if (typeof updater === 'function') {
            return updater(p);
          }
          return { ...p, ...updater, updatedAt: Date.now() };
        })
      );
    },
    [activeProjectId]
  );

  // Render live enhanced canvas whenever project parameters change with requestAnimationFrame throttling
  useEffect(() => {
    let isCancelled = false;
    let frameId: number | null = null;

    const renderCanvas = () => {
      if (!activeProject) return;

      if (frameId) {
        cancelAnimationFrame(frameId);
      }

      frameId = requestAnimationFrame(async () => {
        try {
          const sourceUrl = activeProject.enhancedUrl || activeProject.currentUrl;
          const img = await loadImage(sourceUrl);
          if (isCancelled) return;

          const isRemoveWhite = activeProject.settings.removeWhiteBg || activeProject.exportBackground === 'remove-white';
          const isRemoveBg =
            activeProject.mode === 'mode-b' || activeProject.exportBackground === 'transparent' || isRemoveWhite;

          const effectiveBg = isRemoveWhite ? 'remove-white' : activeProject.exportBackground;

          const canvas = processImageOnCanvas(
            img,
            activeProject.settings,
            activeProject.targetDomain,
            isRemoveBg,
            effectiveBg,
            activeProject.customBgColor,
            1 // 1x in preview for high speed
          );

          if (!isCancelled) {
            setEnhancedCanvas(canvas);
          }
        } catch (err) {
          console.warn('Canvas render notice:', err);
        }
      });
    };

    renderCanvas();

    return () => {
      isCancelled = true;
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [
    activeProject?.currentUrl,
    activeProject?.enhancedUrl,
    activeProject?.settings,
    activeProject?.mode,
    activeProject?.targetDomain,
    activeProject?.exportBackground,
    activeProject?.customBgColor,
  ]);

  // Undo / Redo
  const canUndo = activeProject.historyIndex > 0;
  const canRedo = activeProject.historyIndex < activeProject.history.length - 1;

  const pushHistory = (title: string, newSettings?: EnhanceSettings) => {
    updateActiveProject((p) => {
      const currentHistory = p.history.slice(0, p.historyIndex + 1);
      const newStep = {
        title,
        timestamp: Date.now(),
        settings: newSettings || p.settings,
        mode: p.mode,
        targetDomain: p.targetDomain,
      };
      return {
        ...p,
        settings: newSettings || p.settings,
        history: [...currentHistory, newStep],
        historyIndex: currentHistory.length,
      };
    });
  };

  const handleUndo = () => {
    if (!canUndo) return;
    const targetIndex = activeProject.historyIndex - 1;
    const targetStep = activeProject.history[targetIndex];
    updateActiveProject({
      historyIndex: targetIndex,
      settings: targetStep.settings,
      mode: targetStep.mode,
      targetDomain: targetStep.targetDomain,
    });
  };

  const handleRedo = () => {
    if (!canRedo) return;
    const targetIndex = activeProject.historyIndex + 1;
    const targetStep = activeProject.history[targetIndex];
    updateActiveProject({
      historyIndex: targetIndex,
      settings: targetStep.settings,
      mode: targetStep.mode,
      targetDomain: targetStep.targetDomain,
    });
  };

  // Keyboard shortcut listener (Ctrl+Z / Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, activeProject]);

  // File Upload
  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const newProject: Project = {
            id: 'proj-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
            name: file.name.replace(/\.[^/.]+$/, ''),
            originalUrl: dataUrl,
            enhancedUrl: null,
            currentUrl: dataUrl,
            thumbnail: dataUrl,
            width: img.naturalWidth,
            height: img.naturalHeight,
            dpi: 300,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            settings: { ...DEFAULT_SETTINGS },
            mode: 'mode-a', // Mode A default: strictly keep original background!
            targetDomain: 'general',
            quality: 'maximum',
            exportScale: 2,
            exportFormat: 'png',
            exportBackground: 'preserve',
            customBgColor: '#FFFFFF',
            history: [
              {
                title: 'Image Uploaded',
                timestamp: Date.now(),
                settings: { ...DEFAULT_SETTINGS },
                mode: 'mode-a',
                targetDomain: 'general',
              },
            ],
            historyIndex: 0,
          };

          setProjects((prev) => [newProject, ...prev]);
          setActiveProjectId(newProject.id);
          setActiveTool('enhance-pro');
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  // Run AI Photo Enhancement Pro
  const handleApplyEnhancement = async () => {
    setIsProcessing(true);
    setProgressMessage('Analyzing pixel dynamics with Gemini Vision & Super-Resolution...');

    try {
      // Call server endpoint
      const res = await fetch('/api/ai/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: activeProject.originalUrl,
          mode: activeProject.targetDomain,
          quality: activeProject.quality,
          preserveBackground: activeProject.mode === 'mode-a',
          settings: activeProject.settings,
        }),
      });
      const data = await res.json();

      if (data.success && data.enhancedImage) {
        updateActiveProject({
          enhancedUrl: data.enhancedImage,
          currentUrl: data.enhancedImage,
        });
        pushHistory('AI Model Enhancement Pass');
      } else {
        // High quality client unsharp mask & bilateral tone pass
        setProgressMessage('Applying mathematical unsharp-mask convolution & tone curve...');
        const img = await loadImage(activeProject.originalUrl);
        const isRemoveWhite = activeProject.settings.removeWhiteBg || activeProject.exportBackground === 'remove-white';
        const isRemoveBg = activeProject.mode === 'mode-b' || activeProject.exportBackground === 'transparent' || isRemoveWhite;
        const effectiveBg = isRemoveWhite ? 'remove-white' : activeProject.exportBackground;

        const canvas = processImageOnCanvas(
          img,
          activeProject.settings,
          activeProject.targetDomain,
          isRemoveBg,
          effectiveBg,
          activeProject.customBgColor,
          1
        );
        const dataUrl = canvas.toDataURL('image/png');
        updateActiveProject({
          enhancedUrl: dataUrl,
          currentUrl: dataUrl,
        });
        pushHistory('Enhanced Super-Res Filter Pass');
      }
    } catch (err) {
      console.warn('Enhancement notice, using local Pro Engine:', err);
      // Fallback to local canvas
      const img = await loadImage(activeProject.originalUrl);
      const isRemoveWhite = activeProject.settings.removeWhiteBg || activeProject.exportBackground === 'remove-white';
      const isRemoveBg = activeProject.mode === 'mode-b' || activeProject.exportBackground === 'transparent' || isRemoveWhite;
      const effectiveBg = isRemoveWhite ? 'remove-white' : activeProject.exportBackground;

      const canvas = processImageOnCanvas(
        img,
        activeProject.settings,
        activeProject.targetDomain,
        isRemoveBg,
        effectiveBg,
        activeProject.customBgColor,
        1
      );
      updateActiveProject({
        enhancedUrl: canvas.toDataURL('image/png'),
        currentUrl: canvas.toDataURL('image/png'),
      });
      pushHistory('Enhanced Super-Res Filter Pass');
    } finally {
      setIsProcessing(false);
      setProgressMessage('');
    }
  };

  // Download Now handler (renders offscreen canvas at EXACT selected dimensions & format)
  const handleDownloadNow = async () => {
    setIsProcessing(true);
    setProgressMessage(`Rendering master ${activeProject.exportScale}× export (${activeProject.exportFormat.toUpperCase()})...`);
    try {
      const sourceUrl = activeProject.enhancedUrl || activeProject.currentUrl;
      const img = await loadImage(sourceUrl);

      const isRemoveWhite = activeProject.settings.removeWhiteBg || activeProject.exportBackground === 'remove-white';
      const isRemoveBg =
        activeProject.mode === 'mode-b' || activeProject.exportBackground === 'transparent' || isRemoveWhite;
      const effectiveBg = isRemoveWhite ? 'remove-white' : activeProject.exportBackground;

      const exportCanvas = processImageOnCanvas(
        img,
        activeProject.settings,
        activeProject.targetDomain,
        isRemoveBg,
        effectiveBg,
        activeProject.customBgColor,
        activeProject.exportScale
      );

      await downloadProcessedImage(
        exportCanvas,
        activeProject.name,
        activeProject.exportFormat,
        activeProject.quality
      );
    } catch (err) {
      console.warn('Export download notice:', err);
    } finally {
      setIsProcessing(false);
      setProgressMessage('');
    }
  };

  // Batch Download handler
  const handleBatchDownload = async () => {
    setIsProcessing(true);
    setProgressMessage('Generating batch downloads for all projects...');
    try {
      for (const proj of projects) {
        const sourceUrl = proj.enhancedUrl || proj.currentUrl;
        const img = await loadImage(sourceUrl);
        const isRemoveBg = proj.mode === 'mode-b' || proj.exportBackground === 'transparent';
        const canvas = processImageOnCanvas(
          img,
          proj.settings,
          proj.targetDomain,
          isRemoveBg,
          proj.exportBackground,
          proj.customBgColor,
          proj.exportScale
        );
        await downloadProcessedImage(canvas, proj.name, proj.exportFormat, proj.quality);
        // Small delay between downloads
        await new Promise((r) => setTimeout(r, 600));
      }
    } finally {
      setIsProcessing(false);
      setProgressMessage('');
    }
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${darkMode ? 'dark bg-slate-900 text-slate-100' : 'bg-[#F8F9FA] text-slate-800'}`}>
      {/* Hidden File Input for Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/tiff"
        multiple
        onChange={handleUploadImage}
        className="hidden"
      />

      {/* Left Sidebar */}
      <Sidebar
        activeTool={activeTool}
        onSelectTool={(tool) => setActiveTool(tool)}
        projects={projects.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))}
        activeProjectId={activeProjectId}
        onSelectProject={(id) => setActiveProjectId(id)}
        onNewProject={() => fileInputRef.current?.click()}
        onDuplicateProject={(id) => {
          const p = projects.find((x) => x.id === id);
          if (!p) return;
          const duplicate: Project = {
            ...p,
            id: 'proj-' + Date.now(),
            name: `${p.name} (Copy)`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          setProjects((prev) => [duplicate, ...prev]);
          setActiveProjectId(duplicate.id);
        }}
        onDeleteProject={(id) => {
          if (projects.length <= 1) return;
          const remaining = projects.filter((p) => p.id !== id);
          setProjects(remaining);
          if (activeProjectId === id) {
            setActiveProjectId(remaining[0].id);
          }
        }}
        collapsed={collapsedSidebar}
        onToggleCollapse={() => setCollapsedSidebar(!collapsedSidebar)}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Navigation */}
        <TopNav
          project={activeProject}
          onRenameProject={(newName) => updateActiveProject({ name: newName })}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={handleUndo}
          onRedo={handleRedo}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onUploadClick={() => fileInputRef.current?.click()}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onOpenSettings={() => setShowSettingsModal(true)}
          onOpenHistory={() => setShowHistoryModal(true)}
          onOpenVercelDeploy={() => setShowVercelDeployModal(true)}
        />

        {/* Central Workspace Area: Conditioned on Active Tool */}
        <div className="flex-1 flex min-h-0 overflow-hidden relative">
          {activeTool === 'enhance-pro' && (
            <>
              {/* Main Image Canvas with Comparison Slider */}
              <ImagePreview
                project={activeProject}
                enhancedCanvas={enhancedCanvas}
                onModeChange={(newMode) => {
                  updateActiveProject({ mode: newMode });
                  pushHistory(`Switched to ${newMode === 'mode-a' ? 'Mode A (Keep BG)' : 'Mode B (Transparent Cutout)'}`);
                }}
                isProcessing={isProcessing}
                progressMessage={progressMessage}
              />

              {/* Floating Right Enhancement Settings Panel */}
              <EnhanceSettingsPanel
                settings={activeProject.settings}
                onUpdateSettings={(newSettings) => {
                  updateActiveProject({ settings: newSettings });
                }}
                targetDomain={activeProject.targetDomain}
                onUpdateDomain={(domain) => {
                  updateActiveProject({ targetDomain: domain });
                  pushHistory(`Set Domain to ${domain}`);
                }}
                quality={activeProject.quality}
                onUpdateQuality={(q) => updateActiveProject({ quality: q })}
                onApplyEnhancement={handleApplyEnhancement}
                isProcessing={isProcessing}
                onReset={() => {
                  updateActiveProject({ settings: { ...DEFAULT_SETTINGS } });
                  pushHistory('Reset sliders to default', { ...DEFAULT_SETTINGS });
                }}
              />
            </>
          )}

          {activeTool === 'explore' && (
            <ExploreToolsView onLaunchTool={(tool) => setActiveTool(tool)} />
          )}

          {activeTool === 'png-shape-hd' && (
            <PngShapeHdView
              project={activeProject}
              onApplyToProject={(newUrl, newSettings) => {
                updateActiveProject((p) => ({
                  ...p,
                  currentUrl: newUrl,
                  enhancedUrl: newUrl,
                  targetDomain: 'png-shape',
                  settings: newSettings ? { ...p.settings, ...newSettings } : p.settings,
                }));
                pushHistory('Converted PNG Shape to HD');
                setActiveTool('enhance-pro');
              }}
            />
          )}

          {activeTool === 'deblur-bokeh' && (
            <DeblurBokehView
              project={activeProject}
              onApplyDeblurBokeh={(newUrl, newSettings) => {
                updateActiveProject((p) => ({
                  ...p,
                  currentUrl: newUrl,
                  enhancedUrl: newUrl,
                  settings: newSettings ? { ...p.settings, ...newSettings } : p.settings,
                }));
                pushHistory('Applied Focus Deblur, Bokeh & HDR Colour');
                setActiveTool('enhance-pro');
              }}
            />
          )}

          {activeTool === 'generator' && (
            <ImageGeneratorView
              onUseGeneratedImage={(imgUrl, name) => {
                const newProject: Project = {
                  id: 'gen-' + Date.now(),
                  name: `AI: ${name}`,
                  originalUrl: imgUrl,
                  enhancedUrl: null,
                  currentUrl: imgUrl,
                  thumbnail: imgUrl,
                  width: 1024,
                  height: 1024,
                  dpi: 300,
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                  settings: { ...DEFAULT_SETTINGS },
                  mode: 'mode-a',
                  targetDomain: 'general',
                  quality: 'maximum',
                  exportScale: 2,
                  exportFormat: 'png',
                  exportBackground: 'preserve',
                  customBgColor: '#FFFFFF',
                  history: [
                    {
                      title: 'Generated by AI',
                      timestamp: Date.now(),
                      settings: { ...DEFAULT_SETTINGS },
                      mode: 'mode-a',
                      targetDomain: 'general',
                    },
                  ],
                  historyIndex: 0,
                };
                setProjects((prev) => [newProject, ...prev]);
                setActiveProjectId(newProject.id);
                setActiveTool('enhance-pro');
              }}
            />
          )}

          {activeTool === 'bg-remover' && (
            <BackgroundRemoverView
              project={activeProject}
              onApplyCutoutToProject={(cutoutUrl) => {
                updateActiveProject({
                  currentUrl: cutoutUrl,
                  enhancedUrl: cutoutUrl,
                  mode: 'mode-b',
                  exportBackground: 'transparent',
                });
                pushHistory('Applied Background Removal Cutout');
                setActiveTool('enhance-pro');
              }}
            />
          )}

          {activeTool === 'object-remover' && (
            <ObjectRemoverView
              project={activeProject}
              onApplyObjectRemoval={(newUrl) => {
                updateActiveProject({
                  currentUrl: newUrl,
                  enhancedUrl: newUrl,
                });
                pushHistory('Inpainted Object Removal');
                setActiveTool('enhance-pro');
              }}
            />
          )}

          {activeTool === 'portrait' && (
            <PortraitEnhancerView
              project={activeProject}
              onApplyPortraitSettings={(newSettings) => {
                updateActiveProject((p) => ({
                  ...p,
                  settings: { ...p.settings, ...newSettings },
                  targetDomain: 'portrait',
                }));
                pushHistory('Applied Portrait Retouch');
                setActiveTool('enhance-pro');
              }}
            />
          )}

          {activeTool === 'upscaler' && (
            <UpscalerView
              project={activeProject}
              onApplyUpscale={(scale) => {
                updateActiveProject({ exportScale: scale });
                pushHistory(`Applied ${scale}x Super-Resolution`);
                setActiveTool('enhance-pro');
              }}
            />
          )}

          {activeTool === 'studio' && (
            <StudioEditorView
              project={activeProject}
              onApplyStudioTransform={(newUrl) => {
                updateActiveProject({
                  currentUrl: newUrl,
                  enhancedUrl: newUrl,
                });
                pushHistory('Applied Studio Transform');
                setActiveTool('enhance-pro');
              }}
            />
          )}

          {activeTool === 'png-converter' && (
            <PngConverterView project={activeProject} />
          )}

          {activeTool === 'color' && (
            <ColorCorrectionView
              project={activeProject}
              onApplyColorSettings={(colorSettings) => {
                updateActiveProject((p) => ({
                  ...p,
                  settings: { ...p.settings, ...colorSettings },
                }));
                pushHistory('Applied Colour Correction');
                setActiveTool('enhance-pro');
              }}
            />
          )}

          {activeTool === 'graphics' && (
            <GraphicsEditorView
              project={activeProject}
              onApplyGraphicsResult={(newUrl) => {
                updateActiveProject({
                  currentUrl: newUrl,
                  enhancedUrl: newUrl,
                  targetDomain: 'graphics',
                });
                pushHistory('Rendered Graphic Overlay');
                setActiveTool('enhance-pro');
              }}
            />
          )}

          {activeTool === 'restoration' && (
            <PhotoRestorationView
              project={activeProject}
              onApplyRestoration={(newUrl) => {
                updateActiveProject({
                  currentUrl: newUrl,
                  enhancedUrl: newUrl,
                });
                pushHistory('Applied Vintage Photo Restoration');
                setActiveTool('enhance-pro');
              }}
            />
          )}
        </div>

        {/* Floating Bottom Export Panel */}
        <BottomExportPanel
          project={activeProject}
          onScaleChange={(scale) => updateActiveProject({ exportScale: scale })}
          onFormatChange={(fmt) => updateActiveProject({ exportFormat: fmt })}
          onQualityChange={(q) => updateActiveProject({ quality: q as any })}
          onBackgroundChange={(bg, customColor) =>
            updateActiveProject({
              exportBackground: bg,
              customBgColor: customColor || activeProject.customBgColor,
              mode: bg === 'transparent' ? 'mode-b' : activeProject.mode,
            })
          }
          onDpiChange={(dpi) => updateActiveProject({ dpi })}
          onReEnhance={handleApplyEnhancement}
          onDownloadNow={handleDownloadNow}
          onBatchDownload={handleBatchDownload}
          isProcessing={isProcessing}
        />
      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <HistoryModal
          project={activeProject}
          onRestoreStep={(stepIndex) => {
            const step = activeProject.history[stepIndex];
            updateActiveProject({
              historyIndex: stepIndex,
              settings: step.settings,
              mode: step.mode,
              targetDomain: step.targetDomain,
            });
          }}
          onRestoreOriginal={() => {
            updateActiveProject({
              enhancedUrl: null,
              currentUrl: activeProject.originalUrl,
              settings: { ...DEFAULT_SETTINGS },
              mode: 'mode-a',
              historyIndex: 0,
            });
          }}
          onClose={() => setShowHistoryModal(false)}
        />
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          defaultFormat={activeProject.exportFormat}
          onUpdateDefaultFormat={(fmt) => updateActiveProject({ exportFormat: fmt })}
          defaultDpi={activeProject.dpi}
          onUpdateDefaultDpi={(dpi) => updateActiveProject({ dpi })}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {/* Vercel Deployment & Speed Guide Modal */}
      <VercelDeployModal
        isOpen={showVercelDeployModal}
        onClose={() => setShowVercelDeployModal(false)}
      />
    </div>
  );
}
