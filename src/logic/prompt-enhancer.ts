import { geminiGenerateText } from '../providers/gemini';

export async function enhancePrompt(originalPrompt: string) {
    if (!originalPrompt.trim()) {
        return {
            type: 'error' as const,
            message: 'Please provide a prompt to enhance.'
        };
    }

    const enhancementPrompt = `You are an expert prompt engineer for image generation. Your task is to rewrite and improve the following prompt for better image generation results.

Requirements:
- Rewrite the prompt in clear, detailed English
- Focus on visual details, style, composition, and artistic elements
- Keep the core concept but enhance the description
- Your response must contain ONLY the improved prompt text
- Do not include any explanations, prefixes, quotes, or additional text
- Do not say "Enhanced prompt:" or similar - just provide the improved prompt directly

Original prompt: "${originalPrompt}"`;

    const response = await geminiGenerateText({
        prompt: enhancementPrompt
    });

    if (response.type === 'error') {
        return {
            type: 'error' as const,
            message: response.message
        };
    }

    const enhancedPrompt = response.text.trim();

    return {
        type: 'success' as const,
        enhancedPrompt
    };
}
