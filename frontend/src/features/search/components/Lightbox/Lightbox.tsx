"use client";
import { useEffect, useRef, useState } from "react";
import Button from "@/shared/components/button/Button";
import { imageUrl } from "@/shared/config";
import { displayName, type ImageItem } from "@/shared/types";
import styles from "./lightbox.module.scss";

type Props = {
  images: ImageItem[];
  index: number | null; // null = closed
  onIndexChange: (index: number) => void;
  onClose: () => void;
  onDownload: (image: ImageItem) => void;
  onDelete: (image: ImageItem) => void;
};

const pad = (n: number) => String(n).padStart(2, "0");
const SWIPE_DISTANCE = 60; // px

export default function Lightbox({ images, index, onIndexChange, onClose, onDownload, onDelete }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const originalRef = useRef<HTMLImageElement>(null);
  const swipeStart = useRef<number | null>(null);
  const [loadedId, setLoadedId] = useState<number | null>(null);

  const open = index !== null;
  const image = open ? images[index] : undefined;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // An original that is already cached can finish loading before React attaches onLoad.
  useEffect(() => {
    const el = originalRef.current;
    if (image && el?.complete && el.naturalWidth > 0) setLoadedId(image.id);
  }, [image]);

  // Warm the cache for the neighbours so the arrow keys feel instant.
  useEffect(() => {
    if (index === null || images.length < 2) return;
    for (const step of [1, -1]) {
      const neighbour = images[(index + step + images.length) % images.length];
      new Image().src = imageUrl(neighbour.path);
    }
  }, [index, images]);

  const go = (delta: number) => {
    if (index === null) return;
    onIndexChange((index + delta + images.length) % images.length);
  };

  return (
    <dialog
      ref={ref}
      className={styles.lightbox}
      onClose={onClose}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
      aria-label={image ? displayName(image) : "Image viewer"}
    >
      {image && (
        <div className={styles.layout}>
          <p className={styles.counter} aria-live="polite">
            <span className="sr-only">Image </span>
            {pad(index! + 1)} / {pad(images.length)}
          </p>

          <button type="button" className={`${styles.round} ${styles.close}`} onClick={onClose} aria-label="Close">
            <span className="material-symbols-outlined" aria-hidden="true">
              close
            </span>
          </button>

          <div
            className={styles.stage}
            onPointerDown={(e) => (swipeStart.current = e.clientX)}
            onPointerUp={(e) => {
              if (swipeStart.current === null) return;
              const dx = e.clientX - swipeStart.current;
              swipeStart.current = null;
              if (Math.abs(dx) > SWIPE_DISTANCE) go(dx < 0 ? 1 : -1);
            }}
          >
            {/* Both layers fill the stage with object-fit: contain, so they line up exactly. The thumbnail
                (if there is one) shows at once; the original fades in over it when it has loaded. */}
            {image.thumbPath && (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={`t${image.id}`} className={styles.photo} src={imageUrl(image.thumbPath)} alt="" aria-hidden="true" />
            )}
            {/* No thumbnail to show meanwhile (older images, or the .NET backend): say something is loading. */}
            {!image.thumbPath && loadedId !== image.id && (
              <span className={styles.spinner} role="status" aria-label="Loading image" />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={image.id}
              ref={originalRef}
              className={`${styles.photo} ${styles.original} ${loadedId === image.id ? styles.loaded : ""}`}
              src={imageUrl(image.path)}
              alt={displayName(image)}
              onLoad={() => setLoadedId(image.id)}
              draggable={false}
            />

            {images.length > 1 && (
              <>
                <button type="button" className={`${styles.round} ${styles.prev}`} onClick={() => go(-1)} aria-label="Previous image">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    chevron_left
                  </span>
                </button>
                <button type="button" className={`${styles.round} ${styles.next}`} onClick={() => go(1)} aria-label="Next image">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    chevron_right
                  </span>
                </button>
              </>
            )}
          </div>

          <div className={styles.bar}>
            <h2 title={displayName(image)}>{displayName(image)}</h2>
            <div className={styles.actions}>
              <Button variant="solid" icon="download" onClick={() => onDownload(image)}>
                Download
              </Button>
              <Button variant="secondary" icon="delete" onClick={() => onDelete(image)}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
