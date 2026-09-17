/**
 * 접근성 포커스·ARIA 공용 유틸리티 (REQ-FUNC-079, REQ-NF-023).
 *
 * 폼·모달·탭·알림 등 다른 Component Task가 이 상수·헬퍼를 그대로 사용해
 * `design-reference/D-001/DESIGN.md`의 포커스 링(3px, offset 2px, `colors.focus-ring`
 * = `#1F4B8F`)과 최소 터치 영역(44×44px) 규칙을 일관되게 적용하도록 한다.
 * 아직 `SHR-RESPONSIVE-LAYOUT`에서 Tailwind 토큰이 정의되지 않았으므로 임의값
 * 문법(`[...]`)으로 디자인 값을 직접 참조한다. 토큰이 정의되면 해당 Task에서
 * 이 상수들을 토큰 참조로 교체할 수 있다.
 */

export const FOCUS_RING_CLASS_NAME =
  "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-offset-2 focus-visible:ring-[#1F4B8F]";

export const MIN_TOUCH_TARGET_CLASS_NAME = "min-h-[44px] min-w-[44px]";

/** 화면에는 보이지 않지만 스크린리더에는 노출되는 텍스트에 사용한다. */
export const VISUALLY_HIDDEN_CLASS_NAME =
  "absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)] [clip-path:inset(50%)]";

export interface TabAriaProps {
  role: "tab";
  "aria-selected": boolean;
  tabIndex: 0 | -1;
}

/** 탭 버튼에 적용할 ARIA 속성. 선택된 탭만 Tab 키 순서에 포함시킨다(roving tabindex). */
export function getTabAriaProps(isSelected: boolean): TabAriaProps {
  return {
    role: "tab",
    "aria-selected": isSelected,
    tabIndex: isSelected ? 0 : -1,
  };
}

export interface TabPanelAriaProps {
  role: "tabpanel";
  id: string;
  "aria-labelledby": string;
  hidden: boolean;
}

/** 탭 패널에 적용할 ARIA 속성. */
export function getTabPanelAriaProps(
  panelId: string,
  tabId: string,
  isActive: boolean,
): TabPanelAriaProps {
  return {
    role: "tabpanel",
    id: panelId,
    "aria-labelledby": tabId,
    hidden: !isActive,
  };
}

export interface DialogAriaProps {
  role: "dialog";
  "aria-modal": true;
  "aria-labelledby": string;
}

/** 모달·Drawer 컨테이너에 적용할 ARIA 속성. */
export function getDialogAriaProps(labelledById: string): DialogAriaProps {
  return {
    role: "dialog",
    "aria-modal": true,
    "aria-labelledby": labelledById,
  };
}

export type AlertPoliteness = "polite" | "assertive";

export interface AlertAriaProps {
  role: "alert" | "status";
  "aria-live": AlertPoliteness;
}

/**
 * 알림·오류 메시지 영역에 적용할 ARIA 속성. `assertive`는 검증 오류처럼 즉시
 * 알려야 하는 경우에만 사용하고, 일반 안내는 `polite`를 기본값으로 한다.
 */
export function getAlertAriaProps(
  politeness: AlertPoliteness = "polite",
): AlertAriaProps {
  return {
    role: politeness === "assertive" ? "alert" : "status",
    "aria-live": politeness,
  };
}
