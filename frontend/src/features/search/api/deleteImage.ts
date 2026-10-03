import { API_URL } from "@/shared/config";

export async function deleteImage(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/images/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete image");
}
