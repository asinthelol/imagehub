export default async function uploadImage(
  event: React.FormEvent,
  textRef: React.RefObject<HTMLInputElement>,
  fileRef: React.RefObject<HTMLInputElement>
) {
  event.preventDefault();

  if(!textRef.current || !fileRef.current) {
    return;
  }

  const imageName = textRef.current.value.trim();
  const file = fileRef.current?.files?.[0];

  if (!imageName || !file) {
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("imageName", imageName);
  formData.append("imagePath", "/");

  try {
    const response = await fetch("http://localhost:5000/api/upload", {
      method: "POST",
      body: formData
    });

    if(response.ok) {
      console.log("Image uploaded successfully");
      // go to window.location.href = "/search"; after 500ms
      setTimeout(() => {
        window.location.href = "/search";
      }, 500);
    }
  } catch (error) {
    console.error("Failed to upload image2", error);
  }
}