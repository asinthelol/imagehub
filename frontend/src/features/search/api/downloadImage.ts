import { imageUrl } from "@/shared/config";
import { displayName, type ImageItem } from "@/shared/types";

export async function downloadImage(image: ImageItem): Promise<void> {
  const response = await fetch(imageUrl(image.path));
  if (!response.ok) throw new Error("Failed to download image");

  const blobUrl = URL.createObjectURL(await response.blob());
  const extension = image.path.slice(image.path.lastIndexOf("."));

  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = `${displayName(image)}${extension}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(blobUrl);
}
