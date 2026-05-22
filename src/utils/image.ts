export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15 MB
export const MAX_INFERENCE_DIM = 1600;

export interface LoadedImage {
  /** Original-resolution image element (used for final composition + export). */
  image: HTMLImageElement;
  /** Object URL backing the image; revoke when done. */
  objectUrl: string;
}

export function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return 'Unsupported file type. Please use a JPEG, PNG, or WebP image.';
  }
  if (file.size > MAX_FILE_BYTES) {
    return 'Image is too large (max 15 MB).';
  }
  return null;
}

export function loadImageFromFile(file: File): Promise<LoadedImage> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => resolve({ image, objectUrl });
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to decode image.'));
    };
    image.src = objectUrl;
  });
}

/**
 * Returns a canvas sized so its longest edge is at most `maxDim`. The scale
 * factor (original / canvas) is returned so detection coordinates from the
 * scaled canvas can be mapped back to the full-resolution image when drawing
 * the final composition.
 */
export function resizeForInference(
  image: HTMLImageElement,
  maxDim = MAX_INFERENCE_DIM,
): { canvas: HTMLCanvasElement; scale: number } {
  const longest = Math.max(image.naturalWidth, image.naturalHeight);
  const scale = longest > maxDim ? longest / maxDim : 1;
  const width = Math.round(image.naturalWidth / scale);
  const height = Math.round(image.naturalHeight / scale);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create 2D rendering context.');
  ctx.drawImage(image, 0, 0, width, height);
  return { canvas, scale };
}

export function loadHTMLImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}
