
"use client";
import { useRef } from "react";

import styles from "./upload.module.scss";
import UploadFile from "./components/upload-file/UploadFile";
import UploadData from "./components/upload-data/UploadData";

export default function Page() {
  const fileRef = useRef<HTMLInputElement>(null as unknown as HTMLInputElement);
  const textRef = useRef<HTMLInputElement>(null as unknown as HTMLInputElement);

  return (
    <main id={styles.container}>
      <UploadFile fileRef={fileRef} />
      <UploadData textRef={textRef} fileRef={fileRef} />
    
    </main>
  )
}