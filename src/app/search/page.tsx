import { Metadata } from "next";
import styles from "./search.module.scss";
import Result from "./components/result/Result";
import Input from "./components/input/Input";

export const metadata: Metadata = {
  title: "Search – ImageHub",
  description: "Search for your favorite artwork.",
};

export default function Page() {
  return (
    <main id={styles.container}>
      <Input />

      <hr />

      <section id={styles["results-container"]}>
        <Result
          name="The Starry Night"
          src="/hero-image.webp"
          alt="The Starry Night by Vincent van Gogh"
        />
      </section>
    </main>
  );
}