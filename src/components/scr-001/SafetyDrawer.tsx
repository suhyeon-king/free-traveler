"use client";

import {
  getCountrySafety,
  isSafetyStale,
  SAFETY_CATEGORY_LABELS,
  SAFETY_CATEGORY_ORDER,
} from "@/data/safety";
import { Drawer } from "@/components/shared/Drawer";

interface SafetyDrawerProps {
  countrySlug: string | null;
  onClose: () => void;
}

/**
 * 안전정보 Drawer(REQ-FUNC-047~054). 8개 카테고리, 출처·최종 확인일·편집자,
 * 외교부 링크(새 탭+noopener,noreferrer), stale 경고(렌더링 시 계산, 배치 없음),
 * 공식 판단 대체 불가 고지를 표시한다.
 *
 * **알아둘 점(간소화)**: `src/data/safety.ts`(다른 완료된 Task) 스키마에 중대 경보
 * 단계·지역별 범위 필드가 없어, REQ-FUNC-051(중대 경보 상단 텍스트)은 현재 표시할
 * 데이터가 없고, REQ-FUNC-052(국가/지역 범위 구분)는 항상 "국가 전체"로 표시한다.
 * 실제 경보 단계·지역 범위 데이터가 추가되면 이 Drawer도 함께 갱신해야 한다.
 */
export function SafetyDrawer({ countrySlug, onClose }: SafetyDrawerProps) {
  const country = countrySlug ? getCountrySafety(countrySlug) : undefined;

  if (!country) {
    return null;
  }

  const stale = isSafetyStale(country.verifiedAt);
  const titleId = `safety-drawer-title-${country.countrySlug}`;

  return (
    <Drawer
      isOpen={Boolean(countrySlug)}
      onClose={onClose}
      titleId={titleId}
      side="left"
    >
      <div className="flex flex-col gap-4">
        <div>
          <h2 id={titleId} className="text-[24px] font-bold text-[#2B2A28]">
            {country.countryName}
          </h2>
          <p className="text-[13px] text-[#6B6863]">범위: 국가 전체</p>
        </div>

        {stale ? (
          <p className="rounded-[10px] bg-[#FDE3D8] px-4 py-3 text-[14px] font-semibold text-[#B7791F]">
            ⚠ 최신 정보 재확인 필요 — 최종 확인 후 7일이 지났습니다. 출국 전
            아래 공식 출처에서 원문을 다시 확인하세요.
          </p>
        ) : null}

        <dl className="flex flex-col gap-4">
          {SAFETY_CATEGORY_ORDER.map((key) => (
            <div key={key}>
              <dt className="text-[16px] font-semibold text-[#2B2A28]">
                {SAFETY_CATEGORY_LABELS[key]}
              </dt>
              <dd className="mt-1 text-[14px] text-[#2B2A28]">
                {country.categories[key]}
              </dd>
            </div>
          ))}
        </dl>

        <a
          href={country.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[14px] font-semibold text-[#1F4B8F] underline"
        >
          {country.sourceName} 원문 보기(새 탭)
        </a>
        <p className="text-[13px] text-[#6B6863]">
          최종 확인일: {country.verifiedAt} · 편집자: {country.editor}
        </p>

        <p className="text-[13px] leading-[1.5] text-[#6B6863]">
          이 안전정보는 공식 판단을 대체하지 않습니다. 출국 직전 외교부 등 공식
          출처의 원문을 반드시 재확인하세요.
        </p>
      </div>
    </Drawer>
  );
}
