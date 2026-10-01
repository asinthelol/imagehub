"use client";
import { useState, useEffect } from "react";
import styles from "./search.module.scss";
import Result from "@/features/search/components/Result/Result";
import SearchBar from "@/features/search/components/Searchbar/Searchbar";
import { fetchImages } from "@/features/search/api/fetchImages";
import { Client } from "@stomp/stompjs";

type Image = {
  id: number;
  name: string;
  path: string;
};

export default function Page() {
  const [images, setImages] = useState<Image[]>([]);
  const [filteredImages, setFilteredImages] = useState<Image[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");



  // Filter useEffect
  useEffect(() => {
    const results = images.filter((image) =>
      image.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredImages(results);
  }, [searchTerm, images]);

  // WebSocket (STOMP) useEffect
  useEffect(() => {
    const loadImages = async () => {
      const newImages = await fetchImages();
      setImages(newImages);
    };

    loadImages(); // Initial fetch on mount

    const client = new Client({
      brokerURL: "ws://localhost:5000/ws",
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("Connected to WebSocket");
        client.subscribe("/topic/images", () => {
          console.log("Images updated, fetching new images...");
          loadImages();
        });
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, []);

  return (
    <main id={styles.container}>
      <h1>Discover your next favorite artwork.</h1>

      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <hr />

      <section id={styles["results-container"]}>
        {filteredImages.length > 0 ? (
          filteredImages.map((image) => (
            <Result key={image.id} id={image.id} name={image.name} src={image.path} alt={image.name} />
          ))
        ) : (
          <></>
        )}
      </section>
    </main>
  );
}
