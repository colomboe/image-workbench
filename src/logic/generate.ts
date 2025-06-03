import { Edge, Node } from "@xyflow/react";
import { AppNode, appState, GeneratedImageNodeData } from "./model";
import { aiGenerateImage as openaiGenerateImage } from "../providers/openai";
import { aiGenerateImage as geminiGenerateImage } from "../providers/gemini";
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

    // Route to the correct provider based on the selected provider
    let outcome;
    const request = {
        prompt: node.data.prompt,
        imagesB64: inputImages,
        inpaintingMaskB64: inpaintingInputImage,
        quality: modelSettings.quality,
        size: modelSettings.size,
        background: modelSettings.background,
    };

    switch (modelSettings.provider) {
        case 'openai':
            outcome = await openaiGenerateImage(request);
            break;
        case 'gemini':
            outcome = await geminiGenerateImage(request);
            break;
        case 'replicate':
            // TODO: Implement replicate provider
            outcome = { type: 'error' as const, message: 'Replicate provider not yet implemented' };
            break;
        default:
            outcome = { type: 'error' as const, message: 'Unknown provider selected' };
    }

    if (outcome.type === 'error')
        return { type: 'error', message: outcome.message };
    else
        return { type: 'success', imageB64: outcome.imageB64, costDollars: outcome.costDollars };
}