
"use client";
import styles from "./searchbar.module.scss";

type SearchBarProps = {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
};

export default function Searchbar({ searchTerm, setSearchTerm }: SearchBarProps) {

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
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </section>
  )
}