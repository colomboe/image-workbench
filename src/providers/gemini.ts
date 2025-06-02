import { ContentListUnion, GoogleGenAI, Modality } from '@google/genai';
import { appState } from '../logic/model';

export interface GenerateImageRequest {
    prompt: string;
    imagesB64: string[];
    inpaintingMaskB64: string | undefined;
    quality: 'low' | 'medium' | 'high';
    size: '1024x1024' | '1536x1024' | '1024x1536';
    background: 'transparent' | 'opaque' | 'auto';
}

export type GenerateImageResponse =
    | { type: 'error'; message: string }
    | { type: 'success'; imageB64: string; costDollars: number | undefined };

export interface GeneratedImage {
    b64: string;
    costDollars: number | undefined;
}

/**
 * Generate or edit an image using Gemini API via @google/genai.
 */
export async function aiGenerateImage(
    request: GenerateImageRequest
): Promise<GenerateImageResponse> {
    
    // Retrieve API key from new structure or fallback to legacy
    const apiKey = appState.modelSettings.apiKeys?.gemini;
    if (!apiKey) {
        return {
            type: 'error',
            message: 'Gemini API key not configured. Click the API key button in the toolbar to set it.'
        };
    }

    const ai = new GoogleGenAI({ apiKey });

    // const models = await ai.models.list();
    // console.log("Gemini models:", models.page);

    const contents: ContentListUnion = [
        { text: request.prompt },
        ...request.imagesB64.map((b64) => ({
            inlineData: {
                data: b64,
                mimeType: 'image/png',
            },
        })),
    ];

    // Initialize Gemini image generation client
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-preview-image-generation',
        contents,
        config: {
            responseModalities: [Modality.TEXT, Modality.IMAGE],
        }
    });

    console.log("Gemini response:", response);

    const b64 = response.candidates?.[0].content?.parts
        ?.find(p => p.inlineData)
        ?.inlineData
        ?.data;
    
    if (!b64) {
        return {
            type: 'error',
            message: 'No image data found in Gemini response.'
        };
    }

    return { type: 'success', imageB64: b64, costDollars: undefined };
}
