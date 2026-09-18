import { Suspense } from "react";

import { AboutSummary } from "@/components/scr-001/AboutSummary";
import { DestinationGrid } from "@/components/scr-001/DestinationGrid";
import { HeroSearch } from "@/components/scr-001/HeroSearch";
import { MatePreview } from "@/components/scr-001/MatePreview";
import { SafetyGrid } from "@/components/scr-001/SafetyGrid";
import { Footer } from "@/components/shared/Footer";
import { Header } from "@/components/shared/Header";
import { getScreenMetadata } from "@/lib/seo";

export const metadata = getScreenMetadata("/");

const SECTION_SKELETON_CLASS_NAME =
  "h-40 w-full animate-pulse rounded-[16px] bg-[#F7F6F4]";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="mx-auto flex max-w-[1280px] flex-col gap-16 px-4 py-16 md:gap-24 md:px-8">
        <HeroSearch />
        <Suspense fallback={<div className={SECTION_SKELETON_CLASS_NAME} />}>
          <DestinationGrid />
        </Suspense>
        <SafetyGrid />
        <Suspense fallback={<div className={SECTION_SKELETON_CLASS_NAME} />}>
          <MatePreview />
        </Suspense>
        <AboutSummary />
      </main>
      <Footer />
    </>
  );
}
