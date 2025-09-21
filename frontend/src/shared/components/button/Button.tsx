import styles from "./button.module.scss";
import Link from "next/link";

type ButtonProps = {
  text: string;
  style: string;
  href: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

export default function Button({ text, style, href, onClick, type}: ButtonProps) {
  if (type === "submit") {
    return (
      <button className={`${styles[style]} ${styles.button}`} type="submit" onClick={onClick}>
        {text}
      </button>
    );
  }

  return (
    <Link className={`${styles[style]} ${styles.button}`} aria-label="button" href={href || "#"} onClick={onClick}>
      {text}
    </Link>
  );
}