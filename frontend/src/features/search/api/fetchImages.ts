export async function fetchImages() {
  try {
    const response = await fetch("http://localhost:5000/api/images");
    if (!response.ok) throw new Error("Failed to fetch images");

    return await response.json();
  } catch (error) {
    console.error("Error fetching images: ", error);
    return [];
  }
}