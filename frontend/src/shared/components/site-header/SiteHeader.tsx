"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/shared/components/logo/Logo";
import ThemeToggle from "@/shared/components/theme-toggle/ThemeToggle";
import styles from "./site-header.module.scss";

const LINKS = [
  { href: "/search", label: "Browse" },
  { href: "/upload", label: "Upload" },
];

// transparent over the landing page, everywhere else it has an underline.
export default function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const pathname = usePathname();

  return (
    <header className={`${styles.header} ${overlay ? styles.overlay : ""}`}>
      <Logo />
      <nav className={styles.nav} aria-label="Primary">
        {LINKS.map(({ href, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`${styles.link} ${active ? styles.active : ""}`}
              aria-current={active ? "page" : undefined}
            >
              {label}
            </Link>
          );
        })}
        <ThemeToggle />
      </nav>
    </header>
  );
}
