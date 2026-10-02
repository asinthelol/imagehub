import { getImageProps } from "next/image";
import Link from "next/link";
import Button from "@/shared/components/button/Button";
import { serif } from "@/shared/fonts";
import styles from "./hero.module.scss";

const common = { alt: "", fill: true, sizes: "100vw" } as const;

/**
 * Landscape screens get a wide crop, portrait screens a tall one,
 * Either way the photo, lines and ring share one "stage" box with 
 * the photo's own aspect ratio, so the ring stays on the face at any size.
 */
export default function Hero() {
  const { props: landscape } = getImageProps({
    ...common,
    src: "/placeholders/hero-dancer-right.webp",
    loading: "eager",
    fetchPriority: "high",
  });
  const {
    props: { srcSet: portraitSrcSet },
  } = getImageProps({ ...common, src: "/placeholders/hero-dancer-portrait.webp" });

  return (
    <section className={styles.hero}>
      <div className={styles.stage} aria-hidden="true">
        <picture>
          <source media="(max-aspect-ratio: 1/1)" srcSet={portraitSrcSet} sizes="100vw" />
          <img {...landscape} alt="" className={styles.photo} />
        </picture>
        <div className={styles.lines} />
        <div className={styles.ring} />
      </div>
      <div className={styles.scrim} />

      <div className={styles.content}>
        <h1 className={serif.className}>
          Your <em>favorites</em>.
          <br />
          All in one <em>place</em>.
        </h1>
        <p>Discover your next favorite artwork right here.</p>
        <div className={styles.actions}>
          <Button href="/search" variant="solid" icon="arrow_forward">
            Explore
          </Button>
          <Link href="/upload" className={styles.link}>
            Upload artwork
          </Link>
        </div>
      </div>

      <p className={styles.credit}>&copy; {new Date().getFullYear()} Kevin Tolbert</p>
    </section>
  );
}
