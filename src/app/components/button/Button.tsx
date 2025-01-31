import styles from "./button.module.scss";
import Link from "next/link";

type ButtonProps = {
  text: string;
  style: string;
  href: string;
}

export default function Button({ text, style, href }: ButtonProps) {
  return (
    <Link className={`${styles[style]} ${styles.button}`} aria-label="button" href={href}>{text}</Link>
  );
}