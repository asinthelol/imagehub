"use client";
import { useEffect, useRef } from "react";
import { imageUrl } from "@/shared/config";
import { displayName, type ImageItem } from "@/shared/types";

type Props = {
  images: ImageItem[];
  index: number | null; // null = closed
  onIndexChange: (index: number) => void;
  onClose: () => void;
  onDownload: (image: ImageItem) => void;
  onDelete: (image: ImageItem) => void;
};

// Left/Right arrows move between images, Escape closes.
export default function Lightbox({ images, index, onIndexChange, onClose, onDownload, onDelete }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const open = index !== null;
  const image = open ? images[index] : undefined;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const go = (delta: number) => {
    if (index === null) return;
    onIndexChange((index + delta + images.length) % images.length);
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
      aria-label={image ? displayName(image) : "Image viewer"}
    >
      {image && (
        <div>
          <h2>{displayName(image)}</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl(image.path)}
            alt={displayName(image)}
            style={{ maxWidth: "80vw", maxHeight: "65vh", objectFit: "contain" }}
          />
          <p>
            {index! + 1} / {images.length}
          </p>
          {images.length > 1 && (
            <>
              <button type="button" onClick={() => go(-1)}>
                Previous
              </button>{" "}
              <button type="button" onClick={() => go(1)}>
                Next
              </button>{" "}
            </>
          )}
          <button type="button" onClick={() => onDownload(image)}>
            Download
          </button>{" "}
          <button type="button" onClick={() => onDelete(image)}>
            Delete
          </button>{" "}
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
      )}
    </dialog>
  );
}
