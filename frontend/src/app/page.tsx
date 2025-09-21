import { Metadata } from "next";
import Image from "next/image";
import styles from "./page.module.scss";
import Button from "@/shared/components/button/Button";

export const metadata: Metadata = {
  title: "Home – ImageHub",
  description: "Discover your next favorite artwork right here.",
};

export default function Page() {
  return (
    <main id={styles.container}>
      <section id={styles.hero}>
        <div id={styles["hero-content"]}>
          <h1>
            Your favorites,<br />
            all in <span>one place</span>.
          </h1>
          <p>Discover your next favorite artwork<br />right here.</p>
          <Button text="Search" style="underline" href="/search" />
        </div>
        <div id={styles["hero-image-container"]}>
          <Image
            id={styles["hero-image"]}
            src="/hero-image.webp"
            fill
            sizes="(max-width: 768px) 224px, (max-width: 1200px) 324px, 360px"
            alt="hero image" 
            priority
            />
        </div>
      </section>
    </main>
  );
}
