import SiteHeader from "@/shared/components/site-header/SiteHeader";
import { ToastProvider } from "@/shared/components/toast/Toast";
import styles from "./app.module.scss";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <SiteHeader />
      <main className={styles.main}>{children}</main>
    </ToastProvider>
  );
}
