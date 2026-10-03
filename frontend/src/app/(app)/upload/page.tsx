import type { Metadata } from "next";
import UploadForm from "@/features/upload/components/UploadForm/UploadForm";

export const metadata: Metadata = {
  title: "Upload",
  description: "Upload your artwork.",
};

export default function Page() {
  return <UploadForm />;
}
