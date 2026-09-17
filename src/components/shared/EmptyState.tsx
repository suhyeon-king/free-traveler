import type { ReactNode } from "react";

import { FOCUS_RING_CLASS_NAME, MIN_TOUCH_TARGET_CLASS_NAME } from "@/lib/a11y";

type EmptyStateAction =
  | { label: string; onClick: () => void; href?: undefined }
  | { label: string; href: string; onClick?: undefined };

interface EmptyStateProps {
  /** 왜 비어 있는지 설명하는 사유 문장. */
  reason: string;
  /** 이 상태에서 무엇을 할 수 있는지 안내하는 이용 방법 문장. */
  guidance: string;
  /** 다음 행동 CTA. `onClick`(예: 필터 초기화) 또는 `href`(예: 새 글 작성 이동) 중 하나를 지정한다. */
  action: EmptyStateAction;
  /** 장식용 아이콘. 빈 화면처럼 보이지 않게 하는 시각 요소이며 텍스트로 의미를 대체하지 않는다. */
  icon?: ReactNode;
}

/**
 * "사유 문장 + 이용 방법 + 다음 행동 CTA" 3요소를 모두 갖춘 완성형 Empty State(REQ-FUNC-005).
 * Lorem ipsum·"준비 중"류 Placeholder 문구 없이, 실제 상황을 설명하는 문장을 props로 강제한다.
 */
export function EmptyState({
  reason,
  guidance,
  action,
  icon,
}: EmptyStateProps) {
  const actionClassName = `${FOCUS_RING_CLASS_NAME} ${MIN_TOUCH_TARGET_CLASS_NAME} inline-flex items-center justify-center rounded-[999px] bg-[#F0653C] px-6 text-[16px] font-semibold text-[#FFFFFF] active:bg-[#D64F29]`;

  return (
    <div className="flex flex-col items-center gap-4 rounded-[16px] bg-[#F7F6F4] px-6 py-12 text-center">
      {icon ? (
        <div aria-hidden="true" className="text-[#6B6863]">
          {icon}
        </div>
      ) : null}
      <p className="text-[16px] leading-[1.6] text-[#2B2A28]">{reason}</p>
      <p className="text-[14px] leading-[1.5] text-[#6B6863]">{guidance}</p>
      {action.href ? (
        <a href={action.href} className={actionClassName}>
          {action.label}
        </a>
      ) : (
        <button
          type="button"
          onClick={action.onClick}
          className={actionClassName}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
