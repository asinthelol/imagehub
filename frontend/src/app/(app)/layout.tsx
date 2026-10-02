import Link from "next/link";
import Logo from "@/shared/components/logo/Logo";
import ThemeToggle from "@/shared/components/theme-toggle/ThemeToggle";
import { ToastProvider } from "@/shared/components/toast/Toast";
import styles from "./plain.module.scss";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className={styles.plain}>
        <header>
          <nav aria-label="Primary">
            <Logo />
            <Link href="/">Home</Link>
            <Link href="/search">Browse</Link>
            <Link href="/upload">Upload</Link>
            <ThemeToggle />
          </nav>
        </header>
        <main>{children}</main>
      </div>
    </ToastProvider>
  );
}
