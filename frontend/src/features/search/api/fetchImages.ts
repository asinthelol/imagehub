import { API_URL } from "@/shared/config";
import type { ImageItem } from "@/shared/types";

// Throws on failure so callers can show an error state instead of an empty library.
export async function fetchImages(): Promise<ImageItem[]> {
  const response = await fetch(`${API_URL}/api/images`);
  if (!response.ok) throw new Error("Failed to fetch images");
  return response.json();
}
