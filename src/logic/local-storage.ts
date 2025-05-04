// Functions for managing data in browser local storage

const API_KEY_STORAGE_KEY = 'image-workbench-api-key';

/**
 * Saves the API key to browser local storage
 * @param apiKey The OpenAI API key to store
 */
export function saveApiKey(apiKey: string): void {
  localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
}

/**
 * Retrieves the API key from browser local storage
 * @returns The stored API key or undefined if not found
 */
export function getApiKey(): string | null {
  return localStorage.getItem(API_KEY_STORAGE_KEY);
}

/**
 * Clears the API key from browser local storage
 */
export function clearApiKey(): void {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
}
