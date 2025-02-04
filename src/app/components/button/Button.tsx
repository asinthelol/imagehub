import styles from "./button.module.scss";
import Link from "next/link";

type ButtonProps = {
  text: string;
  style: string;
  href: string;
  onClick?: () => void;
}

export default function Button({ text, style, href, onClick }: ButtonProps) {
  return (
    <Link className={`${styles[style]} ${styles.button}`} aria-label="button" href={href} onClick={onClick}>{text}</Link>
  );
}