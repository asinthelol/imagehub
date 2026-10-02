"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/shared/components/toast/Toast";
import { uploadImage } from "../api/uploadImage";

const MAX_BYTES = 30 * 1024 * 1024; // matches the backends' 30 MB limit
const ACCEPTED = "image/jpeg,image/png,image/gif,image/webp";

export default function UploadForm() {
  const router = useRouter();
  const toast = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [progress, setProgress] = useState<number | null>(null); // null = not uploading

  // Build (and clean up) the object URL used for the preview.
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const choose = (candidate: File | undefined) => {
    if (!candidate) return;
    if (!candidate.type.startsWith("image/")) {
      toast("That file isn't an image.", "error");
      return;
    }
    if (candidate.size > MAX_BYTES) {
      toast("That image is over the 30 MB limit.", "error");
      return;
    }
    setFile(candidate);
    // Suggest a title from the file name the first time.
    setTitle((current) => current || candidate.name.replace(/\.[^.]+$/, "").replaceAll(/[_-]+/g, " "));
  };

  const uploading = progress !== null;
  const canSubmit = file !== null && title.trim().length > 0 && !uploading;

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file || !canSubmit) return;

    setProgress(0);
    try {
      await uploadImage({ file, name: title.trim(), onProgress: setProgress });
      toast("Image uploaded.", "success");
      router.push("/search");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Upload failed.", "error");
      setProgress(null);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      onDragOver={(e) => e.preventDefault()} // required for the drop event to fire
      onDrop={(e) => {
        e.preventDefault();
        choose(e.dataTransfer.files[0]);
      }}
    >
      <p>
        <label htmlFor="file">Image (choose a file or drop one anywhere on this form; JPG, PNG, GIF or WebP, up to 30 MB)</label>
        <br />
        <input id="file" type="file" accept={ACCEPTED} onChange={(e) => choose(e.target.files?.[0])} disabled={uploading} />
      </p>

      {preview && (
        <p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Selected file preview" style={{ maxHeight: "20rem" }} />
        </p>
      )}

      <p>
        <label htmlFor="title">Title</label>
        <br />
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your artwork a title"
          maxLength={80}
          autoComplete="off"
          disabled={uploading}
        />
      </p>

      {uploading && (
        <p>
          <progress value={progress} max={1} /> {Math.round(progress * 100)}%
        </p>
      )}

      <button type="submit" disabled={!canSubmit}>
        {uploading ? "Uploading…" : "Upload"}
      </button>
    </form>
  );
}
