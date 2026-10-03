"use client";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import Button from "@/shared/components/button/Button";
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

// Placeholder tiles for the loading state.
const SKELETONS = [0.8, 1.25, 1, 0.7, 1.5, 0.9, 1.1, 0.8, 1.3, 0.75, 1, 1.4].map((aspect, id) => ({ id, aspect }));

// Empty, no-matches and error screens share this layout.
function State({ title, text, action }: { title: ReactNode; text: string; action: ReactNode }) {
  return (
    <div className={styles.state}>
      <h2>{title}</h2>
      <p>{text}</p>
      {action}
    </div>
  );
}

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

  // Tiles fade in one after another on the first load only. Afterwards they're remounted whenever the
  // number of columns changes (a resize).
  const loaded = images !== null;
  const hasImages = loaded && images.length > 0;
  const [intro, setIntro] = useState(true);
  useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(() => setIntro(false), 2000);
    return () => clearTimeout(timer);
  }, [loaded]);

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
      <State
        title={
          <>
            Can&rsquo;t reach the <em>server</em>.
          </>
        }
        text="Make sure the backend is running on port 5000."
        action={
          <Button variant="solid" onClick={reload}>
            Try again
          </Button>
        }
      />
    );
  } else if (images === null) {
    body = (
      <div aria-busy="true">
        <span className="sr-only">Loading your images…</span>
        <MasonryGrid
          items={SKELETONS}
          getKey={(s) => s.id}
          getAspect={(s) => s.aspect}
          captionHeight={CAPTION_HEIGHT}
          renderItem={(s) => (
            <div className={styles.skeleton} aria-hidden="true">
              <div className={styles.skeletonFrame} style={{ aspectRatio: s.aspect }} />
              <div className={styles.skeletonCaption} style={{ height: CAPTION_HEIGHT }}>
                <span />
                <span />
              </div>
            </div>
          )}
        />
      </div>
    );
  } else if (images.length === 0) {
    body = (
      <State
        title={
          <>
            Nothing here <em>yet</em>.
          </>
        }
        text="Upload your first image and it will show up here."
        action={
          <Button href="/upload" variant="solid" icon="arrow_forward">
            Upload an image
          </Button>
        }
      />
    );
  } else if (visible.length === 0) {
    body = (
      <State
        title={
          <>
            No <em>matches</em>.
          </>
        }
        text={`Nothing found for “${q.trim()}”.`}
        action={
          <Button variant="secondary" onClick={() => onSearchChange("")}>
            Clear search
          </Button>
        }
      />
    );
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
            index={index}
            animate={intro}
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
          <p className={`${styles.count} ${hasImages ? "" : styles.countHidden}`} aria-hidden={!hasImages}>
            {visible.length} {visible.length === 1 ? "image" : "images"}
          </p>
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
        title={
          pendingDelete ? (
            <>
              Delete <em>“{displayName(pendingDelete)}”</em>?
            </>
          ) : (
            ""
          )
        }
        message="This permanently removes the picture. It cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
