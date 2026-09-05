/**
 * Portrait handling.
 *
 * Characters live in localStorage, which is a few megabytes for the whole origin — a
 * phone photo straight from disk would eat that quota on its own and take the roster
 * down with it. So a picked image is drawn into a canvas at portrait size and stored as
 * a JPEG data URL: a few tens of kilobytes, which also keeps exported JSON portable.
 */
export const AVATAR_MAX_PX = 320;
const AVATAR_QUALITY = 0.82;

/** Longest-side-limited dimensions, keeping the aspect ratio and never upscaling. */
export function fitWithin(width: number, height: number, max: number): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= max) return { width, height };
  const scale = max / longest;
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

export async function fileToAvatarDataUrl(file: File, max = AVATAR_MAX_PX): Promise<string> {
  const bitmap = await createImageBitmap(file);
  try {
    const { width, height } = fitWithin(bitmap.width, bitmap.height, max);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D context unavailable');
    context.drawImage(bitmap, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', AVATAR_QUALITY);
  } finally {
    bitmap.close();
  }
}
