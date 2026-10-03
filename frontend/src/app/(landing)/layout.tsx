import styles from "./landing.module.scss";

// The landing page composes its own header/footer because each hero style needs a different one.
export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <div className={styles.page}>{children}</div>;
}
