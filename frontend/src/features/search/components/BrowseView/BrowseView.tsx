"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/shared/components/toast/Toast";
import { aspectRatio, displayName, type ImageItem } from "@/shared/types";
import { useImages } from "../../hooks/useImages";
import { deleteImage } from "../../api/deleteImage";
import { downloadImage } from "../../api/downloadImage";
import ImageCard, { CAPTION_HEIGHT } from "../ImageCard/ImageCard";
import MasonryGrid from "../MasonryGrid/MasonryGrid";
import Lightbox from "../Lightbox/Lightbox";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";
import styles from "./browse-view.module.scss";

export default function BrowseView() {
  // Search lives in the URL (?q=).
  const q = useSearchParams().get("q") ?? "";
  const [search, setSearch] = useState(q);
  useEffect(() => setSearch(q), [q]); // follow the URL when it changes elsewhere (back button, nav link)

  const onSearchChange = (next: string) => {
    setSearch(next);
    // Next.js syncs history.replaceState with useSearchParams
    window.history.replaceState(null, "", next ? `/search?q=${encodeURIComponent(next)}` : "/search");
  };

  const query = q.trim().toLowerCase();
  const { images, error, reload, remove } = useImages();
  const toast = useToast();

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ImageItem | null>(null);

  const visible = useMemo(
    () => (images ?? []).filter((image) => displayName(image).toLowerCase().includes(query)),
    [images, query],
  );

  const handleDownload = async (image: ImageItem) => {
    try {
      await downloadImage(image);
    } catch {
      toast("Couldn't download that image.", "error");
    }
  };

  const confirmDelete = async () => {
    const target = pendingDelete;
    setPendingDelete(null);
    if (!target) return;

    try {
      await deleteImage(target.id);
      remove(target.id);
      toast(`Deleted “${displayName(target)}”.`, "success");

      // Keep the lightbox on a valid image (or close it when nothing is left).
      setOpenIndex((index) => {
        if (index === null) return null;
        const remaining = visible.length - 1;
        return remaining === 0 ? null : Math.min(index, remaining - 1);
      });
    } catch {
      toast("Couldn't delete that image.", "error");
    }
  };

  let body;
  if (error && images === null) {
    body = (
      <p>
        Can&apos;t reach the server. Make sure the backend is running on port 5000.{" "}
        <button type="button" onClick={reload}>
          Try again
        </button>
      </p>
    );
  } else if (images === null) {
    body = <p aria-busy="true">Loading…</p>;
  } else if (images.length === 0) {
    body = (
      <p>
        No artwork yet. <Link href="/upload">Upload an image</Link>.
      </p>
    );
  } else if (visible.length === 0) {
    body = <p>No matches for &ldquo;{query}&rdquo;.</p>;
  } else {
    body = (
      <MasonryGrid
        items={visible}
        getKey={(image) => image.id}
        getAspect={aspectRatio}
        captionHeight={CAPTION_HEIGHT}
        renderItem={(image, index) => (
          <ImageCard
            image={image}
            onOpen={() => setOpenIndex(index)}
            onDownload={() => handleDownload(image)}
            onDelete={() => setPendingDelete(image)}
          />
        )}
      />
    );
  }

  return (
    <>
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>
            {query ? (
              <>
                Results for <em>“{q.trim()}”</em>
              </>
            ) : (
              <>
                Your <em>collection</em>
              </>
            )}
          </h1>
          {images && images.length > 0 && (
            <p className={styles.count}>
              {visible.length} {visible.length === 1 ? "image" : "images"}
            </p>
          )}
        </div>

        <form className={styles.search} role="search" onSubmit={(e) => e.preventDefault()}>
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search"
            aria-label="Search artwork"
            autoComplete="off"
          />
        </form>
      </div>

      {body}

      <Lightbox
        images={visible}
        index={openIndex}
        onIndexChange={setOpenIndex}
        onClose={() => setOpenIndex(null)}
        onDownload={handleDownload}
        onDelete={setPendingDelete}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this image?"
        message={pendingDelete ? `“${displayName(pendingDelete)}” will be permanently removed.` : ""}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
