import Link from "next/link";
import styles from "./logo.module.scss";

export default function Logo() {
  return (
    <Link href="/" className={styles.logo} aria-label="ImageHub home">
      ImageHub
    </Link>
  );
}
