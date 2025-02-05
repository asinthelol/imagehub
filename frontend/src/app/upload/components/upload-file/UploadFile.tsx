"use client";
import { useState } from "react";
import styles from "./uploadfile.module.scss";
import "../../../styles/icons.scss";

export default function UploadFile({ fileRef }: { fileRef: React.RefObject<HTMLInputElement> }) {
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const handleClearFile = () => {
    setFilePreview(null);
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  return (
    <section className={filePreview ? "" : styles["required"]} id={styles["upload-container"]}>
      {filePreview ? (
        <>
          <img src={filePreview} alt="Selected File" className={styles["image-file"]} />
          <button className="material-symbols-outlined" id={styles["clear-icon"]} onClick={handleClearFile}>
            close
          </button>
        </>
      ) : (
        <button className="material-symbols-outlined" id={styles["upload-icon"]} onClick={() => fileRef.current?.click()}>
          upload
        </button>
      )}

      <input ref={fileRef} id={styles["file-input"]} type="file" accept=".jpg, .jpeg, .png, .gif" onChange={handleFileChange} hidden />
    </section>
  );
}
