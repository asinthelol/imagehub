"use client";
import { useCallback, useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import { WS_URL } from "@/shared/config";
import type { ImageItem } from "@/shared/types";
import { fetchImages } from "../api/fetchImages";

/**
 * Loads the image list (newest first) and auto refreshes. The Spring backend pushes an
 * event over STOMP whenever an image is uploaded or deleted. With the .NET backend the
 * socket never connects, so the list updates on load and after local changes.
 */
export function useImages() {
  const [images, setImages] = useState<ImageItem[] | null>(null); // null = still loading
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchImages();
      setImages([...data].sort((a, b) => b.id - a.id));
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    load();

    const client = new Client({
      brokerURL: WS_URL,
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe("/topic/images", () => load());
      },
    });
    client.activate();

    return () => {
      client.deactivate();
    };
  }, [load]);

  // Drop an image locally right away (used after a successful delete).
  const remove = useCallback((id: number) => {
    setImages((prev) => prev && prev.filter((image) => image.id !== id));
  }, []);

  return { images, error, reload: load, remove };
}
