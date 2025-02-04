import styles from "./uploadfile.module.scss";
import "../../../styles/icons.scss";

export default function UploadFile() {
  return (
    <section id={styles["upload-container"]}>
        {/* These button is different from the <a> buttons before. */}
        <button className={"material-symbols-outlined"} id={styles["upload-icon"]}>
          upload
        </button>
        <input id={styles["file-input"]} type="file" accept=".jpg, .jpeg, .png, .gif" hidden />

        <button className={"material-symbols-outlined"} id={styles["clear-icon"]} hidden>
          close
        </button>

          <h1>JPG / GIF / PNG</h1>
      </section>
  )
}