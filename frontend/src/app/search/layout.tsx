import { ReactNode } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search – ImageHub",
  description: "Search for your favorite artwork.",
};

export default function SearchLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}