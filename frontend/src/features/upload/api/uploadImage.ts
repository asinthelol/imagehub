import { API_URL } from "@/shared/config";

type UploadOptions = {
  file: File;
  name: string;
  onProgress?: (fraction: number) => void;
};

// XMLHttpRequest instead of fetch because fetch can't report upload progress.
export function uploadImage({ file, name, onProgress }: UploadOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);
    form.append("imageName", name);
    form.append("imagePath", "/"); // required by the .NET backend, ignored by Spring

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
