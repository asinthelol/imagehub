
"use client";
import { useRef } from "react";

import styles from "./upload.module.scss";
import UploadFile from "./components/upload-file/UploadFile";
import UploadData from "./components/upload-data/UploadData";
import validateInput from "./lib/validateInput";

export default function Page() {
  const fileRef = useRef<HTMLInputElement>(null as unknown as HTMLInputElement);
  const textRef = useRef<HTMLInputElement>(null as unknown as HTMLInputElement);

  const handleValidation = async () => {
    const IsFileValid = await validateInput(fileRef, "fileInput");
    const IsTextValid = await validateInput(textRef, "textInput");
  }

  return (
    <main id={styles.container}>
      <UploadFile fileRef={fileRef} />
      <UploadData textRef={textRef} fileRef={fileRef} handleValidation={handleValidation} />
    
    </main>
  )
}