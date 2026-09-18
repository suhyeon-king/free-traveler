import { CountryChips } from "@/components/scr-002/CountryChips";
import { Gallery } from "@/components/scr-002/Gallery";
import { HeroStats } from "@/components/scr-002/HeroStats";
import { Intro } from "@/components/scr-002/Intro";
import { MemorableCta } from "@/components/scr-002/MemorableCta";
import { Timeline } from "@/components/scr-002/Timeline";
import { Footer } from "@/components/shared/Footer";
import { Header } from "@/components/shared/Header";
import { getScreenMetadata } from "@/lib/seo";

export const metadata = getScreenMetadata("/about");

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="mx-auto flex max-w-[1280px] flex-col gap-16 px-4 py-16 md:gap-24 md:px-8">
        <HeroStats />
        <Intro />
        <Timeline />
        <CountryChips />
        <Gallery />
        <MemorableCta />
      </main>
      <Footer />
    </>
  );
}
