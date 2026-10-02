import Image from "next/image";
import { imageUrl } from "@/shared/config";
import { displayName, type ImageItem } from "@/shared/types";

type Props = {
  image: ImageItem;
  onOpen: () => void;
  onDownload: () => void;
  onDelete: () => void;
};

export default function ImageCard({ image, onOpen, onDownload, onDelete }: Props) {
  const title = displayName(image);

  return (
    <article>
      <button type="button" onClick={onOpen} aria-label={`View ${title}`}>
        <Image
          src={imageUrl(image.path)}
          alt={title}
          width={200}
          height={200}
          style={{ objectFit: "cover" }}
        />
      </button>
      <h3>{title}</h3>
      <button type="button" onClick={onDownload} aria-label={`Download ${title}`}>
        Download
      </button>{" "}
      <button type="button" onClick={onDelete} aria-label={`Delete ${title}`}>
        Delete
      </button>
    </article>
  );
}
