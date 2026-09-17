import type { ElementType, ReactNode } from "react";

import { VISUALLY_HIDDEN_CLASS_NAME, getAlertAriaProps } from "@/lib/a11y";
import type { AlertPoliteness } from "@/lib/a11y";

interface VisuallyHiddenProps {
  children: ReactNode;
  /** 렌더링할 HTML 요소. 기본값은 `span`. */
  as?: ElementType;
  /** 지정하면 스크린리더 알림 영역(`aria-live`)으로 동작한다. */
  live?: AlertPoliteness;
}

/**
 * 화면에는 보이지 않지만 스크린리더에는 그대로 읽히는 텍스트를 렌더링한다.
 * 아이콘 전용 버튼의 대체 라벨, 폼 보조 설명, 알림 영역(`live` 지정 시) 등에 사용한다.
 */
export function VisuallyHidden({
  children,
  as: Component = "span",
  live,
}: VisuallyHiddenProps) {
  const liveProps = live ? getAlertAriaProps(live) : undefined;

  return (
    <Component className={VISUALLY_HIDDEN_CLASS_NAME} {...liveProps}>
      {children}
    </Component>
  );
}
