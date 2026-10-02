"use client";
import styles from "./theme-toggle.module.scss";

/**
 * The inline script in layout.tsx has already put data-theme on <html> before paint.
 * Both icons are rendered and CSS shows the right one, so there's nothing to hydrate-mismatch.
 */
export default function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement;
    const next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* storage blocked: the choice just won't persist */
    }
  };

  return (
    <button type="button" className={styles.toggle} onClick={toggle} aria-label="Toggle light/dark theme">
      <span className={`material-symbols-outlined ${styles.sun}`} aria-hidden="true">
        light_mode
      </span>
      <span className={`material-symbols-outlined ${styles.moon}`} aria-hidden="true">
        dark_mode
      </span>
    </button>
  );
}
