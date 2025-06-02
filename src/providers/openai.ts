import OpenAI from "openai";
import { ImagesResponse } from "openai/resources.mjs";
import { Uploadable } from "openai/uploads.mjs";
import { appState } from "../logic/model";
import { getApiKey } from "../logic/local-storage";

export interface GenerateImageRequest {
    prompt: string,
    imagesB64: string[],
    inpaintingMaskB64: string | undefined,
    quality: 'low' | 'medium' | 'high',
    size: '1024x1024' | '1536x1024' | '1024x1536',
    background: 'transparent' | 'opaque' | 'auto',
}

export type GenerateImageResponse =
    | { type: 'error', message: string }
    | { type: 'success', imageB64: string, costDollars: number | undefined };

export interface GeneratedImage {
    b64: string,
    costDollars: number | undefined,
}

export async function aiGenerateImage(generateImageRequest: GenerateImageRequest): Promise<GenerateImageResponse> {
    const { quality, size, background } = generateImageRequest;
    
    // Get API key from app state or local storage
    const apiKey = appState.modelSettings.apiKey || getApiKey();
    
    if (!apiKey) {
        return { 
            type: 'error', 
            message: 'OpenAI API key not configured. Click the API key button in the toolbar to set it.'
        };
    }
    
    // Create the client with the current API key
    const client = new OpenAI({
        dangerouslyAllowBrowser: true,
        timeout: 3 * 60 * 1000,
        apiKey,
    });
    
    let response: ImagesResponse
    try {
        if (generateImageRequest.imagesB64.length > 0) {
            response = await client.images.edit({
                model: 'gpt-image-1',
                prompt: generateImageRequest.prompt,
                quality: quality,
                image: generateImageRequest.imagesB64.map(base64toUploadable),
                mask: generateImageRequest.inpaintingMaskB64 ? base64toUploadable(generateImageRequest.inpaintingMaskB64) : undefined,
            });
        }
        else {
            response = await client.images.generate({
                model: 'gpt-image-1',
                prompt: generateImageRequest.prompt,
                quality: quality,
                output_format: 'png',
                response_format: 'b64_json',
                size: size,
                background: background,
            });
        }
    } catch (error: any) {
        return {
            type: 'error',
            message: error.message || 'Failed to generate image'
        };
    }

    const usage = response.usage;
    let costDollars = undefined
    if (usage) {
        const inputTextTokenCost = usage.input_tokens_details.text_tokens * 0.000005;
        const inputImageTokenCost = usage.input_tokens_details.image_tokens * 0.00001;
        const outputImageTokenCost = usage.output_tokens * 0.00004;
        costDollars = inputTextTokenCost + inputImageTokenCost + outputImageTokenCost;
    }

    console.log(response);

    const b64 = response.data![0].b64_json!;
    return { type: 'success', imageB64: b64, costDollars };
}

// Convert base64 string to File, which is accepted as Uploadable by OpenAI SDK
function base64toUploadable(b64: string): Uploadable {
    const prefix = 'data:image/png;base64,';
    const cleanBase64 = b64.startsWith(prefix) ? b64.slice(prefix.length) : b64;
    const binary = atob(cleanBase64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return new File([bytes], 'image.png', { type: 'image/png', lastModified: Date.now() });
}
