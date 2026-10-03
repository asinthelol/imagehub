export type ImageItem = {
  id: number;
  name: string;
  path: string;
  // Pixel size. Null for images uploaded before dimensions were tracked.
  width?: number | null;
  height?: number | null;
  // Small WebP made by the thumbnail service (Spring backend only). Null until it exists.
  thumbPath?: string | null;
};

// The backend stores names with underscores
export const displayName = (image: ImageItem) => image.name.replaceAll("_", " ");

const FALLBACK_ASPECT = 4 / 5;

export const aspectRatio = (image: ImageItem) => {
  if (!image.width || !image.height) return FALLBACK_ASPECT;
  return Math.min(1.8, Math.max(0.6, image.width / image.height));
};
