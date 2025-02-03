import styles from "./footer.module.scss";

export default function Footer() {
  return (
    <footer id={styles.footer}>
      <p className={styles["footer-text"]}>&copy; 2025 Kevin Tolbert</p>
    </footer>
  );
}