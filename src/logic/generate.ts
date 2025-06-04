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
import { snapshot } from "valtio";

// TODO: Uncomment these types when implementing replicate provider
// type ReplicateGenerateImageRequest = {
//     prompt: string;
//     imagesB64: string[];
//     // TODO: Add replicate-specific parameters when implementing
// };

// type ReplicateGenerateImageResponse = 
//     | { type: 'error', message: string }
//     | { type: 'success', imageB64: string, costDollars?: number };

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
        case 'replicate':
            // TODO: Implement replicate provider
            // When implementing, create a ReplicateGenerateImageRequest similar to other providers
            // and handle provider-specific parameters and response format
            outcome = { type: 'error', message: 'Replicate provider not yet implemented' };
            break;
        default:
            outcome = { type: 'error', message: 'Unknown provider selected' };
    }

    return outcome;
}