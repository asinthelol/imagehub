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
  const file = fileRef.current.files ? fileRef.current.files[0] : null;

  if (!imageName || !file) {
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("imageName", imageName);
  formData.append("imagePath", "/");

  try {
    const response = await fetch("http://localhost:5101/api/upload", {
      method: "POST",
      body: formData
    });

    if(response.ok) {
      alert("Image uploaded successfully");
      console.log("Image uploaded successfully");
    } else {
      alert("Failed to upload image1");
      console.error("Failed to upload image1");
    }
  } catch (error) {
    console.error("Failed to upload image2", error);
  }
}