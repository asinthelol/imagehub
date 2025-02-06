type downloadImagesProps = {
  name: string;
  src: string;
}

export function downloadImages() {
  const downloadImage = async ({name, src}: downloadImagesProps) => {
    try {
      const response = await fetch(`http://localhost:5000${src}`);
      if (!response.ok) throw new Error("Failed to fetch image");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  return { downloadImage };
}