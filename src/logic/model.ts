import { proxy, snapshot } from 'valtio'
import {Edge, Node, ReactFlowInstance} from '@xyflow/react';
import { v4 } from 'uuid';
import { loadJsonFile, saveJsonFile, saveBase64PngFile, selectDirectory } from './persistence';
import { showToast } from './toast-bridge';
import { executeImageGeneration } from './generate';
import { getApiKey, saveApiKey, clearApiKey as clearApiKeyFromStorage } from './local-storage';
import { arrayBufferToBase64, getImageSize } from './image-utils';

export type NodeType =
    | 'provided-image'
    | 'generated-image'
    | 'inpainting';

export interface ProvidedImageNodeData extends Record<string, unknown> {
    type: 'provided-image',
    name: string,
    imageB64: string,
    width: number;
    height: number;
}

export interface InpaintingNodeData extends Record<string, unknown> {
    type: 'inpainting',
    name: string,
    imageB64: string,
    width: number;
    height: number;
}

export interface GeneratedImageNodeData extends Record<string, unknown> {
    type: 'generated-image';
    prompt: string,
    name: string,
    imageB64?: string,
    status: 'prompt' | 'processing' | 'completed',
    costDollars: number | undefined;
    width?: number;
    height?: number;
}

export type NodeData =
    | ProvidedImageNodeData
    | GeneratedImageNodeData
    | InpaintingNodeData;

export type AppNode = Node<NodeData, NodeType>;

export interface InpainterState {
    visible: boolean,
    blockId: string | undefined,
    imageB64: string | undefined,
}

export interface ModelSettings {
    quality: 'low' | 'medium' | 'high';
    size: '1024x1024' | '1536x1024' | '1024x1536';
    background: 'transparent' | 'opaque' | 'auto';
    apiKey?: string;
}

export interface AppState {
    nodes: AppNode[],
    edges: Edge[],
    inpainter: InpainterState,
    modelSettings: ModelSettings,
    reactFlowInstance: ReactFlowInstance<AppNode, Edge> | undefined,
}

export const appState = proxy<AppState>({
    nodes: [],
    edges: [],
    inpainter: {
        visible: false,
        blockId: undefined,
        imageB64: undefined
    },
    modelSettings: {
        quality: 'medium',
        size: '1024x1024',
        background: 'auto',
        apiKey: getApiKey() ?? undefined,
    },
    reactFlowInstance: undefined,
});

export async function resetState() {
    await selectDirectory();
    appState.nodes = [];
    appState.edges = [];
    persistState();
}

export async function loadState() {
    await selectDirectory();
    const loadedState = await loadJsonFile("workbench.json");
    if (loadedState) {
        appState.nodes = loadedState.nodes;
        appState.edges = loadedState.edges;
        appState.reactFlowInstance?.fitView();
    }
}

export async function persistState() {
    
    appState.nodes
        .filter(node => node.data.imageB64 !== undefined)
        .forEach(async node => {
            const data = node.data as { imageB64: string, name: string };
            const sanitized = data.name.replace(/[^\w\-]/g, '_');
            await saveBase64PngFile(`${sanitized}.png`, data.imageB64!);
        });

    
    await saveJsonFile("workbench.json", snapshot(appState));
    showToast('Project saved!', 3000);
}

/**
 * Creates a node for an imported PNG image.
 */
export async function createProvidedImageNode(name: string, imageB64: string) {
    if (!appState.reactFlowInstance) return;
    const { width, height } = await getImageSize(imageB64);
    const id = v4();
    const node: Node<ProvidedImageNodeData, 'provided-image'> = {
        id,
        type: 'provided-image',
        width,
        height,
        resizing: true,
        position: { x: 0, y: 0 },
        data: { type: 'provided-image', name, imageB64, width, height },
    };
    appState.nodes.push(node);
}

export function createGeneratedImageNode() {
    if (!appState.reactFlowInstance) return;
    const id = v4();
    const node: Node<GeneratedImageNodeData, 'generated-image'> = {
        id,
        type: 'generated-image',
        width: 400,
        height: 300,
        resizing: true,
        position: { x: 0, y: 0 },
        data: {
            type: 'generated-image',
            status: 'prompt',
            prompt: '',
            name: v4(),
            imageB64: undefined,
            costDollars: 0,
            width: undefined,
            height: undefined,
        }
    };
    appState.nodes.push(node);
}

export function getUpdatableData<T extends NodeData>(id: string, type: T['type']): T {
    const node = appState.nodes.find(n => n.id === id);
    if (!node) {
        throw new Error(`Node with id ${id} not found`);
    }
    if (node.type !== type) {
        throw new Error(`Node with id ${id} is not of type ${type}`);
    }
    return node.data as T;
}

export function deriveInpainting(blockId: string) {
    
    const block = appState.nodes.find((node) => node.id === blockId);
    if (!block?.data.imageB64) {
        throw new Error(`Node with id ${blockId} does not have an image`);
    }
    
    const id = v4();
    const node: Node<InpaintingNodeData, 'inpainting'> = {
        id,
        type: 'inpainting',
        width: block.width,
        height: block.height,
        resizing: true,
        position: { x: 0, y: 0 },
        data: { type: 'inpainting', name: v4(), imageB64: block.data.imageB64!, width: block.data.width!, height: block.data.height! },
    };
    appState.nodes.push(node);
}

export function updateInpaintingMask(blockId: string, maskB64: string) {
    const block = appState.nodes.find((node) => node.id === blockId);
    if (!isInpaintingNode(block)) {
        throw new Error(`Node with id ${blockId} is not an inpainting node`);
    }
    block.data.imageB64 = maskB64;
}

export async function generateImage(blockId: string) {
    const block = appState.nodes.find((node) => node.id === blockId);
    if (!isGeneratedImageNode(block)) {
        throw new Error(`Node with id ${blockId} is not a generated image node`);
    }
    block.data.status = 'processing';
    const outcome = await executeImageGeneration(blockId, appState.nodes, appState.edges);
    if (outcome.type === 'error') {
        block.data.status = 'prompt';
        showToast(`Error: ${outcome.message}`, 5000);
    }
    else if (outcome.type === 'success') {
        const { width, height } = await getImageSize(outcome.imageB64);
        block.width = width;
        block.height = height;
        block.data.imageB64 = outcome.imageB64;
        block.data.costDollars = outcome.costDollars;
        block.data.width = width;
        block.data.height = height;
        block.data.status = 'completed';
    }
}

function isGeneratedImageNode(block: AppNode | undefined): block is Node<GeneratedImageNodeData, 'generated-image'> {
    return block?.type === 'generated-image';
}

function isInpaintingNode(block: AppNode | undefined): block is Node<InpaintingNodeData, 'inpainting'> {
    return block?.type === 'inpainting';
}

export async function importImageNode() {
    if (!window.showOpenFilePicker) {
        throw new Error('File Picker API is not supported in this browser.');
    }
    const [fileHandle] = await window.showOpenFilePicker({
        types: [{ description: 'PNG Images', accept: { 'image/png': ['.png'] } }],
        multiple: false,
    });
    const file = await fileHandle.getFile();
    if (file.type !== 'image/png') {
        throw new Error('Selected file is not a PNG image');
    }
    const arrayBuffer = await file.arrayBuffer();
    const b64 = arrayBufferToBase64(arrayBuffer);
    const name = file.name.replace(/\.png$/i, '');
    await createProvidedImageNode(name, b64);
}

export function loadApiKeyFromStorage() {
    const storedApiKey = getApiKey();
    if (storedApiKey) {
        appState.modelSettings.apiKey = storedApiKey;
    }
}

export function setApiKey(apiKey: string) {
    appState.modelSettings.apiKey = apiKey;
    saveApiKey(apiKey);
    showToast('API key saved!', 3000);
}

export function clearApiKey() {
    appState.modelSettings.apiKey = undefined;
    clearApiKeyFromStorage();
    showToast('API key cleared!', 3000);
}
