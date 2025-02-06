export function deleteImages() {
  async function deleteImage(id: number) {
    const response = await fetch(`http://10.0.0.227:3001/api/images/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      console.log("Image deleted successfully");
    } else {
      console.error("Failed to delete image");
    }
  }

  return { deleteImage };
}