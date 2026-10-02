import type { Metadata } from "next";
import UploadForm from "@/features/upload/components/UploadForm";
import plain from "@/shared/styles/plain.module.scss"; // temporary, until the Upload page is designed

export const metadata: Metadata = {
  title: "Upload",
  description: "Upload your artwork.",
};

export default function Page() {
  return (
    <div className={plain.page}>
      <h1>Upload artwork</h1>
      <UploadForm />
    </div>
  );
}
