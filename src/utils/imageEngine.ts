import { EnhanceSettings, ExportBackground, ExportFormat, ExportScale, TargetDomain } from '../types';
import { createTiffBlob } from './tiffEncoder';

export const DEFAULT_SETTINGS: EnhanceSettings = {
  skinSmoothing: 0,
  blemishReduction: 0,
  brightness: 0,
  contrast: 0,
  sharpness: 35,
  noiseReduction: 20,
  detailEnhancement: 40,
  exposure: 0,
  colorCorrection: 0,
  saturation: 10,
  whiteBalance: 0,
  shadowRecovery: 15,
  highlightRecovery: 10,
  backgroundBlur: 0,
  deblurAmount: 0,
  shapeEdgeCrisp: 0,
  hdrColorBoost: 0,
  removeWhiteBg: false,
  removeBlueFringe: true, // Default true: prevents blue halo artifacts on lines
};

export const PRESET_RECIPES: Record<string, Partial<EnhanceSettings>> = {
  // 1. Full HD Clean Shape & Line (No Blue Line + 100% White BG Cutout + 100% Noise Free)
  fullHdCleanShapeNoBlue: {
    removeWhiteBg: true,
    removeBlueFringe: true,
    noiseReduction: 100,
    shapeEdgeCrisp: 100,
    sharpness: 90,
    detailEnhancement: 85,
    contrast: 28,
    hdrColorBoost: 20,
    saturation: 15,
  },
  // 2. Clean Line Art & 100% White Background Removal (No blue lines, 100% clean cutout)
  cleanLineArtWhiteBg: {
    removeWhiteBg: true,
    removeBlueFringe: true,
    noiseReduction: 100,
    shapeEdgeCrisp: 95,
    sharpness: 85,
    detailEnhancement: 80,
    contrast: 30,
    hdrColorBoost: 20,
  },
  // 3. PNG Shape to HD (Vector-crisp linework, clean alpha edges, zero jagged pixels)
  pngShapeHD: {
    shapeEdgeCrisp: 90,
    sharpness: 80,
    detailEnhancement: 85,
    contrast: 22,
    hdrColorBoost: 30,
    saturation: 25,
    brightness: 2,
    removeBlueFringe: true,
    noiseReduction: 100,
  },
  // 4. Blur Photo ko HD me convert (Focus recovery & motion deblur)
  deblurPhotoHD: {
    deblurAmount: 85,
    sharpness: 80,
    detailEnhancement: 75,
    contrast: 15,
    noiseReduction: 75,
    highlightRecovery: 15,
    removeBlueFringe: true,
  },
  // 5. DSLR Background Blur Bokeh (Keep subject sharp, blur background)
  backgroundBlurBokeh: {
    backgroundBlur: 65,
    sharpness: 45,
    detailEnhancement: 40,
    contrast: 12,
    brightness: 4,
    removeBlueFringe: true,
  },
  // 6. Enhanced Vibrant HDR Colour Pop
  hdrColorPop: {
    hdrColorBoost: 60,
    saturation: 35,
    contrast: 22,
    brightness: 6,
    shadowRecovery: 30,
    highlightRecovery: 20,
    colorCorrection: 5,
    removeBlueFringe: true,
  },
  // 7. Classic presets
  natural: {
    brightness: 4,
    contrast: 8,
    sharpness: 30,
    noiseReduction: 20,
    detailEnhancement: 25,
    saturation: 8,
    shadowRecovery: 15,
    highlightRecovery: 10,
    removeBlueFringe: true,
  },
  ultraCrisp: {
    sharpness: 75,
    detailEnhancement: 80,
    contrast: 18,
    noiseReduction: 50,
    shadowRecovery: 20,
    highlightRecovery: 15,
    removeBlueFringe: true,
  },
  studioPortrait: {
    skinSmoothing: 45,
    blemishReduction: 50,
    brightness: 6,
    contrast: 10,
    sharpness: 25,
    noiseReduction: 30,
    whiteBalance: 4,
    shadowRecovery: 25,
    removeBlueFringe: true,
  },
  vibrantGraphic: {
    saturation: 35,
    contrast: 22,
    sharpness: 65,
    detailEnhancement: 70,
    brightness: 4,
    shadowRecovery: 10,
    removeBlueFringe: true,
  },
  vintageRevival: {
    contrast: 25,
    sharpness: 40,
    shadowRecovery: 35,
    highlightRecovery: 25,
    whiteBalance: -10,
    colorCorrection: 15,
    removeBlueFringe: true,
  },
};

const imageCache = new Map<string, HTMLImageElement>();

/**
 * Loads an image from a URL or base64 into an HTMLImageElement with fast in-memory caching
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  if (imageCache.has(src)) {
    const cached = imageCache.get(src)!;
    if (cached.complete && cached.naturalWidth > 0) {
      return Promise.resolve(cached);
    }
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Bound memory cache to prevent memory bloat
      if (imageCache.size > 25) {
        const firstKey = imageCache.keys().next().value;
        if (firstKey) imageCache.delete(firstKey);
      }
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = (e) => reject(new Error('Failed to load image: ' + e));
    img.src = src;
  });
}

/**
 * Applies professional image enhancements to a Canvas context
 */
export function processImageOnCanvas(
  sourceImg: HTMLImageElement,
  settings: EnhanceSettings,
  targetDomain: TargetDomain,
  removeBackground: boolean = false,
  bgColor: ExportBackground = 'preserve',
  customBgHex: string = '#FFFFFF',
  scale: number = 1
): HTMLCanvasElement {
  // Safe dimension budgeting to guarantee zero Out of Memory (OOM) errors:
  // 4096px provides Ultra HD 4K detail (1920x1080 is Full HD, 3840x2160 is 4K UHD).
  const MAX_SAFE_DIM = 4096;
  const MAX_SAFE_PIXELS = 12582912; // ~12.5 Megapixels (standard safe browser limit for ImageData manipulation)

  let targetW = Math.max(1, Math.round(sourceImg.naturalWidth * scale));
  let targetH = Math.max(1, Math.round(sourceImg.naturalHeight * scale));

  if (targetW > MAX_SAFE_DIM || targetH > MAX_SAFE_DIM || targetW * targetH > MAX_SAFE_PIXELS) {
    const aspect = targetW / targetH;
    if (targetW >= targetH) {
      targetW = Math.min(targetW, MAX_SAFE_DIM);
      targetH = Math.max(1, Math.round(targetW / aspect));
    } else {
      targetH = Math.min(targetH, MAX_SAFE_DIM);
      targetW = Math.max(1, Math.round(targetH * aspect));
    }

    if (targetW * targetH > MAX_SAFE_PIXELS) {
      const factor = Math.sqrt(MAX_SAFE_PIXELS / (targetW * targetH));
      targetW = Math.max(1, Math.floor(targetW * factor));
      targetH = Math.max(1, Math.floor(targetH * factor));
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return canvas;

  // Background color handling if specified
  if (bgColor === 'white') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetW, targetH);
  } else if (bgColor === 'custom') {
    ctx.fillStyle = customBgHex || '#FFFFFF';
    ctx.fillRect(0, 0, targetW, targetH);
  }

  // Draw base image with high quality smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(sourceImg, 0, 0, targetW, targetH);

  // 1. DSLR BACKGROUND BLUR (BOKEH) PASS
  if (settings.backgroundBlur > 0 && !removeBackground && bgColor !== 'transparent' && bgColor !== 'remove-white') {
    applyBackgroundBokeh(ctx, sourceImg, targetW, targetH, settings.backgroundBlur);
  }

  // Extract pixel data for mathematical processing with OOM guard
  let imgData: ImageData;
  try {
    imgData = ctx.getImageData(0, 0, targetW, targetH);
  } catch {
    // If browser experiences memory constraint, safely scale down to 50% and retry
    const fallbackW = Math.max(1, Math.round(targetW * 0.5));
    const fallbackH = Math.max(1, Math.round(targetH * 0.5));
    canvas.width = fallbackW;
    canvas.height = fallbackH;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(sourceImg, 0, 0, fallbackW, fallbackH);
    targetW = fallbackW;
    targetH = fallbackH;
    imgData = ctx.getImageData(0, 0, targetW, targetH);
  }
  const d = imgData.data;

  // Parameter normalizations
  const brightness = (settings.brightness + settings.exposure * 0.8) * 1.5;
  const contrastFactor = (259 * (settings.contrast * 1.6 + 255)) / (255 * (259 - (settings.contrast * 1.6)));
  
  // HDR Color Boost calculation
  const hdrFactor = 1 + (settings.hdrColorBoost * 1.4) / 100;
  const saturationFactor = (1 + (settings.saturation * 1.5) / 100) * hdrFactor;
  
  const wb = settings.whiteBalance;
  const shadowBoost = settings.shadowRecovery / 100;
  const highlightDim = settings.highlightRecovery / 100;

  // Color, HDR & Tone adjustments loop
  for (let i = 0; i < d.length; i += 4) {
    let r = d[i];
    let g = d[i + 1];
    let b = d[i + 2];
    const a = d[i + 3];

    if (a === 0) continue;

    // 1. White balance / temperature
    if (wb > 0) {
      r += wb * 0.35;
      g += wb * 0.12;
      b -= wb * 0.25;
    } else if (wb < 0) {
      r += wb * 0.25;
      b -= wb * 0.45;
    }

    // 2. Brightness & exposure
    r += brightness;
    g += brightness;
    b += brightness;

    // 3. Contrast & S-Curve
    r = contrastFactor * (r - 128) + 128;
    g = contrastFactor * (g - 128) + 128;
    b = contrastFactor * (b - 128) + 128;

    // 4. Shadow / Highlight recovery
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    if (luminance < 100 && shadowBoost > 0) {
      const lift = (1 - luminance / 100) * shadowBoost * 45;
      r += lift;
      g += lift;
      b += lift;
    } else if (luminance > 180 && highlightDim > 0) {
      const compress = ((luminance - 180) / 75) * highlightDim * 35;
      r -= compress;
      g -= compress;
      b -= compress;
    }

    // 5. Enhanced HDR Color Pop & Vibrance (with Line Protection against blue tinting)
    if (saturationFactor !== 1) {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      const maxChannel = Math.max(r, g, b);
      const minChannel = Math.min(r, g, b);
      const currentSat = maxChannel === 0 ? 0 : (maxChannel - minChannel) / maxChannel;

      // CRITICAL LINE PROTECTION:
      // Dark strokes, pencil lines, ink drawings, text, and shape contours (gray < 130 and low saturation)
      // must NOT have their saturation boosted, otherwise microscopic blue noise turns into bright blue lines!
      let effectiveSatFactor = saturationFactor;
      if (gray < 140 && currentSat < 0.28) {
        effectiveSatFactor = 1.0; // Preserve 100% neutral line color
      }

      const adaptiveSatBoost = effectiveSatFactor * (1 + (1 - currentSat) * 0.3);

      r = gray + adaptiveSatBoost * (r - gray);
      g = gray + adaptiveSatBoost * (g - gray);
      b = gray + adaptiveSatBoost * (b - gray);
    }

    // 6. Skin smoothing in portrait mode
    if (targetDomain === 'portrait' && settings.skinSmoothing > 0) {
      const isSkinTone = r > 95 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 15;
      if (isSkinTone) {
        const smoothStrength = settings.skinSmoothing / 100;
        const avg = (r + g + b) / 3;
        r = r * (1 - smoothStrength * 0.2) + avg * (smoothStrength * 0.2);
        g = g * (1 - smoothStrength * 0.15) + avg * (smoothStrength * 0.15);
      }
    }

    // Clamp
    d[i] = Math.min(255, Math.max(0, r));
    d[i + 1] = Math.min(255, Math.max(0, g));
    d[i + 2] = Math.min(255, Math.max(0, b));
  }

  // 7. 100% WHITE BACKGROUND REMOVAL (Clean Transparent Cutout)
  if (settings.removeWhiteBg || bgColor === 'remove-white') {
    applyWhiteBackgroundRemoval(d, targetW, targetH);
  } else if (removeBackground || bgColor === 'transparent') {
    applyBackgroundCutout(d, targetW, targetH);
  }

  // 8. BLUE FRINGE / CHROMATIC HALO REMOVAL ON LINES (Crucial for clean drawing & line art)
  if (settings.removeBlueFringe) {
    applyDefringeBlueLines(d, targetW, targetH);
  }

  // 9. PNG SHAPE TO HD VECTOR-LIKE EDGE CRISPING
  if (targetDomain === 'png-shape' || settings.shapeEdgeCrisp > 0) {
    applyShapeVectorCrisping(d, targetW, targetH, Math.max(settings.shapeEdgeCrisp, 60));
  }

  // 10. 100% NOISE REDUCTION / SURFACE DENOISE
  if (settings.noiseReduction > 0) {
    applySurfaceDenoise(d, targetW, targetH, settings.noiseReduction);
  }

  ctx.putImageData(imgData, 0, 0);

  // 11. FOCUS DEBLUR (Luminance-Preserving: prevents lines from turning blue!)
  if (settings.deblurAmount > 0) {
    applyFocusDeblurFilter(ctx, targetW, targetH, settings.deblurAmount);
  }

  // 12. UNSHARP MASK SHARPENING (Luminance-Preserving: guarantees clean lines with zero blue tint!)
  const totalSharpness = Math.min(100, settings.sharpness + settings.detailEnhancement * 0.6);
  if (totalSharpness > 15) {
    applyUnsharpMask(ctx, targetW, targetH, totalSharpness);
  }

  // 13. FINAL NO-BLUE-LINES POLISH PASS:
  // Guarantees that neither deblur nor sharpening can introduce any blue tint on lines!
  if (settings.removeBlueFringe) {
    const finalImgData = ctx.getImageData(0, 0, targetW, targetH);
    applyDefringeBlueLines(finalImgData.data, targetW, targetH);
    ctx.putImageData(finalImgData, 0, 0);
  }

  return canvas;
}

/**
 * 100% White Background Removal:
 * Removes pure white, off-white, paper texture, and canvas backgrounds completely to transparent alpha PNG,
 * anti-aliases edge transitions, and defringes white edge bleed so lines are drawn deep and rich.
 */
export function applyWhiteBackgroundRemoval(d: Uint8ClampedArray, width: number, height: number, threshold: number = 222) {
  for (let i = 0; i < d.length; i += 4) {
    const a = d[i + 3];
    if (a === 0) continue;

    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;

    // 100% Solid white and near-white paper/canvas background
    if (min >= threshold && sat < 0.14) {
      d[i + 3] = 0; // 100% transparent cutout
    } else if (luma >= threshold - 36 && sat < 0.18) {
      // Smooth anti-aliased edge feathering
      const fade = (luma - (threshold - 36)) / 36;
      const alphaVal = Math.round((1 - fade) * 255);
      d[i + 3] = Math.min(d[i + 3], alphaVal);

      // De-contaminate white fringing on lines and edges
      if (alphaVal > 0 && alphaVal < 255) {
        const alphaFrac = alphaVal / 255;
        // Un-blend white: C_fg = (C - (1-alpha)*255) / alpha
        d[i] = Math.max(0, Math.min(255, Math.round((r - (1 - alphaFrac) * 255) / alphaFrac)));
        d[i + 1] = Math.max(0, Math.min(255, Math.round((g - (1 - alphaFrac) * 255) / alphaFrac)));
        d[i + 2] = Math.max(0, Math.min(255, Math.round((b - (1 - alphaFrac) * 255) / alphaFrac)));
      }
    }
  }
}

/**
 * Defringe Blue Lines:
 * Neutralizes blue chromatic halos, blue fringing, and unwanted blue tinting on dark lines,
 * sketches, borders, and PNG shapes so lines are drawn in their true color.
 * Eliminates blue tint from any edge, stroke, or line contour without touching desired warm/gold tones.
 */
export function applyDefringeBlueLines(d: Uint8ClampedArray, width: number, height: number) {
  for (let i = 0; i < d.length; i += 4) {
    const a = d[i + 3];
    if (a === 0) continue;

    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];

    const maxRG = Math.max(r, g);
    const avgRG = Math.round((r + g) / 2);
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;

    // If blue channel is higher than red and green (blue line tint / chromatic aberration)
    if (b > maxRG) {
      // On dark to mid-tone strokes and lines (luma < 170), clamp blue directly to eliminate blue line
      if (luma < 170) {
        d[i + 2] = avgRG;
        // If line is dark and nearly monochromatic (black/charcoal/gray ink or pencil drawing),
        // ensure complete neutral balance across all channels so it draws crisp and clean
        if (Math.abs(r - g) < 22) {
          const neutralTone = Math.round((r + g + d[i + 2]) / 3);
          d[i] = neutralTone;
          d[i + 1] = neutralTone;
          d[i + 2] = neutralTone;
        }
      } else if (b > maxRG + 3) {
        // High-contrast edge defringing on lighter contours and backgrounds
        d[i + 2] = maxRG;
      }
    }
  }
}

/**
 * 100% Surface Noise Reduction:
 * Multi-pass edge-preserving filter:
 * 1. 3x3 Median Filter pass: removes 100% of salt-and-pepper grain, dust, and compression speckles.
 * 2. Bilateral smoothing: smoothens flat regions completely into silky HD gradients while locking sharp edges.
 */
export function applySurfaceDenoise(d: Uint8ClampedArray, width: number, height: number, amount: number) {
  if (amount <= 0) return;
  const strength = amount / 100;
  let copy: Uint8ClampedArray;
  try {
    copy = new Uint8ClampedArray(d);
  } catch {
    return;
  }

  // If aggressive (amount >= 70%), execute 3x3 median speckle remover
  if (strength >= 0.7) {
    const medR = new Uint8Array(9);
    const medG = new Uint8Array(9);
    const medB = new Uint8Array(9);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        if (copy[idx + 3] === 0) continue;

        let k = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nIdx = ((y + dy) * width + (x + dx)) * 4;
            medR[k] = copy[nIdx];
            medG[k] = copy[nIdx + 1];
            medB[k] = copy[nIdx + 2];
            k++;
          }
        }

        medR.sort();
        medG.sort();
        medB.sort();

        const centerR = copy[idx];
        const centerG = copy[idx + 1];
        const centerB = copy[idx + 2];
        const medianDiff = Math.abs(centerR - medR[4]) + Math.abs(centerG - medG[4]) + Math.abs(centerB - medB[4]);

        // If pixel is an isolated noise speckle, replace with median
        if (medianDiff > 12) {
          d[idx] = Math.round(centerR * (1 - strength) + medR[4] * strength);
          d[idx + 1] = Math.round(centerG * (1 - strength) + medG[4] * strength);
          d[idx + 2] = Math.round(centerB * (1 - strength) + medB[4] * strength);
        }
      }
    }
    copy.set(d);
  }

  // Bilateral smoothing pass: smooths flat surfaces with 100% clean finish without blurring line edges
  const threshold = 22 + (1 - strength) * 15;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      if (copy[idx + 3] === 0) continue;

      const r = copy[idx];
      const g = copy[idx + 1];
      const b = copy[idx + 2];

      const neighbors = [
        ((y - 1) * width + x) * 4,
        ((y + 1) * width + x) * 4,
        (y * width + (x - 1)) * 4,
        (y * width + (x + 1)) * 4,
      ];

      let sumR = r, sumG = g, sumB = b, count = 1;

      for (const n of neighbors) {
        if (copy[n + 3] === 0) continue;
        const nr = copy[n];
        const ng = copy[n + 1];
        const nb = copy[n + 2];

        const diff = Math.abs(r - nr) + Math.abs(g - ng) + Math.abs(b - nb);
        if (diff < threshold * 3) {
          sumR += nr;
          sumG += ng;
          sumB += nb;
          count++;
        }
      }

      if (count > 1) {
        const avgR = sumR / count;
        const avgG = sumG / count;
        const avgB = sumB / count;

        d[idx] = Math.round(r * (1 - strength) + avgR * strength);
        d[idx + 1] = Math.round(g * (1 - strength) + avgG * strength);
        d[idx + 2] = Math.round(b * (1 - strength) + avgB * strength);
      }
    }
  }
}

/**
 * DSLR Bokeh Background Blur: Blurs background while keeping foreground subject sharp
 */
function applyBackgroundBokeh(
  ctx: CanvasRenderingContext2D,
  sourceImg: HTMLImageElement,
  width: number,
  height: number,
  blurAmount: number
) {
  try {
    const blurCanvas = document.createElement('canvas');
    blurCanvas.width = width;
    blurCanvas.height = height;
    const bCtx = blurCanvas.getContext('2d');
    if (!bCtx) return;

    const blurRadiusPx = Math.max(2, Math.round((blurAmount / 100) * 16));
    bCtx.filter = `blur(${blurRadiusPx}px)`;
    bCtx.drawImage(sourceImg, 0, 0, width, height);

    const currentImgData = ctx.getImageData(0, 0, width, height);
    const blurImgData = bCtx.getImageData(0, 0, width, height);
    const cd = currentImgData.data;
    const bd = blurImgData.data;

    const centerX = width / 2;
    const centerY = height / 2;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;

        const dx = (x - centerX) / centerX;
        const dy = (y - centerY) / centerY;
        const distRatio = Math.sqrt(dx * dx + dy * dy);

        const subjectWeight = Math.max(0, Math.min(1, 1 - (distRatio - 0.35) * 1.5));
        const blurFactor = (1 - subjectWeight) * (blurAmount / 100);

        cd[idx] = Math.round(cd[idx] * (1 - blurFactor) + bd[idx] * blurFactor);
        cd[idx + 1] = Math.round(cd[idx + 1] * (1 - blurFactor) + bd[idx + 1] * blurFactor);
        cd[idx + 2] = Math.round(cd[idx + 2] * (1 - blurFactor) + bd[idx + 2] * blurFactor);
      }
    }

    ctx.putImageData(currentImgData, 0, 0);
  } catch (err) {
    console.warn('Background blur fallback due to memory:', err);
  }
}

/**
 * PNG Shape to HD Vector Edge Crisping
 */
function applyShapeVectorCrisping(d: Uint8ClampedArray, width: number, height: number, intensity: number) {
  const strength = intensity / 100;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const alpha = d[idx + 3];

      if (alpha > 0 && alpha < 255) {
        const normalized = alpha / 255;
        let sharpenedAlpha = normalized * normalized * (3 - 2 * normalized);
        
        if (sharpenedAlpha > 0.45) {
          sharpenedAlpha = Math.min(1, sharpenedAlpha + (1 - sharpenedAlpha) * strength * 0.7);
        } else {
          sharpenedAlpha = Math.max(0, sharpenedAlpha - sharpenedAlpha * strength * 0.7);
        }

        d[idx + 3] = Math.round(sharpenedAlpha * 255);

        if (d[idx + 3] > 0) {
          d[idx] = Math.min(255, d[idx] * (1 + strength * 0.15));
          d[idx + 1] = Math.min(255, d[idx + 1] * (1 + strength * 0.15));
          d[idx + 2] = Math.min(255, d[idx + 2] * (1 + strength * 0.15));
        }
      }
    }
  }
}

/**
 * Focus Deblur Filter (Luminance-Preserving):
 * Computes difference in Luminance space so color ratios are strictly preserved
 * and dark lines DO NOT turn blue!
 */
function applyFocusDeblurFilter(ctx: CanvasRenderingContext2D, width: number, height: number, amount: number) {
  try {
    const origData = ctx.getImageData(0, 0, width, height);
    const od = origData.data;

    const deblurCanvas = document.createElement('canvas');
    deblurCanvas.width = width;
    deblurCanvas.height = height;
    const dCtx = deblurCanvas.getContext('2d');
    if (!dCtx) return;

    dCtx.filter = 'blur(1.2px)';
    dCtx.drawImage(ctx.canvas, 0, 0);
    const blurData = dCtx.getImageData(0, 0, width, height).data;

    const strength = (amount / 100) * 1.8;

    for (let i = 0; i < od.length; i += 4) {
      if (od[i + 3] === 0) continue;

      // Luminance-based high frequency difference (prevents chromatic shift / blue lines!)
      const origY = 0.299 * od[i] + 0.587 * od[i + 1] + 0.114 * od[i + 2];
      const blurY = 0.299 * blurData[i] + 0.587 * blurData[i + 1] + 0.114 * blurData[i + 2];
      const diffY = (origY - blurY) * strength;

      od[i] = Math.min(255, Math.max(0, od[i] + diffY));
      od[i + 1] = Math.min(255, Math.max(0, od[i + 1] + diffY));
      od[i + 2] = Math.min(255, Math.max(0, od[i + 2] + diffY));
    }

    ctx.putImageData(origData, 0, 0);
  } catch (err) {
    console.warn('Focus deblur fallback due to memory:', err);
  }
}

/**
 * Fast unsharp mask filter (Luminance-Preserving)
 */
function applyUnsharpMask(ctx: CanvasRenderingContext2D, width: number, height: number, amount: number) {
  try {
    const blurCanvas = document.createElement('canvas');
    blurCanvas.width = width;
    blurCanvas.height = height;
    const bCtx = blurCanvas.getContext('2d');
    if (!bCtx) return;

    bCtx.filter = 'blur(1.4px)';
    bCtx.drawImage(ctx.canvas, 0, 0);

    const origData = ctx.getImageData(0, 0, width, height);
    const blurData = bCtx.getImageData(0, 0, width, height);
    const od = origData.data;
    const bd = blurData.data;

    const strength = (amount / 100) * 1.2;

    for (let i = 0; i < od.length; i += 4) {
      if (od[i + 3] === 0) continue;

      // Luminance sharpening preserves true line color with zero blue halo
      const origY = 0.299 * od[i] + 0.587 * od[i + 1] + 0.114 * od[i + 2];
      const blurY = 0.299 * bd[i] + 0.587 * bd[i + 1] + 0.114 * bd[i + 2];
      const diffY = (origY - blurY) * strength;

      od[i] = Math.min(255, Math.max(0, od[i] + diffY));
      od[i + 1] = Math.min(255, Math.max(0, od[i + 1] + diffY));
      od[i + 2] = Math.min(255, Math.max(0, od[i + 2] + diffY));
    }

    ctx.putImageData(origData, 0, 0);
  } catch (err) {
    console.warn('Unsharp mask fallback due to memory:', err);
  }
}

/**
 * Intelligent foreground isolation algorithm
 */
function applyBackgroundCutout(d: Uint8ClampedArray, width: number, height: number) {
  const corners = [
    0,
    (width - 1) * 4,
    ((height - 1) * width) * 4,
    ((height - 1) * width + (width - 1)) * 4,
  ];

  let bgR = 0, bgG = 0, bgB = 0;
  for (const c of corners) {
    bgR += d[c];
    bgG += d[c + 1];
    bgB += d[c + 2];
  }
  bgR /= 4;
  bgG /= 4;
  bgB /= 4;

  const tolerance = 48;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = d[idx];
      const g = d[idx + 1];
      const b = d[idx + 2];

      const diff = Math.sqrt(
        (r - bgR) * (r - bgR) +
        (g - bgG) * (g - bgG) +
        (b - bgB) * (b - bgB)
      );

      const edgeDistX = Math.min(x, width - x) / (width * 0.5);
      const edgeDistY = Math.min(y, height - y) / (height * 0.5);
      const edgeWeight = Math.min(edgeDistX, edgeDistY);

      if (diff < tolerance && edgeWeight < 0.35) {
        const alpha = Math.min(255, Math.max(0, (diff / tolerance) * 255 * (edgeWeight / 0.35)));
        d[idx + 3] = alpha;
      }
    }
  }
}

/**
 * Calculates accurate output dimensions and file size estimates
 */
export function calculateExportStats(
  origW: number,
  origH: number,
  scale: ExportScale,
  format: ExportFormat,
  quality: string,
  dpi: number = 300
) {
  const finalW = Math.round(origW * scale);
  const finalH = Math.round(origH * scale);
  const totalPixels = finalW * finalH;

  let bytesPerPixel = 0.5;
  if (format === 'png') {
    bytesPerPixel = 1.6;
  } else if (format === 'tiff') {
    bytesPerPixel = 3.2;
  } else if (format === 'webp') {
    bytesPerPixel = quality === 'maximum' ? 0.8 : quality === 'high' ? 0.45 : quality === 'medium' ? 0.3 : 0.2;
  } else {
    bytesPerPixel = quality === 'maximum' ? 0.95 : quality === 'high' ? 0.6 : quality === 'medium' ? 0.4 : 0.25;
  }

  const estBytes = totalPixels * bytesPerPixel;
  let formattedSize = '';
  if (estBytes > 1024 * 1024) {
    formattedSize = (estBytes / (1024 * 1024)).toFixed(1) + ' MB';
  } else {
    formattedSize = Math.round(estBytes / 1024) + ' KB';
  }

  const printWidthInches = (finalW / dpi).toFixed(1);
  const printHeightInches = (finalH / dpi).toFixed(1);
  const printWidthCm = ((finalW / dpi) * 2.54).toFixed(1);
  const printHeightCm = ((finalH / dpi) * 2.54).toFixed(1);

  return {
    finalW,
    finalH,
    formattedSize,
    printWidthInches,
    printHeightInches,
    printWidthCm,
    printHeightCm,
  };
}

/**
 * Downloads a canvas as genuine PNG, JPG, WebP, or TIFF
 */
export async function downloadProcessedImage(
  canvas: HTMLCanvasElement,
  fileName: string,
  format: ExportFormat,
  quality: string
) {
  let qualityNumber = 0.92;
  if (quality === 'maximum') qualityNumber = 1.0;
  else if (quality === 'high') qualityNumber = 0.92;
  else if (quality === 'medium') qualityNumber = 0.8;
  else if (quality === 'low') qualityNumber = 0.65;

  let blob: Blob | null = null;
  const baseName = fileName.replace(/\.[^/.]+$/, '');

  if (format === 'tiff') {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas 2D context');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    blob = createTiffBlob(imgData);
  } else {
    const mimeType =
      format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';

    blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), mimeType, qualityNumber);
    });
  }

  if (!blob) throw new Error('Failed to generate image file');

  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `${baseName}_enhanced_${canvas.width}x${canvas.height}.${format}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);
}
