"use client";
import { useState } from "react";
import uploadImage from "@/features/upload/api/uploadImage";

import styles from "./fileinformation.module.scss";
import Button from "@/shared/components/button/Button";

export default function FileInformation({
  textRef,
  fileRef,
}: {
  textRef: React.RefObject<HTMLInputElement>;
  fileRef: React.RefObject<HTMLInputElement>;
}) {
  const [hasText, setHasText] = useState(false);
  
    const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.value.length > 0) {
        setHasText(true);
      } else {
        setHasText(false);
      }
    };
  return (
    <section className={`${!hasText ? styles["required"] : ""}`} id={styles["upload-data-container"]}>
        <form id={styles["upload-form"]} onSubmit={(e) => uploadImage(e, textRef, fileRef)}>

          <label htmlFor="title">Title</label>
          <input ref={textRef} id={styles["title-input"]} type="text" name="title" placeholder="Title" onChange={handleTextChange} />

          <Button text="Upload" href="" style="" type="submit" />
        </form>
      </section>
  )
}