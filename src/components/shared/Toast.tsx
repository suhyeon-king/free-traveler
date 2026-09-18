"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { getAlertAriaProps } from "@/lib/a11y";

export interface ToastItem {
  id: string;
  message: string;
  durationMs: number;
}

interface ToastContextValue {
  showToast: (message: string, durationMs?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const MIN_DURATION_MS = 3000;
const MAX_DURATION_MS = 5000;
const DEFAULT_DURATION_MS = 4000;

function clampDuration(durationMs: number): number {
  return Math.min(MAX_DURATION_MS, Math.max(MIN_DURATION_MS, durationMs));
}

/**
 * 참가 요청 접수·승인/거절·신고 접수 등 상태 변경을 3~5초 노출 Toast로 알린다(REQ-FUNC-043).
 * 실제 이메일 발송을 대체하는 인앱 알림이며, 자식 트리 어디서든 `useToast()`로 호출한다.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (message: string, durationMs: number = DEFAULT_DURATION_MS) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const duration = clampDuration(durationMs);
      setToasts((current) => [
        ...current,
        { id, message, durationMs: duration },
      ]);
      const timeout = setTimeout(() => removeToast(id), duration);
      timeoutsRef.current.set(id, timeout);
    },
    [removeToast],
  );

  useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
      timeouts.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            {...getAlertAriaProps("polite")}
            className="pointer-events-auto max-w-[90vw] rounded-[10px] bg-[#2B2A28] px-4 py-3 text-[14px] text-[#FFFFFF] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.08)]"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/** `ToastProvider` 내부에서만 사용할 수 있다. */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast는 ToastProvider 내부에서만 사용할 수 있다.");
  }
  return context;
}
