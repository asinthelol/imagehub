"use client";
import { useState, useEffect } from "react";
import styles from "./search.module.scss";
import Result from "@/features/search/components/Result/Result";
import SearchBar from "@/features/search/components/Searchbar/Searchbar";
import { fetchImages } from "@/features/search/api/fetchImages";
import * as signalR from "@microsoft/signalr";

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

  // SignalR useEffect
  useEffect(() => {
    const loadImages = async () => {
      const newImages = await fetchImages();
      setImages(newImages);
    };

    loadImages(); // Initial fetch on mount

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5000/hubs/images")
      .withAutomaticReconnect()
      .build();
    
    connection.start().then(() => {
      console.log("Connected to SignalR hub");
    });

    connection.on("ImagesUpdated", () => {
      console.log("Images updated, fetching new images...");
      fetchImages().then((newImages) => setImages(newImages));
    });
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
