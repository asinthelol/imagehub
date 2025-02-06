import { ReactNode } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upload – ImageHub",
  description: "Upload your artwork.",
};

export default function SearchLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}