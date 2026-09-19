"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";

import { FOCUS_RING_CLASS_NAME, MIN_TOUCH_TARGET_CLASS_NAME } from "@/lib/a11y";
import { sanitizeUserText } from "@/lib/security";

export type ApplySubmitResult = { ok: true } | { ok: false; error: string };

interface ApplyFormProps {
  postId: string;
  /** 비로그인/성인 미확인이면 `null`. */
  user: { id: string; isAdult: boolean } | null;
  /** Server Action(Page Owner가 `createMateApplication`을 감싸 전달). 서버가 중복 PENDING/ACCEPTED도 함께 차단한다. */
  onSubmit: (postId: string, message: string) => Promise<ApplySubmitResult>;
}

/**
 * SCR-004 참가 요청 제출 + 중복 차단(REQ-FUNC-034/035, REQ-NF-019). 500자 이내
 * 메시지로 비공개 참가 요청을 제출한다. 제출 완료는 인라인 안내로 표시한다
 * (전역 `ToastProvider`가 아직 앱에 연결되지 않아 `SHR-TOAST-NOTIFY`의
 * `useToast()`를 직접 호출하면 Provider가 없는 트리에서 예외가 발생할 수 있어
 * 사용하지 않았다 — 연결되면 이 컴포넌트를 갱신해 Toast로 교체할 수 있다).
 */
export function ApplyForm({ postId, user, onSubmit }: ApplyFormProps) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!user || !user.isAdult) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[16px] bg-[#F7F6F4] px-6 py-8 text-center">
        <p className="text-[14px] text-[#2B2A28]">
          {user
            ? "성인 확인 후 참가 요청을 보낼 수 있습니다."
            : "로그인 후 참가 요청을 보낼 수 있습니다."}
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

  if (isSubmitted) {
    return (
      <p
        role="status"
        className="rounded-[10px] bg-[#F7F6F4] px-4 py-3 text-[14px] text-[#1E8A5F]"
      >
        참가 요청을 보냈습니다. 작성자가 승인하면 계정의 내 활동에서 확인할 수
        있습니다.
      </p>
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!message.trim()) {
      setError("참가 메시지를 입력해 주세요.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    const result = await onSubmit(postId, sanitizeUserText(message, 500));
    setIsSubmitting(false);

    if (result.ok) {
      setIsSubmitted(true);
    } else {
      setError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-[13px] text-[#6B6863]">
        참가 메시지(500자 이내)
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          maxLength={500}
          rows={4}
          required
          className={`${FOCUS_RING_CLASS_NAME} rounded-[10px] border border-[#E4E1DC] px-3 py-2 text-[16px] text-[#2B2A28]`}
        />
      </label>

      {error ? (
        <p role="alert" className="text-[14px] font-semibold text-[#D0342C]">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className={`${FOCUS_RING_CLASS_NAME} ${MIN_TOUCH_TARGET_CLASS_NAME} inline-flex w-fit items-center rounded-[999px] bg-[#F0653C] px-6 text-[16px] font-semibold text-[#FFFFFF] disabled:cursor-not-allowed disabled:bg-[#FDE3D8]`}
      >
        {isSubmitting ? "제출 중..." : "참가 요청 보내기"}
      </button>
    </form>
  );
}
