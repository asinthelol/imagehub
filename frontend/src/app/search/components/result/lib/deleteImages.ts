export function deleteImages() {
  async function deleteImage(id: number) {
    const response = await fetch(`http://localhost:5000/api/images/${id}`, {
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