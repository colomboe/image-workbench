// Functions for managing data in browser local storage

import { ApiKeys } from './model';

const API_KEY_STORAGE_KEY = 'image-workbench-api-key';
const API_KEYS_STORAGE_KEY = 'image-workbench-api-keys';

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

/**
 * Saves multiple API keys to browser local storage
 * @param apiKeys Object containing API keys for different providers
 */
export function saveApiKeys(apiKeys: ApiKeys): void {
  localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(apiKeys));
}

/**
 * Retrieves all API keys from browser local storage
 * @returns The stored API keys object or empty object if not found
 */
export function getApiKeys(): ApiKeys {
  const stored = localStorage.getItem(API_KEYS_STORAGE_KEY);
  if (!stored) {
    // Try to migrate legacy single API key
    const legacyKey = getApiKey();
    if (legacyKey) {
      return { openai: legacyKey };
    }
    return {};
  }
  try {
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

/**
 * Clears all API keys from browser local storage
 */
export function clearApiKeys(): void {
  localStorage.removeItem(API_KEYS_STORAGE_KEY);
}
