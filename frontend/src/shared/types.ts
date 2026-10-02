export type ImageItem = {
  id: number;
  name: string;
  path: string;
};

/** The backend stores names with underscores instead of spaces; show them as typed. */
export const displayName = (image: ImageItem) => image.name.replaceAll("_", " ");
