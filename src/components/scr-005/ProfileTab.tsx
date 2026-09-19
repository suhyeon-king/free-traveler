"use client";

import { type FormEvent, useState } from "react";

import { FOCUS_RING_CLASS_NAME, MIN_TOUCH_TARGET_CLASS_NAME } from "@/lib/a11y";

const AGE_RANGE_OPTIONS = ["19-24", "25-29", "30-34", "35-39", "40-49", "50+"];
const GENDER_OPTIONS = [
  { value: "", label: "선택 안 함" },
  { value: "male", label: "남성" },
  { value: "female", label: "여성" },
  { value: "undisclosed", label: "비공개" },
];
const TRAVEL_STYLE_OPTIONS = [
  "배낭여행",
  "휴양",
  "미식여행",
  "도시여행",
  "자연여행",
];

export interface ProfileData {
  nickname: string;
  ageRange: string;
  gender: string | null;
  travelStyle: string[];
  isAdult: boolean;
  adultVerifiedAt: string | null;
}

export type ProfileActionResult = { ok: true } | { ok: false; error: string };

interface ProfileTabProps {
  profile: ProfileData;
  /** Server Action(Page Owner가 profiles UPDATE를 감싸 전달). */
  onSave: (input: {
    nickname: string;
    ageRange: string;
    gender: string | null;
    travelStyle: string[];
  }) => Promise<ProfileActionResult>;
  /** Server Action(`confirmAdult` 감쌈). 이미 성인 확인이 끝났으면 호출하지 않는다. */
  onConfirmAdult: () => Promise<ProfileActionResult>;
}

/**
 * SCR-005 프로필·성인 확인 요약(Member, REQ-FUNC-028/029). 닉네임·연령대·여행
 * 스타일은 필수, 성별은 선택이다. 정확한 생년월일은 어디에도 입력받지 않으며
 * `is_adult`+확인 시각만 저장한다.
 */
export function ProfileTab({
  profile,
  onSave,
  onConfirmAdult,
}: ProfileTabProps) {
  const [nickname, setNickname] = useState(profile.nickname);
  const [ageRange, setAgeRange] = useState(profile.ageRange);
  const [gender, setGender] = useState(profile.gender ?? "");
  const [travelStyle, setTravelStyle] = useState<string[]>(profile.travelStyle);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isAdult, setIsAdult] = useState(profile.isAdult);

  function toggleTravelStyle(style: string) {
    setTravelStyle((prev) =>
      prev.includes(style)
        ? prev.filter((item) => item !== style)
        : [...prev, style],
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!nickname.trim() || !ageRange || travelStyle.length === 0) {
      setError("닉네임·연령대·여행 스타일(최소 1개)은 필수입니다.");
      return;
    }
    setError(null);
    setMessage(null);
    setIsSaving(true);
    const result = await onSave({
      nickname: nickname.trim(),
      ageRange,
      gender: gender || null,
      travelStyle,
    });
    setIsSaving(false);
    if (result.ok) {
      setMessage("프로필을 저장했습니다.");
    } else {
      setError(result.error);
    }
  }

  async function handleConfirmAdult() {
    setIsConfirming(true);
    const result = await onConfirmAdult();
    setIsConfirming(false);
    if (result.ok) {
      setIsAdult(true);
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        {isAdult ? (
          <span className="inline-block rounded-[999px] bg-[#1E8A5F] px-3 py-1 text-[13px] font-semibold text-[#FFFFFF]">
            성인 확인 완료
          </span>
        ) : (
          <button
            type="button"
            onClick={handleConfirmAdult}
            disabled={isConfirming}
            className={`${FOCUS_RING_CLASS_NAME} ${MIN_TOUCH_TARGET_CLASS_NAME} rounded-[999px] border border-[#1F4B8F] px-4 text-[13px] font-semibold text-[#1F4B8F] disabled:opacity-50`}
          >
            {isConfirming ? "확인 중..." : "성인 확인하기(만 19세 이상)"}
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-[13px] text-[#6B6863]">
          닉네임
          <input
            type="text"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            maxLength={30}
            required
            className={`${FOCUS_RING_CLASS_NAME} h-12 rounded-[10px] border border-[#E4E1DC] px-3 text-[16px] text-[#2B2A28]`}
          />
        </label>

        <label className="flex flex-col gap-1 text-[13px] text-[#6B6863]">
          연령대
          <select
            value={ageRange}
            onChange={(event) => setAgeRange(event.target.value)}
            required
            className={`${FOCUS_RING_CLASS_NAME} h-12 rounded-[10px] border border-[#E4E1DC] px-3 text-[16px] text-[#2B2A28]`}
          >
            <option value="">선택하세요</option>
            {AGE_RANGE_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-[13px] text-[#6B6863]">
          성별(선택)
          <select
            value={gender}
            onChange={(event) => setGender(event.target.value)}
            className={`${FOCUS_RING_CLASS_NAME} h-12 rounded-[10px] border border-[#E4E1DC] px-3 text-[16px] text-[#2B2A28]`}
          >
            {GENDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-[13px] text-[#6B6863]">
            여행 스타일(최소 1개)
          </legend>
          <div className="flex flex-wrap gap-2">
            {TRAVEL_STYLE_OPTIONS.map((style) => (
              <label
                key={style}
                className="flex items-center gap-2 rounded-[999px] border border-[#E4E1DC] px-3 py-2 text-[14px] text-[#2B2A28]"
              >
                <input
                  type="checkbox"
                  checked={travelStyle.includes(style)}
                  onChange={() => toggleTravelStyle(style)}
                />
                {style}
              </label>
            ))}
          </div>
        </fieldset>

        {error ? (
          <p role="alert" className="text-[14px] font-semibold text-[#D0342C]">
            {error}
          </p>
        ) : null}
        {message ? (
          <p role="status" className="text-[14px] text-[#1E8A5F]">
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSaving}
          className={`${FOCUS_RING_CLASS_NAME} ${MIN_TOUCH_TARGET_CLASS_NAME} w-fit rounded-[999px] bg-[#F0653C] px-6 text-[16px] font-semibold text-[#FFFFFF] disabled:cursor-not-allowed disabled:bg-[#FDE3D8]`}
        >
          {isSaving ? "저장 중..." : "프로필 저장"}
        </button>
      </form>
    </div>
  );
}
