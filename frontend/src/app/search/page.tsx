"use client";
import { useState, useEffect } from "react";
import styles from "./search.module.scss";
import Result from "./components/result/Result";
import SearchBar from "./components/search-bar/Searchbar";
import { fetchImages } from "./lib/fetchImages";

type Image = {
  id: number;
  name: string;
  path: string;
};

export default function Page() {
  const [images, setImages] = useState<Image[]>([]);
  const [filteredImages, setFilteredImages] = useState<Image[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [shouldFetch, setShouldFetch] = useState<boolean>(true);

  useEffect(() => {
    const loadImages = async () => {
      if(!shouldFetch) return;

      const newImages = await fetchImages();
      setImages(newImages);

      if (newImages.length > 0) {
        setShouldFetch(false);
      }
    };

    loadImages();

    const interval = setInterval(loadImages, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const results = images.filter((image) =>
      image.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredImages(results);
  }, [searchTerm, images]);

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
