const address = "http://localhost:3000/api/images";

export async function fetchImages() {
  try {
    const response = await fetch("http://localhost:3000/api/images");
    if (!response.ok) {
      throw new Error(`HTTP error occured. Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching images:", error);
  }
}