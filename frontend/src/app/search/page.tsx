import { Metadata } from "next";
import styles from "./search.module.scss";
import Result from "./components/result/Result";
import SearchBar from "./components/search-bar/Searchbar";

export const metadata: Metadata = {
  title: "Search – ImageHub",
  description: "Search for your favorite artwork.",
};

export default function Page() {
  return (
    <main id={styles.container}>
      <h1>
        Discover your next favorite artwork.
      </h1>

      <SearchBar />

      <hr />

      <section id={styles["results-container"]}>
        <Result
          name="The Starry Night"
          src="/hero-image.webp"
          alt="The Starry Night by Vincent van Gogh"
        />
        <Result
          name="The Starry Night"
          src="/hero-image.webp"
          alt="The Starry Night by Vincent van Gogh"
        />
        <Result
          name="The Starry Night"
          src="/hero-image.webp"
          alt="The Starry Night by Vincent van Gogh"
        />
        <Result
          name="The Starry Night"
          src="/hero-image.webp"
          alt="The Starry Night by Vincent van Gogh"
        />
        <Result
          name="The Starry Night"
          src="/hero-image.webp"
          alt="The Starry Night by Vincent van Gogh"
        />
      </section>
    </main>
  );
}