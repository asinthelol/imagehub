import SiteHeader from "@/shared/components/site-header/SiteHeader";
import Hero from "@/features/home/components/Hero";

export default function Page() {
  return (
    <>
      <SiteHeader overlay />
      <main>
        <Hero />
      </main>
    </>
  );
}
