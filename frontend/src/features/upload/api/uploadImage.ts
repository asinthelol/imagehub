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

  if (!imageName) {
    alert("Please provide an image name.");
    textRef.current.focus();
    return;
  }

  if (!file) {
    alert("Please select a file to upload.");
    fileRef.current.focus();
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("imageName", imageName);
  formData.append("imagePath", "/");

  try {
    const response = await fetch("http://localhost:5000/api/upload", {
      method: "POST",
      credentials: 'include',
      body: formData
    });

    if(response.ok) {
      console.log("Image uploaded successfully");
      window.location.href = "/search";
    }
  } catch (error) {
    console.error("Failed to upload image2", error);
    alert("An error occurred while uploading the image.");
  }
}