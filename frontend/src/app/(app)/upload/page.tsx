import type { Metadata } from "next";
import UploadForm from "@/features/upload/components/UploadForm";

export const metadata: Metadata = {
  title: "Upload",
  description: "Upload your artwork.",
};

export default function Page() {
  return (
    <>
      <h1>Upload artwork</h1>
      <UploadForm />
    </>
  );
}
