import Link from "next/link";
import { useToggleMenu } from "./lib/toggleMenu";
import Button from "../button/Button";
import styles from "./navbar.module.scss";

export default function Navbar() {
  const { isOpen, toggleMenu, closeIfOpen } = useToggleMenu();
  return (
    <header id={styles.header}>
          <nav id={styles["navbar-container"]}>
            <div
              className={`
                ${styles.overlay}
                ${isOpen ? styles.open : styles.closed}`}
            />
            <ul id={`${styles.navbar}`}>
              <li className={styles["nav-link"]} onClick={closeIfOpen}>
              <Link href="/" onClick={toggleMenu}>
                ImageHub
              </Link>
              </li>
              <li className={`${styles["nav-link"]} ${isOpen ? styles.open : ""}`}>
              <Link href="#" onClick={toggleMenu}>
                Upload
              </Link>
                <Button text="Search" style="" href="/explore" />
              </li>
            </ul>
            <div
              className={`${isOpen ? styles.open : ""}`}
              id={`${styles.hamburger}`}
              onClick={toggleMenu}
              aria-label="Hamburger menu"
            >
              <span className={styles["hamburger-line"]}></span>
              <span className={styles["hamburger-line"]}></span>
              <span className={styles["hamburger-line"]}></span>
            </div>
          </nav>
        </header>
  )
}