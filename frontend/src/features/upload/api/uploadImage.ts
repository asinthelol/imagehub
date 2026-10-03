import { API_URL } from "@/shared/config";

type UploadOptions = {
  file: File;
  name: string;
  onProgress?: (fraction: number) => void;
};

// Pixel size of an image file, or null if the browser can't decode it
async function measureImage(file: File): Promise<{ width: number; height: number } | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  } catch {
    return null;
  }
}

// XMLHttpRequest instead of fetch because fetch can't report upload progress.
export async function uploadImage({ file, name, onProgress }: UploadOptions): Promise<void> {
  const size = await measureImage(file);

  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);
    form.append("imageName", name);
    form.append("imagePath", "/"); // required by the .NET backend, ignored by Spring
    if (size) {
      form.append("width", String(size.width));
      form.append("height", String(size.height));
    }

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_URL}/api/upload`);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded / event.total);
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`));
    xhr.onerror = () => reject(new Error("Could not reach the server"));
    xhr.send(form);
  });
}
