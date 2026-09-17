"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { getDialogAriaProps } from "@/lib/a11y";

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  /** `aria-labelledby`가 가리킬 Drawer 제목 요소의 id. */
  titleId: string;
  children: ReactNode;
  /** Desktop에서 Drawer가 붙는 방향. Mobile에서는 항상 Bottom Sheet로 표시된다. */
  side?: "left" | "right";
}

/**
 * Desktop: 화면 좌/우측에 붙는 Drawer. Mobile: 하단에서 올라오는 Bottom Sheet.
 * 열릴 때 포커스를 내부 첫 상호작용 요소로 이동시키고 Tab 순환을 패널 내부로 가두며(Focus Trap),
 * 닫힐 때 트리거로 포커스를 복귀시킨다. `Esc`와 바깥(scrim) 클릭으로 닫힌다.
 */
export function Drawer({
  isOpen,
  onClose,
  titleId,
  children,
  side = "right",
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    triggerElementRef.current = document.activeElement;
    const panel = panelRef.current;
    const firstFocusable =
      panel?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    firstFocusable?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panel) {
        return;
      }

      const focusable = panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) {
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      const trigger = triggerElementRef.current;
      if (trigger instanceof HTMLElement) {
        trigger.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const sidePositionClassName =
    side === "left"
      ? "md:left-0 md:rounded-r-[16px] md:rounded-l-none"
      : "md:right-0 md:rounded-l-[16px] md:rounded-r-none";

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-[rgba(0,0,0,0.5)]"
      />
      <div
        ref={panelRef}
        {...getDialogAriaProps(titleId)}
        className={`absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[16px] bg-[#FFFFFF] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.08)] md:inset-y-0 md:bottom-auto md:h-full md:w-full md:max-w-md md:rounded-t-none ${sidePositionClassName}`}
      >
        {children}
      </div>
    </div>
  );
}
