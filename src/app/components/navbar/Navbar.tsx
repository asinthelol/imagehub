import Link from "next/link";
import { useToggleMenu } from "./lib/toggleMenu";
import Button from "../button/Button";
import styles from "./navbar.module.scss";

export default function Navbar() {
  const { isOpen, toggleMenu, closeIfOpen } = useToggleMenu();
  return (
    <header>
          <nav id={styles.navbarContainer}>
            <div
              className={`
                ${styles.overlay}
                ${isOpen ? styles.open : styles.closed}`}
            />
            <ul id={`${styles.navbar}`}>
              <li className={styles.navLink} onClick={closeIfOpen}>
              <Link href="/" onClick={toggleMenu}>
                ImageHub
              </Link>
              </li>
              <li className={`${styles.navLink} ${isOpen ? styles.open : ""}`}>
              <Link href="#" onClick={toggleMenu}>
                Contact
              </Link>
                <Button text="Explore" style="underline" href="/explore" />
              </li>
            </ul>
            <div
              className={`${isOpen ? styles.open : ""}`}
              id={`${styles.hamburger}`}
              onClick={toggleMenu}
              aria-label="Hamburger menu"
            >
              <span className={styles.hamburgerLine}></span>
              <span className={styles.hamburgerLine}></span>
              <span className={styles.hamburgerLine}></span>
            </div>
          </nav>
        </header>
  )
}