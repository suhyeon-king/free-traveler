"use client";

import { type FormEvent, useState } from "react";

import { FOCUS_RING_CLASS_NAME, MIN_TOUCH_TARGET_CLASS_NAME } from "@/lib/a11y";
import { openOutboundLink, validateOutboundUrl } from "@/lib/outbound-link";

/**
 * 국가→지역(도시) 목록. `FlightTab.tsx`(다른 Task 소유)와 별개 파일이라
 * 로컬 사본을 유지한다.
 */
const COUNTRY_REGIONS: Record<string, string[]> = {
  일본: ["도쿄", "오사카", "후쿠오카", "삿포로"],
  베트남: ["하노이", "다낭", "호치민"],
  태국: ["방콕", "치앙마이", "푸켓"],
  대만: ["타이베이", "가오슝"],
  프랑스: ["파리", "니스", "리옹"],
  이탈리아: ["로마", "피렌체", "밀라노"],
  스페인: ["바르셀로나", "마드리드"],
  영국: ["런던", "에든버러"],
  독일: ["베를린", "뮌헨"],
  미국: ["뉴욕", "로스앤젤레스"],
  오스트레일리아: ["시드니", "멜버른"],
};
const COUNTRIES = Object.keys(COUNTRY_REGIONS);

const NON_TRANSMISSION_NOTICE = "입력값은 외부 사이트로 전달되지 않습니다";
const TIPS = [
  "숙소 위치는 주요 교통 거점과의 거리를 함께 확인해 보세요.",
  "체크인/체크아웃 시간은 숙소마다 다르니 공식 페이지에서 다시 확인하세요.",
  "취소 정책은 예약 전 반드시 원문으로 확인하세요.",
];

interface HotelFormState {
  country: string;
  region: string;
  checkInDate: string;
  checkOutDate: string;
}

const EMPTY_FORM: HotelFormState = {
  country: "",
  region: "",
  checkInDate: "",
  checkOutDate: "",
};

interface HotelTabProps {
  /** `hotel_outbound_url`(app_settings) 또는 `HOTEL_OUTBOUND_URL` 환경변수 값.
   * 서버에서 미리 해석해 문자열로 전달한다(Server→Client 직렬화 제약). */
  outboundUrl: string | null;
}

function getTodayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * SCR-003 숙소 탭(입력·검증·요약·외부이동·Tip, REQ-FUNC-019~026, REQ-NF-017).
 * 국가·지역·체크인·체크아웃 입력값은 React 상태로만 유지하며 서버로 전송하지 않는다.
 */
export function HotelTab({ outboundUrl }: HotelTabProps) {
  const [form, setForm] = useState<HotelFormState>(EMPTY_FORM);
  const [isSummary, setIsSummary] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const regions = form.country ? (COUNTRY_REGIONS[form.country] ?? []) : [];
  const todayIso = getTodayIso();
  const urlValidation = validateOutboundUrl(outboundUrl);

  function handleCountryChange(country: string) {
    // 국가 변경 시 지역 옵션을 재계산하고 기존 선택값을 초기화한다(REQ-FUNC-020).
    setForm((prev) => ({ ...prev, country, region: "" }));
  }

  function validate(): string | null {
    if (
      !form.country ||
      !form.region ||
      !form.checkInDate ||
      !form.checkOutDate
    ) {
      return "국가·지역·체크인·체크아웃을 모두 입력해 주세요.";
    }
    if (form.checkInDate < todayIso) {
      return "체크인은 오늘 이후로 선택해 주세요.";
    }
    if (form.checkOutDate <= form.checkInDate) {
      return "체크아웃은 체크인보다 이후여야 합니다.";
    }
    return null;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setIsSummary(false);
      return;
    }
    setError(null);
    setIsSummary(true);
  }

  function handleOpenOutbound() {
    if (urlValidation.ok) {
      openOutboundLink(urlValidation.url);
    }
  }

  if (isSummary) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-[14px] text-[#6B6863]">{NON_TRANSMISSION_NOTICE}</p>
        <div className="rounded-[16px] border border-[#E4E1DC] p-4">
          <p className="text-[16px] font-semibold text-[#2B2A28]">
            {form.country} · {form.region}
          </p>
          <p className="text-[14px] text-[#6B6863]">
            {form.checkInDate} ~ {form.checkOutDate}
          </p>
        </div>

        {urlValidation.ok ? (
          <button
            type="button"
            onClick={handleOpenOutbound}
            className={`${FOCUS_RING_CLASS_NAME} ${MIN_TOUCH_TARGET_CLASS_NAME} inline-flex w-fit items-center rounded-[999px] bg-[#F0653C] px-6 text-[16px] font-semibold text-[#FFFFFF] active:bg-[#D64F29]`}
          >
            숙소 보러 가기
          </button>
        ) : (
          <div
            role="alert"
            className="rounded-[10px] bg-[#FDE3D8] px-4 py-3 text-[14px] text-[#D0342C]"
          >
            숙소 외부 이동 URL이 설정되지 않았습니다.{" "}
            <button
              type="button"
              onClick={() => setIsSummary(false)}
              className={`${FOCUS_RING_CLASS_NAME} underline`}
            >
              다시 시도
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsSummary(false)}
          className={`${FOCUS_RING_CLASS_NAME} w-fit text-[14px] text-[#6B6863] underline`}
        >
          입력 수정하기
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-[14px] text-[#6B6863]">{NON_TRANSMISSION_NOTICE}</p>

      <label className="flex flex-col gap-1 text-[13px] text-[#6B6863]">
        국가
        <select
          value={form.country}
          onChange={(event) => handleCountryChange(event.target.value)}
          required
          className={`${FOCUS_RING_CLASS_NAME} h-12 rounded-[10px] border border-[#E4E1DC] px-3 text-[16px] text-[#2B2A28]`}
        >
          <option value="">선택하세요</option>
          {COUNTRIES.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-[13px] text-[#6B6863]">
        지역
        <select
          value={form.region}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, region: event.target.value }))
          }
          disabled={!form.country}
          required
          className={`${FOCUS_RING_CLASS_NAME} h-12 rounded-[10px] border border-[#E4E1DC] px-3 text-[16px] text-[#2B2A28] disabled:bg-[#F7F6F4]`}
        >
          <option value="">
            {form.country ? "선택하세요" : "국가를 먼저 선택하세요"}
          </option>
          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-col gap-4 md:flex-row">
        <label className="flex flex-1 flex-col gap-1 text-[13px] text-[#6B6863]">
          체크인
          <input
            type="date"
            min={todayIso}
            value={form.checkInDate}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, checkInDate: event.target.value }))
            }
            required
            className={`${FOCUS_RING_CLASS_NAME} h-12 rounded-[10px] border border-[#E4E1DC] px-3 text-[16px] text-[#2B2A28]`}
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-[13px] text-[#6B6863]">
          체크아웃
          <input
            type="date"
            min={form.checkInDate || todayIso}
            value={form.checkOutDate}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                checkOutDate: event.target.value,
              }))
            }
            required
            className={`${FOCUS_RING_CLASS_NAME} h-12 rounded-[10px] border border-[#E4E1DC] px-3 text-[16px] text-[#2B2A28]`}
          />
        </label>
      </div>

      {error ? (
        <p role="alert" className="text-[14px] font-semibold text-[#D0342C]">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        className={`${FOCUS_RING_CLASS_NAME} ${MIN_TOUCH_TARGET_CLASS_NAME} inline-flex w-fit items-center rounded-[999px] bg-[#F0653C] px-6 text-[16px] font-semibold text-[#FFFFFF] active:bg-[#D64F29]`}
      >
        계속
      </button>

      <div className="flex gap-3 overflow-x-auto">
        {TIPS.map((tip) => (
          <p
            key={tip}
            className="shrink-0 rounded-[10px] border border-[#E4E1DC] px-3 py-2 text-[13px] text-[#6B6863] md:max-w-[200px]"
          >
            {tip}
          </p>
        ))}
      </div>
    </form>
  );
}
