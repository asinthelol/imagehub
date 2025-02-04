import styles from "./upload.module.scss";
import UploadFile from "./components/upload-file/UploadFile";
import UploadData from "./components/upload-data/UploadData";

export default function Page() {
  return (
    <main id={styles.container}>
      <UploadFile />
      <UploadData />
    
    </main>
  )
}