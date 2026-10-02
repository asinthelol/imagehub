import { Suspense } from "react";
import type { Metadata } from "next";
import BrowseView from "@/features/search/components/BrowseView/BrowseView";

export const metadata: Metadata = {
  title: "Browse",
  description: "Search for your favorite artwork.",
};

export default function Page() {
  // BrowseView reads the ?q= search param, which needs a Suspense boundary
  return (
    <Suspense>
      <BrowseView />
    </Suspense>
  );
}
