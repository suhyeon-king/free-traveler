"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { FOCUS_RING_CLASS_NAME, MIN_TOUCH_TARGET_CLASS_NAME } from "@/lib/a11y";
import { sanitizeUserText } from "@/lib/security";

const PHONE_PATTERN =
  /(01[0-9][-.\s]?\d{3,4}[-.\s]?\d{4})|(\+?\d{1,3}[-.\s]?\d{2,4}[-.\s]?\d{3,4}[-.\s]?\d{4})/;
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const MESSENGER_PATTERN =
  /(카카오\s*톡|카톡|kakao\s*talk|인스타(그램)?|instagram|텔레그램|telegram|위챗|wechat|라인\s*id|line\s*id)\s*[:\-]?\s*[a-zA-Z0-9._]{2,}/i;

/** 전화번호·이메일·메신저 ID로 보이는 패턴을 탐지한다(REQ-FUNC-032). */
export function detectContactInfo(text: string): boolean {
  return (
    PHONE_PATTERN.test(text) ||
    EMAIL_PATTERN.test(text) ||
    MESSENGER_PATTERN.test(text)
  );
}

const TRAVEL_STYLE_OPTIONS = [
  "배낭여행",
  "휴양",
  "미식여행",
  "도시여행",
  "자연여행",
];

export interface MateWriteFormInput {
  title: string;
  country: string;
  region?: string;
  startDate: string;
  endDate: string;
  headcount: number;
  travelStyle: string[];
  description: string;
}

export type MateWriteSubmitResult =
  { ok: true; postId: string } | { ok: false; error: string };

interface MateWriteTabProps {
  /** 비로그인이면 `null`. */
  user: { id: string; isAdult: boolean } | null;
  /**
   * 실제 저장은 Server Action으로 수행한다(Client Component는 `db/mates.ts`를
   * 직접 호출할 수 없다 — `createServerSupabaseClient`가 `cookies()`를 쓰는
   * 서버 전용 API이기 때문이다). `PAGE-SCR003`이 `DB-ACCESS`의
   * `createMatePost`를 감싼 Server Action을 만들어 이 prop으로 전달해야 한다.
   */
  onSubmit: (input: MateWriteFormInput) => Promise<MateWriteSubmitResult>;
}

const EMPTY_FORM: MateWriteFormInput = {
  title: "",
  country: "",
  region: "",
  startDate: "",
  endDate: "",
  headcount: 2,
  travelStyle: [],
  description: "",
};

/**
 * SCR-003 동행 구하기 탭(REQ-FUNC-027~029/031~033/080). 비로그인/성인 미확인
 * 시 로그인 안내 카드를, 인증 완료 시 작성 Form을 보여준다.
 */
export function MateWriteTab({ user, onSubmit }: MateWriteTabProps) {
  const router = useRouter();
  const [form, setForm] = useState<MateWriteFormInput>(EMPTY_FORM);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user || !user.isAdult) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-[16px] bg-[#F7F6F4] px-6 py-12 text-center">
        <p className="text-[16px] text-[#2B2A28]">
          {user
            ? "성인 확인 후 동행글을 작성할 수 있습니다."
            : "로그인 후 동행글을 작성할 수 있습니다."}
        </p>
        <Link
          href="/account"
          className={`${FOCUS_RING_CLASS_NAME} ${MIN_TOUCH_TARGET_CLASS_NAME} inline-flex items-center rounded-[999px] bg-[#F0653C] px-6 text-[16px] font-semibold text-[#FFFFFF] active:bg-[#D64F29]`}
        >
          로그인/가입하기
        </Link>
      </div>
    );
  }

  const contactDetected =
    detectContactInfo(form.title) || detectContactInfo(form.description);
  const todayIso = new Date().toISOString().slice(0, 10);
  const canSubmit = agreed && !contactDetected && !isSubmitting;

  function toggleTravelStyle(style: string) {
    setForm((prev) => ({
      ...prev,
      travelStyle: prev.travelStyle.includes(style)
        ? prev.travelStyle.filter((item) => item !== style)
        : [...prev.travelStyle, style],
    }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (
      !form.title ||
      !form.country ||
      !form.startDate ||
      !form.endDate ||
      !form.description
    ) {
      setError("제목·국가·기간·설명을 모두 입력해 주세요.");
      return;
    }
    if (form.endDate < form.startDate) {
      setError("종료일은 시작일과 같거나 이후여야 합니다.");
      return;
    }
    if (contactDetected) {
      setError(
        "제목/설명에 전화번호·이메일·메신저 ID로 보이는 정보가 포함되어 있습니다. 삭제한 뒤 다시 제출해 주세요.",
      );
      return;
    }
    if (!agreed) {
      setError("동행 안전수칙에 동의해야 제출할 수 있습니다.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    const result = await onSubmit({
      ...form,
      title: sanitizeUserText(form.title, 100),
      description: sanitizeUserText(form.description, 2000),
    });
    setIsSubmitting(false);

    if (result.ok) {
      router.push(`/mates?post=${result.postId}`);
    } else {
      setError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-[13px] text-[#6B6863]">
        제목
        <input
          type="text"
          value={form.title}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, title: event.target.value }))
          }
          maxLength={100}
          required
          className={`${FOCUS_RING_CLASS_NAME} h-12 rounded-[10px] border border-[#E4E1DC] px-3 text-[16px] text-[#2B2A28]`}
        />
      </label>

      <label className="flex flex-col gap-1 text-[13px] text-[#6B6863]">
        국가
        <input
          type="text"
          value={form.country}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, country: event.target.value }))
          }
          required
          className={`${FOCUS_RING_CLASS_NAME} h-12 rounded-[10px] border border-[#E4E1DC] px-3 text-[16px] text-[#2B2A28]`}
        />
      </label>

      <label className="flex flex-col gap-1 text-[13px] text-[#6B6863]">
        지역(선택)
        <input
          type="text"
          value={form.region}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, region: event.target.value }))
          }
          className={`${FOCUS_RING_CLASS_NAME} h-12 rounded-[10px] border border-[#E4E1DC] px-3 text-[16px] text-[#2B2A28]`}
        />
      </label>

      <div className="flex flex-col gap-4 md:flex-row">
        <label className="flex flex-1 flex-col gap-1 text-[13px] text-[#6B6863]">
          시작일
          <input
            type="date"
            min={todayIso}
            value={form.startDate}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, startDate: event.target.value }))
            }
            required
            className={`${FOCUS_RING_CLASS_NAME} h-12 rounded-[10px] border border-[#E4E1DC] px-3 text-[16px] text-[#2B2A28]`}
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-[13px] text-[#6B6863]">
          종료일
          <input
            type="date"
            min={form.startDate || todayIso}
            value={form.endDate}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, endDate: event.target.value }))
            }
            required
            className={`${FOCUS_RING_CLASS_NAME} h-12 rounded-[10px] border border-[#E4E1DC] px-3 text-[16px] text-[#2B2A28]`}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-[13px] text-[#6B6863]">
        모집 인원
        <input
          type="number"
          min={1}
          value={form.headcount}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              headcount: Number(event.target.value),
            }))
          }
          required
          className={`${FOCUS_RING_CLASS_NAME} h-12 w-24 rounded-[10px] border border-[#E4E1DC] px-3 text-[16px] text-[#2B2A28]`}
        />
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-[13px] text-[#6B6863]">여행 스타일</legend>
        <div className="flex flex-wrap gap-2">
          {TRAVEL_STYLE_OPTIONS.map((style) => (
            <label
              key={style}
              className="flex items-center gap-2 rounded-[999px] border border-[#E4E1DC] px-3 py-2 text-[14px] text-[#2B2A28]"
            >
              <input
                type="checkbox"
                checked={form.travelStyle.includes(style)}
                onChange={() => toggleTravelStyle(style)}
              />
              {style}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1 text-[13px] text-[#6B6863]">
        설명
        <textarea
          value={form.description}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, description: event.target.value }))
          }
          maxLength={2000}
          required
          rows={5}
          className={`${FOCUS_RING_CLASS_NAME} rounded-[10px] border border-[#E4E1DC] px-3 py-2 text-[16px] text-[#2B2A28]`}
        />
      </label>

      {contactDetected ? (
        <p role="alert" className="text-[14px] font-semibold text-[#D0342C]">
          전화번호·이메일·메신저 ID로 보이는 정보는 입력할 수 없습니다. 동행
          참가 요청은 앱 안에서만 이뤄집니다.
        </p>
      ) : null}

      <label className="flex items-center gap-2 text-[14px] text-[#2B2A28]">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(event) => setAgreed(event.target.checked)}
        />
        동행 안전수칙에 동의합니다.
      </label>

      {error ? (
        <p role="alert" className="text-[14px] font-semibold text-[#D0342C]">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={!canSubmit}
        className={`${FOCUS_RING_CLASS_NAME} ${MIN_TOUCH_TARGET_CLASS_NAME} inline-flex w-fit items-center rounded-[999px] bg-[#F0653C] px-6 text-[16px] font-semibold text-[#FFFFFF] disabled:cursor-not-allowed disabled:bg-[#FDE3D8]`}
      >
        {isSubmitting ? "제출 중..." : "동행글 등록"}
      </button>
    </form>
  );
}
