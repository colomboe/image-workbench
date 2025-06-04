import { ContentListUnion, GoogleGenAI, Modality } from '@google/genai';
import { appState } from '../logic/model';

export interface GeminiGenerateImageRequest {
    prompt: string;
    imagesB64: string[];
}

export type GeminiGenerateImageResponse =
    | { type: 'error'; message: string }
    | { type: 'success'; imageB64: string };

/**
 * Generate or edit an image using Gemini API via @google/genai.
 */
export async function geminiGenerateImage(
    request: GeminiGenerateImageRequest
): Promise<GeminiGenerateImageResponse> {
    
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

    return { type: 'success', imageB64: b64 };
}

export interface GeminiGenerateTextRequest {
    prompt: string;
}

export type GeminiGenerateTextResponse =
    | { type: 'error'; message: string }
    | { type: 'success'; text: string };

/**
 * Generate text using Gemini LLM API.
 */
export async function geminiGenerateText(
    request: GeminiGenerateTextRequest
): Promise<GeminiGenerateTextResponse> {
    
    // Retrieve API key from new structure or fallback to legacy
    const apiKey = appState.modelSettings.apiKeys?.gemini;
    if (!apiKey) {
        return {
            type: 'error',
            message: 'Gemini API key not configured. Click the API key button in the toolbar to set it.'
        };
    }

    const ai = new GoogleGenAI({ apiKey });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [{ text: request.prompt }],
        });

        const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!text) {
            return {
                type: 'error',
                message: 'No text response found in Gemini response.'
            };
        }

        return { type: 'success', text };
    } catch (error) {
        return {
            type: 'error',
            message: `Gemini API error: ${error instanceof Error ? error.message : String(error)}`
        };
    }
}

