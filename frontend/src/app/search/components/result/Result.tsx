import Image from "next/image";
import styles from "./result.module.scss";
import "../../../styles/icons.scss";

type DataProps = {
  name: string;
  src: string;
  alt: string;
}

export default function Result({ name, src, alt }: DataProps) {

  return (
    <div className={styles.result}>
      <div className={styles["delete-icon"]}>
        <span className="material-symbols-outlined">
          delete
        </span>
      </div>
      <div className={styles["result-info"]}>
        <p className={styles["result-name"]}>{name}</p>
        <div className={styles["download-icon"]}>
          <span className="material-symbols-outlined">
            download
          </span>
        </div>
      </div>
      <Image
        className={styles["result-image"]}
        src={src}
        alt={alt}
        width={320}
        height={200}
        data-imagename={name}
      />
    </div> 
  )
}