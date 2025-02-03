import styles from "./input.module.scss";

export default function Input() {
  return (
    <section id={styles["input-container"]}>
        <span 
          className={styles["material-symbols-outlined"]}
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