import { Metadata } from "next";
import styles from "./explore.module.scss";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Search – ImageHub",
  description: "Search for your favorite artwork.",

  
};

export default function Page() {
  return (
    <main>
      <section id={styles["input-container"]}>
        <span 
          className={styles["material-symbols-outlined"]}
          id={styles["search-icon"]}>
            search
          </span>
        <input
          className={styles["search-input"]}
          type="search"
          placeholder="Search..." />
      </section>

      <hr />

      <section id={styles["results-container"]}>
        <div className={styles["result"]}>
          <Image
            className={styles["result-image"]}
            src="/hero-image.webp"
            fill
            alt="result image" />
          <h2 className={styles["result-title"]}>Title</h2>
          <p className={styles["result-description"]}>Description</p>
        </div>

      </section>
    </main>
  );
}