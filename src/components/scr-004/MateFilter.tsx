"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { FOCUS_RING_CLASS_NAME } from "@/lib/a11y";

const GENDER_OPTIONS = [
  { value: "", label: "전체" },
  { value: "male", label: "남성" },
  { value: "female", label: "여성" },
  { value: "any", label: "무관" },
];
const STATUS_OPTIONS = [
  { value: "", label: "전체" },
  { value: "RECRUITING", label: "모집중" },
  { value: "CLOSED", label: "마감" },
];
const AGE_RANGE_OPTIONS = [
  "",
  "19-24",
  "25-29",
  "30-34",
  "35-39",
  "40-49",
  "50+",
];

export interface MateFilterProps {
  /** 현재 필터 조건에 해당하는 결과 개수. Page Owner가 서버에서 계산해 전달한다. */
  resultCount: number;
}

/**
 * SCR-004 검색 Filter + 결과 요약(REQ-FUNC-030). 국가·지역·기간·연령대·성별·
 * 여행 스타일·모집 상태를 URL 검색 파라미터로 관리해 서버 컴포넌트(Page Owner)가
 * 이를 읽어 필터링하도록 한다. 차단 사용자 글 제외는 `DB-RLS-BASE`/`DB-ACCESS`가
 * 처리한다.
 */
export function MateFilter({ resultCount }: MateFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("post");
    router.replace(`/mates${params.toString() ? `?${params.toString()}` : ""}`);
  }

  const country = searchParams.get("country") ?? "";
  const region = searchParams.get("region") ?? "";
  const dateFrom = searchParams.get("dateFrom") ?? "";
  const dateTo = searchParams.get("dateTo") ?? "";
  const ageRange = searchParams.get("ageRange") ?? "";
  const gender = searchParams.get("gender") ?? "";
  const travelStyle = searchParams.get("travelStyle") ?? "";
  const status = searchParams.get("status") ?? "";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col gap-1 text-[13px] text-[#6B6863]">
          국가
          <input
            type="text"
            value={country}
            onChange={(event) => updateParam("country", event.target.value)}
            className={`${FOCUS_RING_CLASS_NAME} h-10 rounded-[10px] border border-[#E4E1DC] px-3 text-[14px] text-[#2B2A28]`}
          />
        </label>
        <label className="flex flex-col gap-1 text-[13px] text-[#6B6863]">
          지역
          <input
            type="text"
            value={region}
            onChange={(event) => updateParam("region", event.target.value)}
            className={`${FOCUS_RING_CLASS_NAME} h-10 rounded-[10px] border border-[#E4E1DC] px-3 text-[14px] text-[#2B2A28]`}
          />
        </label>
        <label className="flex flex-col gap-1 text-[13px] text-[#6B6863]">
          시작일 이후
          <input
            type="date"
            value={dateFrom}
            onChange={(event) => updateParam("dateFrom", event.target.value)}
            className={`${FOCUS_RING_CLASS_NAME} h-10 rounded-[10px] border border-[#E4E1DC] px-3 text-[14px] text-[#2B2A28]`}
          />
        </label>
        <label className="flex flex-col gap-1 text-[13px] text-[#6B6863]">
          종료일 이전
          <input
            type="date"
            value={dateTo}
            onChange={(event) => updateParam("dateTo", event.target.value)}
            className={`${FOCUS_RING_CLASS_NAME} h-10 rounded-[10px] border border-[#E4E1DC] px-3 text-[14px] text-[#2B2A28]`}
          />
        </label>
        <label className="flex flex-col gap-1 text-[13px] text-[#6B6863]">
          연령대
          <select
            value={ageRange}
            onChange={(event) => updateParam("ageRange", event.target.value)}
            className={`${FOCUS_RING_CLASS_NAME} h-10 rounded-[10px] border border-[#E4E1DC] px-3 text-[14px] text-[#2B2A28]`}
          >
            {AGE_RANGE_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value || "전체"}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[13px] text-[#6B6863]">
          성별
          <select
            value={gender}
            onChange={(event) => updateParam("gender", event.target.value)}
            className={`${FOCUS_RING_CLASS_NAME} h-10 rounded-[10px] border border-[#E4E1DC] px-3 text-[14px] text-[#2B2A28]`}
          >
            {GENDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[13px] text-[#6B6863]">
          여행 스타일
          <input
            type="text"
            value={travelStyle}
            onChange={(event) => updateParam("travelStyle", event.target.value)}
            className={`${FOCUS_RING_CLASS_NAME} h-10 rounded-[10px] border border-[#E4E1DC] px-3 text-[14px] text-[#2B2A28]`}
          />
        </label>
        <label className="flex flex-col gap-1 text-[13px] text-[#6B6863]">
          모집 상태
          <select
            value={status}
            onChange={(event) => updateParam("status", event.target.value)}
            className={`${FOCUS_RING_CLASS_NAME} h-10 rounded-[10px] border border-[#E4E1DC] px-3 text-[14px] text-[#2B2A28]`}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="text-[14px] text-[#6B6863]">총 {resultCount}개의 결과</p>
    </div>
  );
}
