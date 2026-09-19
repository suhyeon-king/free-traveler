"use client";

import { type FormEvent, useState } from "react";

import { Modal } from "@/components/shared/Modal";
import { FOCUS_RING_CLASS_NAME, MIN_TOUCH_TARGET_CLASS_NAME } from "@/lib/a11y";
import { sanitizeUserText } from "@/lib/security";
import type { ReportTargetType } from "@/lib/db/reports";

const REASON_OPTIONS = [
  { value: "SPAM", label: "스팸/광고" },
  { value: "ABUSE", label: "욕설/혐오 표현" },
  { value: "SCAM", label: "사기 의심" },
  { value: "CONTACT_INFO", label: "개인정보·연락처 노출" },
  { value: "OTHER", label: "기타" },
];

export type ReportSubmitResult =
  | { ok: true; reportId: string; createdAt: string }
  | { ok: false; error: string };

interface ReportButtonProps {
  targetType: ReportTargetType;
  targetId: string;
  /** 비로그인이면 신고 버튼 자체를 숨긴다. */
  isLoggedIn: boolean;
  /** Server Action(Page Owner가 `createReport`를 감싸 전달). */
  onReport: (
    targetType: ReportTargetType,
    targetId: string,
    reason: string,
  ) => Promise<ReportSubmitResult>;
}

/**
 * SCR-004 신고 트리거(REQ-FUNC-039, REQ-NF-019). 사유 코드+설명으로 신고를
 * 접수하고 접수번호+접수 시각을 보여준다. 신고자·피신고자 상세는 관리자만
 * 열람할 수 있도록 RLS(`DB-RLS-BASE`)가 강제한다.
 */
export function ReportButton({
  targetType,
  targetId,
  isLoggedIn,
  onReport,
}: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reasonCode, setReasonCode] = useState(REASON_OPTIONS[0].value);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<{
    id: string;
    createdAt: string;
  } | null>(null);

  if (!isLoggedIn) {
    return null;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!description.trim()) {
      setError("신고 사유를 구체적으로 적어 주세요.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    const reasonLabel =
      REASON_OPTIONS.find((option) => option.value === reasonCode)?.label ??
      reasonCode;
    const result = await onReport(
      targetType,
      targetId,
      sanitizeUserText(`[${reasonLabel}] ${description}`, 1000),
    );
    setIsSubmitting(false);

    if (result.ok) {
      setReceipt({ id: result.reportId, createdAt: result.createdAt });
    } else {
      setError(result.error);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`${FOCUS_RING_CLASS_NAME} ${MIN_TOUCH_TARGET_CLASS_NAME} w-fit text-[14px] text-[#D0342C] underline`}
      >
        신고하기
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        titleId="report-modal-title"
      >
        <h2
          id="report-modal-title"
          className="text-[18px] font-semibold text-[#2B2A28]"
        >
          신고하기
        </h2>

        {receipt ? (
          <div className="mt-4 flex flex-col gap-2">
            <p role="status" className="text-[14px] text-[#1E8A5F]">
              신고가 접수되었습니다.
            </p>
            <p className="text-[13px] text-[#6B6863]">접수번호: {receipt.id}</p>
            <p className="text-[13px] text-[#6B6863]">
              접수 시각: {receipt.createdAt}
            </p>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className={`${FOCUS_RING_CLASS_NAME} ${MIN_TOUCH_TARGET_CLASS_NAME} mt-2 w-fit rounded-[999px] border border-[#E4E1DC] px-6 text-[14px] text-[#2B2A28]`}
            >
              닫기
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-[13px] text-[#6B6863]">
              신고 사유
              <select
                value={reasonCode}
                onChange={(event) => setReasonCode(event.target.value)}
                className={`${FOCUS_RING_CLASS_NAME} h-12 rounded-[10px] border border-[#E4E1DC] px-3 text-[16px] text-[#2B2A28]`}
              >
                {REASON_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-[13px] text-[#6B6863]">
              상세 설명
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={1000}
                rows={4}
                required
                className={`${FOCUS_RING_CLASS_NAME} rounded-[10px] border border-[#E4E1DC] px-3 py-2 text-[16px] text-[#2B2A28]`}
              />
            </label>

            {error ? (
              <p
                role="alert"
                className="text-[14px] font-semibold text-[#D0342C]"
              >
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`${FOCUS_RING_CLASS_NAME} ${MIN_TOUCH_TARGET_CLASS_NAME} w-fit rounded-[999px] bg-[#F0653C] px-6 text-[16px] font-semibold text-[#FFFFFF] disabled:cursor-not-allowed disabled:bg-[#FDE3D8]`}
            >
              {isSubmitting ? "접수 중..." : "신고 접수"}
            </button>
          </form>
        )}
      </Modal>
    </>
  );
}
