export type ToolId =
  | 'explore'
  | 'enhance-pro'
  | 'png-shape-hd'
  | 'deblur-bokeh'
  | 'generator'
  | 'bg-remover'
  | 'object-remover'
  | 'portrait'
  | 'upscaler'
  | 'studio'
  | 'png-converter'
  | 'color'
  | 'graphics'
  | 'restoration';

export interface EnhanceSettings {
  skinSmoothing: number; // 0-100
  blemishReduction: number; // 0-100
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  sharpness: number; // 0-100
  noiseReduction: number; // 0-100
  detailEnhancement: number; // 0-100
  exposure: number; // -100 to 100
  colorCorrection: number; // -100 to 100
  saturation: number; // -100 to 100
  whiteBalance: number; // -100 to 100
  shadowRecovery: number; // 0-100
  highlightRecovery: number; // 0-100
  backgroundBlur: number; // 0-100 (DSLR background blur / bokeh effect)
  deblurAmount: number; // 0-100 (Unblur blurry photos into HD)
  shapeEdgeCrisp: number; // 0-100 (PNG Shape to HD crisp vector-like anti-aliasing)
  hdrColorBoost: number; // 0-100 (Enhanced vibrant HDR colour boost)
  removeWhiteBg: boolean; // 100% White Background Removal to Transparent PNG
  removeBlueFringe: boolean; // Removes blue fringing on lines and draws pure sharp edges
}

export type CanvasMode = 'mode-a' | 'mode-b'; // Mode A: Enhance Keep BG, Mode B: Remove BG Export Transparent PNG
export type EnhanceQuality = 'low' | 'medium' | 'high' | 'maximum';
export type ExportScale = 0.5 | 1 | 2 | 4 | 8;
export type ExportFormat = 'png' | 'jpg' | 'webp' | 'tiff';
export type ExportBackground = 'preserve' | 'transparent' | 'remove-white' | 'white' | 'custom';
export type TargetDomain = 'general' | 'portrait' | 'graphics' | 'png-shape';

export interface HistoryStep {
  title: string;
  timestamp: number;
  settings: EnhanceSettings;
  mode: CanvasMode;
  targetDomain: TargetDomain;
}

export interface Project {
  id: string;
  name: string;
  originalUrl: string;
  enhancedUrl: string | null;
  currentUrl: string;
  thumbnail: string;
  width: number;
  height: number;
  dpi: number;
  createdAt: number;
  updatedAt: number;
  settings: EnhanceSettings;
  mode: CanvasMode;
  targetDomain: TargetDomain;
  quality: EnhanceQuality;
  exportScale: ExportScale;
  exportFormat: ExportFormat;
  exportBackground: ExportBackground;
  customBgColor: string;
  history: HistoryStep[];
  historyIndex: number;
}
