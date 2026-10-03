"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/shared/components/button/Button";
import { useToast } from "@/shared/components/toast/Toast";
import { uploadImage } from "../../api/uploadImage";
import styles from "./upload-form.module.scss";

const MAX_BYTES = 30 * 1024 * 1024; // matches the backends' 30 MB limit
const ACCEPTED = "image/jpeg,image/png,image/gif,image/webp";

// The progress ring is an SVG circle whose visible length is the share of the upload that's done.
const RING_RADIUS = 46;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const hasFiles = (event: React.DragEvent) => event.dataTransfer.types.includes("Files");

export default function UploadForm() {
  const router = useRouter();
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const titleInput = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [title, setTitle] = useState("");
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null); // null = not uploading

  // Build (and clean up) the object URL used for the preview, and read the picture's pixel size.
  useEffect(() => {
    setSize(null);
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);

    let cancelled = false;
    createImageBitmap(file)
      .then((bitmap) => {
        if (!cancelled) setSize({ width: bitmap.width, height: bitmap.height });
        bitmap.close();
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      URL.revokeObjectURL(url);
    };
  }, [file]);

  // A file dropped outside the form would make the browser navigate to it; ignore those drops.
  useEffect(() => {
    const ignore = (event: DragEvent) => {
      if (event.dataTransfer?.types.includes("Files")) event.preventDefault();
    };
    window.addEventListener("dragover", ignore);
    window.addEventListener("drop", ignore);
    return () => {
      window.removeEventListener("dragover", ignore);
      window.removeEventListener("drop", ignore);
    };
  }, []);

  const uploading = progress !== null;
  const canSubmit = file !== null && title.trim().length > 0 && !uploading;

  const choose = (candidate: File | undefined) => {
    if (!candidate || uploading) return;
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
    // The next thing to do is name it.
    requestAnimationFrame(() => titleInput.current?.focus({ preventScroll: true }));
  };

  const clear = () => {
    setFile(null);
    if (fileInput.current) fileInput.current.value = ""; // so choosing the same file again still fires onChange
  };

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

  const percent = Math.round((progress ?? 0) * 100);

  return (
    <form
      className={styles.layout}
      onSubmit={onSubmit}
      onDragOver={(e) => {
        if (!hasFiles(e)) return;
        e.preventDefault(); // required for the drop event to fire
        if (!uploading) setDragging(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false);
      }}
      onDrop={(e) => {
        if (!hasFiles(e)) return;
        e.preventDefault();
        setDragging(false);
        choose(e.dataTransfer.files[0]);
      }}
    >
      <div className={styles.intro}>
        <h1>
          Add to your <em>collection</em>.
        </h1>
        <p>Choose a photo, give it a title, and it appears in Browse.</p>
      </div>

      <div className={styles.stage}>
        <button
          type="button"
          className={`${styles.frame} ${dragging ? styles.dragging : ""} ${preview ? styles.filled : ""}`}
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
          aria-label={preview ? "Choose a different image" : "Choose an image"}
        >
          <span className={`${styles.corner} ${styles.tl}`} aria-hidden="true" />
          <span className={`${styles.corner} ${styles.tr}`} aria-hidden="true" />
          <span className={`${styles.corner} ${styles.bl}`} aria-hidden="true" />
          <span className={`${styles.corner} ${styles.br}`} aria-hidden="true" />

          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={styles.preview} src={preview} alt="The image you're about to upload" />
          ) : (
            <>
              <span className={styles.lines} aria-hidden="true" />
              <span className={styles.ring} aria-hidden="true">
                <span className="material-symbols-outlined">arrow_upward</span>
              </span>
              <span className={styles.prompt}>
                <strong>Drop an image</strong>
                <span>or click to browse</span>
                <small>JPG, PNG, GIF or WebP · up to 30 MB</small>
              </span>
            </>
          )}

          {uploading && (
            <span className={styles.progress} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-label="Uploading">
              <svg viewBox="0 0 100 100" aria-hidden="true">
                <circle className={styles.track} cx="50" cy="50" r={RING_RADIUS} />
                <circle
                  className={styles.bar}
                  cx="50"
                  cy="50"
                  r={RING_RADIUS}
                  strokeDasharray={RING_LENGTH}
                  strokeDashoffset={RING_LENGTH * (1 - (progress ?? 0))}
                />
              </svg>
              <span className={styles.percent}>{percent < 100 ? `${percent}%` : "Saving"}</span>
            </span>
          )}
        </button>

        <input
          ref={fileInput}
          id="file"
          type="file"
          accept={ACCEPTED}
          hidden
          onChange={(e) => choose(e.target.files?.[0])}
        />

        {file && (
          <p className={styles.meta}>
            <span className={styles.fileName}>{file.name}</span>
            {size && ` · ${size.width} × ${size.height}`} · {formatSize(file.size)}
          </p>
        )}
      </div>

      <div className={styles.controls}>
        <div className={styles.field}>
          <label htmlFor="title">Title</label>
          <input
            ref={titleInput}
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            maxLength={80}
            autoComplete="off"
            disabled={uploading}
          />
        </div>

        <div className={styles.actions}>
          <Button type="submit" variant="solid" icon="arrow_upward" disabled={!canSubmit}>
            {uploading ? "Uploading…" : "Upload"}
          </Button>
          {file && !uploading && (
            <button type="button" className={styles.remove} onClick={clear}>
              Remove image
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
