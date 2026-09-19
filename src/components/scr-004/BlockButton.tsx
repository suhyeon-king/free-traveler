"use client";

import { useState } from "react";

import { FOCUS_RING_CLASS_NAME, MIN_TOUCH_TARGET_CLASS_NAME } from "@/lib/a11y";

export type BlockActionResult = { ok: true } | { ok: false; error: string };

interface BlockButtonProps {
  blockedUserId: string;
  /** 비로그인이면 `null` — 비로그인 사용자에게는 렌더링하지 않는다. */
  isLoggedIn: boolean;
  /** Server Action(Page Owner가 `blockUser`를 감싸 전달). */
  onBlock: (blockedUserId: string) => Promise<BlockActionResult>;
}

/**
 * SCR-004 차단 트리거(REQ-FUNC-040). 차단은 즉시 반영되며 상호 노출 제한은
 * RLS/쿼리 필터(`DB-RLS-BASE`)가 서버에서 강제한다. 관리(해제)는 SCR-005 내
 * 활동 탭 소관이다.
 */
export function BlockButton({
  blockedUserId,
  isLoggedIn,
  onBlock,
}: BlockButtonProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "blocked">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  if (!isLoggedIn) {
    return null;
  }

  if (status === "blocked") {
    return (
      <p role="status" className="text-[14px] text-[#6B6863]">
        이 사용자를 차단했습니다.
      </p>
    );
  }

  async function handleClick() {
    const confirmed = window.confirm(
      "이 사용자를 차단하시겠습니까? 차단하면 서로의 글과 프로필이 즉시 노출되지 않습니다.",
    );
    if (!confirmed) {
      return;
    }
    setStatus("submitting");
    const result = await onBlock(blockedUserId);
    if (result.ok) {
      setStatus("blocked");
    } else {
      setStatus("idle");
      setError(result.error);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={status === "submitting"}
        className={`${FOCUS_RING_CLASS_NAME} ${MIN_TOUCH_TARGET_CLASS_NAME} w-fit text-[14px] text-[#D0342C] underline`}
      >
        {status === "submitting" ? "처리 중..." : "이 사용자 차단하기"}
      </button>
      {error ? (
        <p role="alert" className="text-[13px] text-[#D0342C]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
