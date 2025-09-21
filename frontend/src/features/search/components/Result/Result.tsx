import Image from "next/image";
import styles from "./result.module.scss";
import { deleteImages } from "@/features/search/api/deleteImages";
import { downloadImages } from '@/features/search/api/downloadImages';

type DataProps = {
  id: number;
  name: string;
  src: string;
  alt: string;
}

const { deleteImage } = deleteImages();
const { downloadImage } = downloadImages();

export default function Result({ id, name, src, alt }: DataProps) {

  const truncatedName = (name: string) => {
    const maxLength = 16;
    return name.length > maxLength ? name.slice(0, maxLength) + "..." : name;
  }
  
  return (
    <div className={styles.result}>
      <div className={styles["delete-icon"]}>
        <span className="material-symbols-outlined" onClick={() => deleteImage(id)}>
          delete
        </span>
      </div>
      <div className={styles["result-info"]}>
        <p className={styles["result-name"]}>{truncatedName(name)}</p>
        <div className={styles["download-icon"]}>
          <span className="material-symbols-outlined" onClick={async () => await downloadImage({name, src})}>
            download
          </span>
        </div>
      </div>
      <Image
        className={styles["result-image"]}
        src={`http://localhost:5000${src}`}
        alt={alt}
        width={320}
        height={200}
      />
    </div> 
  )
}