import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper to get Gemini client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Clean base64 helper
function extractBase64Data(dataUrl: string): { data: string; mimeType: string } {
  const match = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (match) {
    return { mimeType: match[1], data: match[2] };
  }
  return { mimeType: 'image/png', data: dataUrl };
}

// Helper to detect quota limits (e.g. 429 RESOURCE_EXHAUSTED or limit: 0 on free tier)
function isQuotaOrResourceError(error: any): boolean {
  if (!error) return false;
  const status = error.status || error.code || error?.error?.code;
  const message = (error.message || (typeof error === 'string' ? error : JSON.stringify(error))).toLowerCase();
  return (
    status === 429 ||
    status === 'RESOURCE_EXHAUSTED' ||
    message.includes('429') ||
    message.includes('quota') ||
    message.includes('resource_exhausted') ||
    message.includes('limit: 0') ||
    message.includes('rate-limit')
  );
}

// 1. AI Photo Enhance Pro API
app.post('/api/ai/enhance', async (req, res) => {
  try {
    const { image, mode = 'general', quality = 'high', preserveBackground = true, settings = {} } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Missing image data' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        success: false,
        fallbackToClient: true,
        message: 'No GEMINI_API_KEY configured. Applying high-definition client canvas enhancement engine.',
      });
    }

    const { data: base64Data, mimeType } = extractBase64Data(image);

    let enhancementPrompt = 'Enhance this image with ultra high quality professional photography grading.';
    if (preserveBackground) {
      enhancementPrompt += ' CRITICAL: You MUST preserve the original background and its exact composition. Do not blur, replace, crop, or turn the background transparent.';
    }

    if (mode === 'portrait') {
      enhancementPrompt += ' Gently smooth facial skin, remove blemishes and spots while keeping natural skin texture, brighten eyes and teeth naturally, and refine subtle details without over-processing.';
    } else if (mode === 'png-shape') {
      enhancementPrompt += ' This is a PNG shape / logo / vector graphic. Convert it to ultra HD quality with razor-sharp vector-like edges, smooth anti-aliasing without jagged pixels, and vivid pure colours.';
    } else if (mode === 'graphics') {
      enhancementPrompt += ' This is a graphic design / floral invitation / border ornament. Prioritize line sharpness, vector-like crisp edges, vivid color accuracy, and delicate ornament preservation without face retouching.';
    } else {
      enhancementPrompt += ` Enhance sharpness, clarity, dynamic range, micro-contrast, and reduce image noise.`;
    }

    if (settings.deblurAmount && settings.deblurAmount > 30) {
      enhancementPrompt += ' Focus deblur: Reconstruct crisp lost focal details and eliminate motion blur or camera shake.';
    }
    if (settings.backgroundBlur && settings.backgroundBlur > 20) {
      enhancementPrompt += ' Apply a smooth DSLR depth-of-field bokeh lens blur to the background while keeping the main subject razor-sharp.';
    }
    if (settings.hdrColorBoost && settings.hdrColorBoost > 20) {
      enhancementPrompt += ' Boost vibrant HDR colors, dynamic color pop, rich contrast, and cinematic color correction.';
    }

    let generatedImageUrl: string | null = null;
    let descriptionText = '';

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType || 'image/jpeg',
              },
            },
            {
              text: enhancementPrompt,
            },
          ],
        },
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData?.data) {
            generatedImageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          } else if (part.text) {
            descriptionText += part.text;
          }
        }
      }
    } catch (modelError: any) {
      if (isQuotaOrResourceError(modelError)) {
        console.warn('[Gemini Quota Notice] Free-tier limit reached for image model (429). Seamlessly applying local Pro Canvas Studio Engine.');
        // Run lightweight diagnostic with free-tier gemini-3.8-flash text model if available
        try {
          const analysisResp = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: {
              parts: [
                {
                  inlineData: {
                    data: base64Data,
                    mimeType: mimeType || 'image/jpeg',
                  },
                },
                {
                  text: 'In 1 concise sentence, assess the sharpness, dynamic range, and texture quality of this photo.',
                },
              ],
            },
          });
          descriptionText = analysisResp.text || 'Visual assessment complete.';
        } catch {
          descriptionText = 'Image parameters analyzed. High-definition canvas enhancement calibrated.';
        }
      } else {
        console.warn('[Enhance API Notice]:', modelError?.message || modelError);
      }
    }

    if (generatedImageUrl) {
      return res.json({
        success: true,
        enhancedImage: generatedImageUrl,
        description: descriptionText,
      });
    } else {
      // Return guidance for client canvas filter processor
      return res.json({
        success: false,
        fallbackToClient: true,
        description: descriptionText || 'AI visual assessment complete. Pro Canvas filter refinement applied.',
      });
    }
  } catch (error: any) {
    if (isQuotaOrResourceError(error)) {
      console.warn('[Gemini Quota] Free tier quota reached, fallback to client canvas.');
    } else {
      console.warn('[Enhance API Warning]:', error?.message || error);
    }
    return res.status(200).json({
      success: false,
      fallbackToClient: true,
      error: 'Free-tier quota limit reached for image generation. Enhanced via Pro Studio Canvas.',
    });
  }
});

// 2. Background Remover API
app.post('/api/ai/remove-background', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Missing image data' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        success: false,
        fallbackToClient: true,
        message: 'No GEMINI_API_KEY. Using client edge-detection cutout algorithm.',
      });
    }

    const { data: base64Data, mimeType } = extractBase64Data(image);
    let generatedImageUrl: string | null = null;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType || 'image/jpeg',
              },
            },
            {
              text: 'Isolate the main foreground subject with clean razor-sharp cutout edges and remove the background completely. Return the cutout with transparent background.',
            },
          ],
        },
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData?.data) {
            generatedImageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            break;
          }
        }
      }
    } catch (modelError: any) {
      if (isQuotaOrResourceError(modelError)) {
        console.warn('[Gemini Quota Notice] Free-tier limit reached for image model (429). Using client alpha cutout algorithm.');
      } else {
        console.warn('[Background Removal Notice]:', modelError?.message || modelError);
      }
    }

    return res.json({
      success: Boolean(generatedImageUrl),
      fallbackToClient: !generatedImageUrl,
      cutoutImage: generatedImageUrl,
    });
  } catch (error: any) {
    if (isQuotaOrResourceError(error)) {
      console.warn('[Gemini Quota] Free tier limit reached, using client alpha cutout.');
    } else {
      console.warn('[Background removal error]:', error?.message || error);
    }
    return res.json({
      success: false,
      fallbackToClient: true,
      error: 'Using local edge cutout engine',
    });
  }
});

// 3. AI Object Remover API
app.post('/api/ai/object-remove', async (req, res) => {
  try {
    const { image, maskPrompt = 'remove the highlighted object and smoothly inpaint background' } = req.body;
    if (!image) return res.status(400).json({ error: 'Missing image data' });

    const ai = getGeminiClient();
    if (!ai) return res.json({ success: false, fallbackToClient: true });

    const { data: base64Data, mimeType } = extractBase64Data(image);
    let resultImage: string | null = null;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: mimeType || 'image/jpeg' } },
            { text: `Seamlessly remove unwanted objects and inpaint the texture realistically: ${maskPrompt}` },
          ],
        },
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData?.data) {
            resultImage = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            break;
          }
        }
      }
    } catch (modelError: any) {
      if (isQuotaOrResourceError(modelError)) {
        console.warn('[Gemini Quota Notice] Free-tier limit reached for image model. Using local patch inpainting.');
      } else {
        console.warn('[Object Remove Notice]:', modelError?.message || modelError);
      }
    }

    return res.json({ success: Boolean(resultImage), resultImage });
  } catch (error: any) {
    if (isQuotaOrResourceError(error)) {
      console.warn('[Gemini Quota] Object remove fallback.');
    } else {
      console.warn('[Object remove error]:', error?.message || error);
    }
    return res.json({ success: false, fallbackToClient: true, error: error?.message });
  }
});

// 4. Old Photo Restoration API
app.post('/api/ai/restore', async (req, res) => {
  try {
    const { image, colorize = true } = req.body;
    if (!image) return res.status(400).json({ error: 'Missing image data' });

    const ai = getGeminiClient();
    if (!ai) return res.json({ success: false, fallbackToClient: true });

    const { data: base64Data, mimeType } = extractBase64Data(image);
    const restorePrompt = `Carefully restore this historical vintage photograph: eliminate cracks, scratches, dust, tear marks, and aged fading. Revive facial sharpness and depth.${
      colorize ? ' Gently colorize with authentic natural period-accurate colors.' : ' Preserve authentic monochrome sepia/greyscale tonality with deep contrast.'
    }`;

    let restoredImage: string | null = null;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: mimeType || 'image/jpeg' } },
            { text: restorePrompt },
          ],
        },
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData?.data) {
            restoredImage = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            break;
          }
        }
      }
    } catch (modelError: any) {
      if (isQuotaOrResourceError(modelError)) {
        console.warn('[Gemini Quota Notice] Free-tier limit reached for image model. Using client vintage restoration filter.');
      } else {
        console.warn('[Restore Notice]:', modelError?.message || modelError);
      }
    }

    return res.json({ success: Boolean(restoredImage), restoredImage });
  } catch (error: any) {
    if (isQuotaOrResourceError(error)) {
      console.warn('[Gemini Quota] Restore fallback.');
    } else {
      console.warn('[Restore error]:', error?.message || error);
    }
    return res.json({ success: false, fallbackToClient: true, error: error?.message });
  }
});

// 5. AI Image Generator API
app.post('/api/ai/generate', async (req, res) => {
  try {
    const { prompt, aspectRatio = '1:1' } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(200).json({ success: false, error: 'GEMINI_API_KEY is not configured in environment.' });
    }

    let generatedImageUrl: string | null = null;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
          },
        },
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData?.data) {
            generatedImageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            break;
          }
        }
      }
    } catch (modelError: any) {
      if (isQuotaOrResourceError(modelError)) {
        console.warn('[Gemini Quota Notice] Free-tier limit reached for image model (429).');
        return res.status(200).json({
          success: false,
          quotaExceeded: true,
          error: 'Free-tier daily quota limit reached for cloud image generator. You can upload an image or choose from sample projects.',
        });
      } else {
        console.warn('[Image Generation Notice]:', modelError?.message || modelError);
      }
    }

    if (generatedImageUrl) {
      return res.json({ success: true, imageUrl: generatedImageUrl });
    }
    return res.status(200).json({ success: false, error: 'No image was generated by model.' });
  } catch (error: any) {
    if (isQuotaOrResourceError(error)) {
      console.warn('[Gemini Quota] Image generator quota reached.');
      return res.status(200).json({
        success: false,
        quotaExceeded: true,
        error: 'Free-tier quota limit reached for cloud image generator.',
      });
    }
    console.warn('[Generate Error]:', error?.message || error);
    return res.status(200).json({ success: false, error: error?.message || 'Image generation failed' });
  }
});

// 6. AI Upscaler API
app.post('/api/ai/upscale', async (req, res) => {
  try {
    const { image, scale = 2 } = req.body;
    if (!image) return res.status(400).json({ error: 'Missing image data' });

    const ai = getGeminiClient();
    if (!ai) return res.json({ success: false, fallbackToClient: true });

    const { data: base64Data, mimeType } = extractBase64Data(image);
    const upscalePrompt = `Perform super-resolution AI upscaling (${scale}x). Reconstruct micro-details, ultra-sharp edge fidelity, and eliminate compression artifacts while retaining the exact original composition and textures.`;

    let upscaledImage: string | null = null;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: mimeType || 'image/jpeg' } },
            { text: upscalePrompt },
          ],
        },
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData?.data) {
            upscaledImage = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            break;
          }
        }
      }
    } catch (modelError: any) {
      if (isQuotaOrResourceError(modelError)) {
        console.warn('[Gemini Quota Notice] Free-tier limit reached for image model. Using Pro Canvas super-resolution.');
      } else {
        console.warn('[Upscale Notice]:', modelError?.message || modelError);
      }
    }

    return res.json({ success: Boolean(upscaledImage), upscaledImage, fallbackToClient: !upscaledImage });
  } catch (error: any) {
    if (isQuotaOrResourceError(error)) {
      console.warn('[Gemini Quota] Upscale fallback.');
    } else {
      console.warn('[Upscale error]:', error?.message || error);
    }
    return res.json({ success: false, fallbackToClient: true, error: error?.message });
  }
});

// Mount Vite or static server
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

export default app;

if (!process.env.VERCEL) {
  startServer();
}
