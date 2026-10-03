"use client";
import { useState } from "react";
import Image from "next/image";
import { imageUrl } from "@/shared/config";
import { aspectRatio, displayName, type ImageItem } from "@/shared/types";
import styles from "./image-card.module.scss";

// Height of the caption under each picture. MasonryGrid needs it to predict tile heights.
export const CAPTION_HEIGHT = 56;

type Props = {
  image: ImageItem;
  onOpen: () => void;
  onDownload: () => void;
  onDelete: () => void;
  // Position in the grid, used to stagger the entrance.
  index?: number;
  // Fade the tile in on the first load. Tiles remount when the column count changes.
  animate?: boolean;
};

export default function ImageCard({ image, onOpen, onDownload, onDelete, index = 0, animate = false }: Props) {
  const title = displayName(image);
  const [loaded, setLoaded] = useState(false);

  return (
    <article
      className={`${styles.tile} ${animate ? styles.enter : ""}`}
      style={animate ? { animationDelay: `${Math.min(index, 14) * 45}ms` } : undefined}
    >
      <button
        type="button"
        className={styles.frame}
        style={{ aspectRatio: aspectRatio(image) }}
        onClick={onOpen}
        aria-label={`View ${title}`}
      >
        {/* Until a thumbnail exists exists (or on the .NET
          * backend, which has none) the original is used instead. */}
        <Image
          src={imageUrl(image.thumbPath ?? image.path)}
          alt={title}
          fill
          unoptimized={Boolean(image.thumbPath)}
          sizes="(max-width: 45rem) 50vw, (max-width: 80rem) 25vw, 20rem"
          className={`${styles.image} ${loaded ? styles.loaded : ""}`}
          onLoad={() => setLoaded(true)}
        />
      </button>

      <div className={styles.caption} style={{ height: CAPTION_HEIGHT }}>
        <h3 title={title}>{title}</h3>
        <div className={styles.actions}>
          <button type="button" onClick={onDownload} aria-label={`Download ${title}`}>
            Download
          </button>
          <button type="button" onClick={onDelete} aria-label={`Delete ${title}`}>
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
