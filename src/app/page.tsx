import { Suspense } from "react";

import { AboutSummary } from "@/components/scr-001/AboutSummary";
import { DestinationDrawer } from "@/components/scr-001/DestinationDrawer";
import { DestinationGrid } from "@/components/scr-001/DestinationGrid";
import { HeroSearch } from "@/components/scr-001/HeroSearch";
import { MatePreview } from "@/components/scr-001/MatePreview";
import { SafetyDrawer } from "@/components/scr-001/SafetyDrawer";
import { SafetyGrid } from "@/components/scr-001/SafetyGrid";
import { Footer } from "@/components/shared/Footer";
import { Header } from "@/components/shared/Header";
import { getScreenMetadata } from "@/lib/seo";

export const metadata = getScreenMetadata("/");

const SECTION_SKELETON_CLASS_NAME =
  "h-40 w-full animate-pulse rounded-[16px] bg-[#F7F6F4]";

interface HomePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function asString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value || undefined;
}

/**
 * `?destination=<id>`/`?safety=<countrySlug>` 쿼리 파라미터로 상세 Drawer를 연다.
 * `DestinationDrawer`/`SafetyDrawer`는 이 값이 없으면(=이 페이지에서 아무 함수도
 * 전달받지 못하면) 스스로 `useSearchParams()`로 같은 파라미터를 읽고
 * `useRouter()`로 열고 닫는다 — Page Owner는 조립만 한다(규칙 9).
 */
export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const destinationId = asString(params.destination) ?? null;
  const safetyCountrySlug = asString(params.safety) ?? null;

  return (
    <>
      <Header />
      <main className="mx-auto flex max-w-[1280px] flex-col gap-16 px-4 py-16 md:gap-24 md:px-8">
        <HeroSearch />
        <Suspense fallback={<div className={SECTION_SKELETON_CLASS_NAME} />}>
          <DestinationGrid />
        </Suspense>
        <Suspense fallback={<div className={SECTION_SKELETON_CLASS_NAME} />}>
          <SafetyGrid />
        </Suspense>
        <Suspense fallback={<div className={SECTION_SKELETON_CLASS_NAME} />}>
          <MatePreview />
        </Suspense>
        <AboutSummary />
      </main>
      <Footer />
      <DestinationDrawer destinationId={destinationId} />
      <SafetyDrawer countrySlug={safetyCountrySlug} />
    </>
  );
}
