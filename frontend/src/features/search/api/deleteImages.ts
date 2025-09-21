export function deleteImages() {
  async function deleteImage(id: number) {
    try {
      const response = await fetch(`http://localhost:5000/api/images/${id}`, {
        credentials: 'include',
        method: "DELETE",
      });

      if (response.ok) {
        console.log("Image deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  }

  return { deleteImage };
}