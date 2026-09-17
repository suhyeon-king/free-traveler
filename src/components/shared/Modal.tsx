"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { getDialogAriaProps } from "@/lib/a11y";

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** `aria-labelledby`가 가리킬 Modal 제목 요소의 id. */
  titleId: string;
  children: ReactNode;
}

/**
 * Desktop: 화면 중앙에 뜨는 Modal. Mobile: 하단에서 올라오는 Bottom Sheet.
 * 열릴 때 포커스를 내부 첫 상호작용 요소로 이동시키고 Tab 순환을 패널 내부로 가두며(Focus Trap),
 * 닫힐 때 트리거로 포커스를 복귀시킨다. `Esc`와 바깥(scrim) 클릭으로 닫힌다.
 */
export function Modal({ isOpen, onClose, titleId, children }: ModalProps) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-[rgba(0,0,0,0.5)]"
      />
      <div
        ref={panelRef}
        {...getDialogAriaProps(titleId)}
        className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-[16px] bg-[#FFFFFF] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.08)] md:rounded-[16px]"
      >
        {children}
      </div>
    </div>
  );
}
