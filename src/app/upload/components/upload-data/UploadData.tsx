import styles from "./uploaddata.module.scss";
import Button from "../../../components/button/Button";

export default function UploadData() {
  return (
    <section id={styles["upload-data-container"]}>
        <form id={styles["upload-form"]}>

          <label htmlFor="title">Title</label>
          <input id={styles["title-input"]} type="text" name="title" placeholder="Title" required />
          <span id={styles.counter}>0/32</span>

        </form>

        <Button text="Upload" href="" style="" />
      </section>
  )
}