import Image from "next/image";
import styles from "./result.module.scss";

type DataProps = {
  name: string;
  src: string;
  alt: string;
}

export default function Result({ name, src, alt }: DataProps) {
  return (
    <div className={styles.result}>
      <Image
        className={styles["result-image"]}
        src={src}
        alt={alt}
        width={320}
        height={200}
      />
      <p className={styles["result-name"]}>{name}</p>
    </div>
    
  )
}