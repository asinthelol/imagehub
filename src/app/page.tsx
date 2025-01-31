import Image from "next/image";
import styles from "./page.module.scss";

export default function Home() {
  return (
    <main id={styles.container}>
      <section id={styles.hero}>
        <div id={styles["hero-content"]}>
          <h1>
            Your favorites,<br />
            all in <span>one place</span>.
          </h1>
          <p>Discover your next favorite artwork<br />right here.</p>
        </div>
        <div id={styles["hero-image-container"]}>
          <Image
            id={styles["hero-image"]}
            src="/hero-image.webp"
            fill
            alt="hero image" />
        </div>
      </section>
    </main>
  );
}
