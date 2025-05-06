// TypeScript declaration for File System Access API (Chromium-based browsers)
declare global {
  interface Window {
    showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
    showOpenFilePicker?: (options?: any) => Promise<any>;
  }
}

// Persistence system using the File System Access API
// Allows saving and loading JSON files by filename in a user-selected directory

let directoryHandle: FileSystemDirectoryHandle | null = null;

/**
 * Prompts the user to select a directory for storing files.
 * @returns The name of the selected directory
 */
export async function selectDirectory(): Promise<string | undefined> {
  if (!window.showDirectoryPicker) {
    throw new Error('File System Access API is not supported in this browser.');
  }
  directoryHandle = await window.showDirectoryPicker();
  return directoryHandle.name;
}

/**
 * Saves a JSON object to a file in the selected directory.
 * @param filename The name of the file (e.g., 'data.json')
 * @param data The JSON-serializable data to save
 */
export async function saveJsonFile(filename: string, data: any): Promise<void> {
  if (!directoryHandle) {
    throw new Error('No directory selected. Call selectDirectory() first.');
  }
  const fileHandle = await directoryHandle.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(JSON.stringify(data, null, 2));
  await writable.close();
}

/**
 * Loads a JSON object from a file in the selected directory.
 * @param filename The name of the file (e.g., 'data.json')
 * @returns The parsed JSON data
 */
export async function loadJsonFile<T = any>(filename: string): Promise<T> {
  if (!directoryHandle) {
    throw new Error('No directory selected. Call selectDirectory() first.');
  }
  const fileHandle = await directoryHandle.getFileHandle(filename);
  const file = await fileHandle.getFile();
  const text = await file.text();
  return JSON.parse(text) as T;
}

/**
 * Checks if a file exists in the selected directory.
 * @param filename The name of the file
 * @returns true if the file exists, false otherwise
 */
export async function fileExists(filename: string): Promise<boolean> {
  if (!directoryHandle) return false;
  try {
    await directoryHandle.getFileHandle(filename);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Saves a base64-encoded PNG image to a file in the selected directory.
 * @param filename The name of the PNG file (e.g., 'image.png')
 * @param base64Data The base64-encoded PNG data (may include or exclude the data URL prefix)
 */
export async function saveBase64PngFile(filename: string, base64Data: string): Promise<void> {
  if (!directoryHandle) {
    throw new Error('No directory selected. Call selectDirectory() first.');
  }
  // Remove data URL prefix if present
  const prefix = 'data:image/png;base64,';
  const cleanBase64 = base64Data.startsWith(prefix) ? base64Data.slice(prefix.length) : base64Data;
  // Convert base64 to Uint8Array
  const binary = atob(cleanBase64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const fileHandle = await directoryHandle.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(bytes);
  await writable.close();
}

// Note: The user must call selectDirectory() once per session to grant access.
// The File System Access API is supported in Chromium-based browsers.
