"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { FOCUS_RING_CLASS_NAME, MIN_TOUCH_TARGET_CLASS_NAME } from "@/lib/a11y";

export type ErrorStateAction =
  { type: "home" } | { type: "back" } | { type: "retry"; onRetry: () => void };

interface ErrorStateProps {
  title: string;
  message: string;
  /** 홈/이전/재시도 중 최소 1개를 강제한다(REQ-FUNC-078, 튜플 타입으로 빈 배열을 타입 에러로 막는다). */
  actions: [ErrorStateAction, ...ErrorStateAction[]];
  /** 장식용 아이콘. */
  icon?: ReactNode;
}

const ACTION_LABEL: Record<ErrorStateAction["type"], string> = {
  home: "홈으로 가기",
  back: "이전으로 가기",
  retry: "다시 시도",
};

/**
 * 404·권한 없음·외부 연결 실패 등 오류 상태에서 홈/이전/재시도 중 최소 1개의
 * 복구 행동을 제공하는 공용 컴포넌트(REQ-FUNC-078).
 */
export function ErrorState({ title, message, actions, icon }: ErrorStateProps) {
  const router = useRouter();
  const buttonClassName = `${FOCUS_RING_CLASS_NAME} ${MIN_TOUCH_TARGET_CLASS_NAME} inline-flex items-center justify-center rounded-[999px] border border-[#E4E1DC] px-6 text-[16px] font-semibold text-[#2B2A28]`;

  return (
    <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
      {icon ? (
        <div aria-hidden="true" className="text-[#D0342C]">
          {icon}
        </div>
      ) : null}
      <h1 className="text-[24px] font-bold leading-[1.3] text-[#2B2A28]">
        {title}
      </h1>
      <p className="text-[16px] leading-[1.6] text-[#6B6863]">{message}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {actions.map((action, index) => {
          if (action.type === "home") {
            return (
              <Link key={`home-${index}`} href="/" className={buttonClassName}>
                {ACTION_LABEL.home}
              </Link>
            );
          }
          if (action.type === "back") {
            return (
              <button
                key={`back-${index}`}
                type="button"
                onClick={() => router.back()}
                className={buttonClassName}
              >
                {ACTION_LABEL.back}
              </button>
            );
          }
          return (
            <button
              key={`retry-${index}`}
              type="button"
              onClick={action.onRetry}
              className={buttonClassName}
            >
              {ACTION_LABEL.retry}
            </button>
          );
        })}
      </div>
    </div>
  );
}
