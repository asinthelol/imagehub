import uploadImage from "../../lib/uploadImage";

import styles from "./uploaddata.module.scss";
import Button from "../../../components/button/Button";

export default function UploadData({
  textRef,
  fileRef,
}: {
  textRef: React.RefObject<HTMLInputElement>;
  fileRef: React.RefObject<HTMLInputElement>;
}) {
  return (
    <section id={styles["upload-data-container"]}>
        <form id={styles["upload-form"]} onSubmit={(e) => uploadImage(e, textRef, fileRef)}>

          <label htmlFor="title">Title</label>
          <input ref={textRef} id={styles["title-input"]} type="text" name="title" placeholder="Title" required />
          <span id={styles.counter}>0/32</span>

          <Button text="Upload" href="" style="" type="submit" />
        </form>
      </section>
  )
}