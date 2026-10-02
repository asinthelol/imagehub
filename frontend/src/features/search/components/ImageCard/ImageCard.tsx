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
};

export default function ImageCard({ image, onOpen, onDownload, onDelete }: Props) {
  const title = displayName(image);

  return (
    <article className={styles.tile}>
      <button
        type="button"
        className={styles.frame}
        style={{ aspectRatio: aspectRatio(image) }}
        onClick={onOpen}
        aria-label={`View ${title}`}
      >
        <Image
          src={imageUrl(image.thumbPath ?? image.path)}
          alt={title}
          fill
          unoptimized={Boolean(image.thumbPath)}
          sizes="(max-width: 45rem) 50vw, (max-width: 80rem) 25vw, 20rem"
          className={styles.image}
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
