export async function getImageSize(imageB64: string): Promise<{ width: number, height: number }> {
    const img = new Image();
    img.src = `data:image/png;base64,${imageB64}`;
    await new Promise((resolve) => { img.onload = resolve; });
    return { width: img.width, height: img.height };
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary);
}
