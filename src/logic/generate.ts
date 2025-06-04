import { Edge, Node } from "@xyflow/react";
import { AppNode, appState, GeneratedImageNodeData } from "./model";
import { 
    openaiGenerateImage, 
    OpenAIGenerateImageRequest,
    OpenAIGenerateImageResponse
} from "../providers/openai";
import { 
    geminiGenerateImage,
    GeminiGenerateImageRequest,
    GeminiGenerateImageResponse
} from "../providers/gemini";
import { 
    replicateGenerateImage,
    ReplicateGenerateImageRequest,
    ReplicateGenerateImageResponse
} from "../providers/replicate";
import { snapshot } from "valtio";

export type GenerateImageResult = 
    | { type: 'error', message: string }
    | { type: 'success', imageB64: string, costDollars: number | undefined };

export async function executeImageGeneration(nodeId: string, nodes: AppNode[], edges: Edge[]): Promise<GenerateImageResult> {

    const node = nodes
        .filter((node) => node.type === 'generated-image')
        .find((node) => node.id === nodeId) as Node<GeneratedImageNodeData, 'generated-image'>;

    if (!node) throw new Error(`Node with id ${nodeId} not found`);
    
    const connectedNodes = edges
        .filter((edge) => edge.target === nodeId)
        .map((edge) => nodes.find((node) => node.id === edge.source));

    const inpainitingNodes = connectedNodes
        .filter((node) => node?.type === 'inpainting')
        .filter((node) => node !== undefined) as AppNode[];

    if (inpainitingNodes.length > 1) {
        return { type: 'error', message: 'Only one inpainting node is allowed' };
    }

    const inputConnectedImages = connectedNodes
        .filter((node) => node?.type === 'provided-image' || node?.type === 'generated-image')
        .map((node) => node?.data.imageB64)
        .filter((image) => image !== undefined) as string[];

    const inputImagesFromInpaiting = inpainitingNodes
        .map((node) => node.data.imageB64)
        .filter((image) => image !== undefined) as string[];
    
    const inputImagesFromInpaitingSource = inpainitingNodes
        .map((node) => edges.find((edge) => edge.target === node.id))
        .map((edge) => nodes.find((node) => node.id === edge?.source))
        .filter((node) => node?.type === 'provided-image' || node?.type === 'generated-image')
        .map((node) => node?.data.imageB64)
        .filter((image) => image !== undefined) as string[];

    const inputImages = [
        ...inputImagesFromInpaitingSource,
        ...inputConnectedImages,
    ];

    const inpaintingInputImage = inputImagesFromInpaiting.length > 0 ? inputImagesFromInpaiting[0] : undefined;

    // Import appState to get the modelSettings
    const { modelSettings } = snapshot(appState);

    // Route to the correct provider based on the selected provider and create provider-specific requests
    let outcome: GenerateImageResult;

    switch (modelSettings.provider) {
        case 'openai': {
            const openaiRequest: OpenAIGenerateImageRequest = {
                prompt: node.data.prompt,
                imagesB64: inputImages,
                inpaintingMaskB64: inpaintingInputImage,
                quality: modelSettings.quality,
                size: modelSettings.size,
                background: modelSettings.background,
            };
            const openaiResponse: OpenAIGenerateImageResponse = await openaiGenerateImage(openaiRequest);
            
            if (openaiResponse.type === 'error') {
                outcome = { type: 'error', message: openaiResponse.message };
            } else {
                outcome = { 
                    type: 'success', 
                    imageB64: openaiResponse.imageB64, 
                    costDollars: openaiResponse.costDollars 
                };
            }
            break;
        }
        case 'gemini': {
            // Gemini doesn't support inpainting
            if (inpaintingInputImage) {
                outcome = { 
                    type: 'error', 
                    message: 'Gemini does not support inpainting. Please disconnect any inpainting nodes or switch to OpenAI provider.' 
                };
                break;
            }
            
            const geminiRequest: GeminiGenerateImageRequest = {
                prompt: node.data.prompt,
                imagesB64: inputImages,
            };
            const geminiResponse: GeminiGenerateImageResponse = await geminiGenerateImage(geminiRequest);
            
            if (geminiResponse.type === 'error') {
                outcome = { type: 'error', message: geminiResponse.message };
            } else {
                outcome = { 
                    type: 'success', 
                    imageB64: geminiResponse.imageB64, 
                    costDollars: undefined // Gemini doesn't provide cost information
                };
            }
            break;
        }
        case 'replicate': {
            // Replicate doesn't support inpainting
            if (inpaintingInputImage) {
                outcome = { 
                    type: 'error', 
                    message: 'Replicate does not support inpainting. Please disconnect any inpainting nodes or switch to OpenAI provider.' 
                };
                break;
            }
            
            // Replicate flux-kontext models accept only one input image for editing
            if (inputImages.length > 1) {
                outcome = { 
                    type: 'error', 
                    message: 'Replicate editing models accept only one input image. Please connect only one image node for editing.' 
                };
                break;
            }
            
            const replicateRequest: ReplicateGenerateImageRequest = {
                prompt: node.data.prompt,
                imagesB64: inputImages,
                editingModel: modelSettings.replicateEditingModel,
                generationModel: modelSettings.replicateGenerationModel,
            };
            const replicateResponse: ReplicateGenerateImageResponse = await replicateGenerateImage(replicateRequest);
            
            if (replicateResponse.type === 'error') {
                outcome = { type: 'error', message: replicateResponse.message };
            } else {
                outcome = { 
                    type: 'success', 
                    imageB64: replicateResponse.imageB64, 
                    costDollars: undefined // Replicate doesn't provide cost information
                };
            }
            break;
        }
        default:
            outcome = { type: 'error', message: 'Unknown provider selected' };
    }

    return outcome;
}