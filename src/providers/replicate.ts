import Replicate from "replicate";
import { appState } from "../logic/model";

export interface ReplicateGenerateImageRequest {
    prompt: string,
    imagesB64: string[],
    editingModel: 'flux-kontext-pro' | 'flux-kontext-max',
    generationModel: 'flux-schnell' | 'flux-1.1-pro' | 'flux-1.1-pro-ultra',
}

export type ReplicateGenerateImageResponse =
    | { type: 'error', message: string }
    | { type: 'success', imageB64: string };

export async function replicateGenerateImage(generateImageRequest: ReplicateGenerateImageRequest): Promise<ReplicateGenerateImageResponse> {
    const { prompt, imagesB64, editingModel, generationModel } = generateImageRequest;
    
    // Get API key from app state
    const apiKey = appState.modelSettings.apiKeys?.replicate;
    
    if (!apiKey) {
        return { 
            type: 'error', 
            message: 'Replicate API key not configured. Click the API key button in the toolbar to set it.'
        };
    }

    try {
        const replicate = new Replicate({
            auth: apiKey,
        });

        let modelId: string;
        let input: any;

        if (imagesB64.length > 0) {
            // Image editing mode
            if (imagesB64.length > 1) {
                return {
                    type: 'error',
                    message: 'Replicate editing models accept only one input image. Please connect only one image.'
                };
            }

            // Use editing model
            modelId = editingModel === 'flux-kontext-max' 
                ? "black-forest-labs/flux-kontext-max"
                : "black-forest-labs/flux-kontext-pro";

            input = {
                prompt: prompt,
                output_format: "png",
                image: `data:image/png;base64,${imagesB64[0]}`
            };
        } else {
            // Image generation mode
            // Map generation model to actual model IDs
            switch (generationModel) {
                case 'flux-schnell':
                    modelId = "black-forest-labs/flux-schnell";
                    break;
                case 'flux-1.1-pro':
                    modelId = "black-forest-labs/flux-1.1-pro";
                    break;
                case 'flux-1.1-pro-ultra':
                    modelId = "black-forest-labs/flux-1.1-pro-ultra";
                    break;
                default:
                    modelId = "black-forest-labs/flux-schnell";
            }

            input = {
                prompt: prompt,
                output_format: "png"
            };
        }

        // Run the prediction
        const output = await replicate.run(modelId as `${string}/${string}`, { input });

        // Handle the response
        if (Array.isArray(output) && output.length > 0) {
            const imageUrl = output[0];
            
            // Fetch the image and convert to base64
            const response = await fetch(imageUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.statusText}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            let binaryString = '';
            for (let i = 0; i < uint8Array.length; i++) {
                binaryString += String.fromCharCode(uint8Array[i]);
            }
            const base64 = btoa(binaryString);
            
            return {
                type: 'success',
                imageB64: base64
            };
        } else {
            return {
                type: 'error',
                message: 'No image generated from Replicate API'
            };
        }

    } catch (error: any) {
        console.error('Replicate API error:', error);
        
        // Handle specific error types
        if (error.message?.includes('authentication')) {
            return {
                type: 'error',
                message: 'Invalid Replicate API key. Please check your API key configuration.'
            };
        }
        
        if (error.message?.includes('quota') || error.message?.includes('billing')) {
            return {
                type: 'error',
                message: 'Replicate API quota exceeded or billing issue. Please check your account.'
            };
        }
        
        return {
            type: 'error',
            message: `Replicate API error: ${error.message || 'Unknown error occurred'}`
        };
    }
}