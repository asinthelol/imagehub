import Link from "next/link";
import Logo from "@/shared/components/logo/Logo";
import Button from "@/shared/components/button/Button";
import ThemeToggle from "@/shared/components/theme-toggle/ThemeToggle";
import styles from "./site-header.module.scss";

/**
 * Header for the landing page. Browse and Upload have their own (currently plain) layout.
 * `overlay` floats it transparently over a full-bleed photo (always white text there).
 */
export default function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  return (
    <header className={`${styles.header} ${overlay ? styles.overlay : ""}`}>
      <Logo />
      <nav className={styles.nav} aria-label="Primary">
        <Link href="/upload" className={styles.link}>
          Upload
        </Link>
        <ThemeToggle />
        <Button href="/search" variant="solid">
          Explore
        </Button>
      </nav>
    </header>
  );
}
