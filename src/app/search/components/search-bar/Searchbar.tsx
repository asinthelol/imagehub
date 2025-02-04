import styles from "./searchbar.module.scss";
import "../../../styles/icons.scss";

export default function Searchbar() {
  return (
    <section id={styles["input-container"]}>
        <span 
          className={"material-symbols-outlined"}
          id={styles["search-icon"]}>
            search
          </span>
        <input
          id={styles["search-input"]}
          type="search"
          placeholder="Search..." />
      </section>
  )
}