import styles from "./input.module.scss";
import "../../../styles/icons.scss";

export default function Input() {
  return (
    <section id={styles["input-container"]}>
        <span 
          className={"material-symbols-outlined"}
          id={styles["search-icon"]}>
            search
          </span>
        <input
          className={styles["search-input"]}
          type="search"
          placeholder="Search..." />
      </section>
  )
}