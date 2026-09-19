"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { FOCUS_RING_CLASS_NAME, MIN_TOUCH_TARGET_CLASS_NAME } from "@/lib/a11y";
import {
  requestPasswordReset,
  signInWithEmail,
  signOut,
  signUpWithEmail,
} from "@/lib/auth-client";

type AuthMode = "login" | "signup" | "reset";

const MODE_LABEL: Record<AuthMode, string> = {
  login: "로그인",
  signup: "회원가입",
  reset: "비밀번호 재설정",
};

interface AuthTabProps {
  isLoggedIn: boolean;
}

/**
 * SCR-005 로그인·가입·재설정(Guest, REQ-FUNC-027/066). `src/lib/auth.ts`의
 * Browser Supabase Client 기반 함수를 직접 호출한다(Server Action이 필요 없다
 * — 이 함수들은 이미 Client 전용이다).
 */
export function AuthTab({ isLoggedIn }: AuthTabProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSignOut() {
    await signOut();
    router.refresh();
  }

  if (isLoggedIn) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-[14px] text-[#2B2A28]">로그인되어 있습니다.</p>
        <button
          type="button"
          onClick={handleSignOut}
          className={`${FOCUS_RING_CLASS_NAME} ${MIN_TOUCH_TARGET_CLASS_NAME} w-fit rounded-[999px] border border-[#E4E1DC] px-6 text-[14px] text-[#2B2A28]`}
        >
          로그아웃
        </button>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);
    try {
      if (mode === "login") {
        const { error: signInError } = await signInWithEmail(email, password);
        if (signInError) throw signInError;
        router.refresh();
      } else if (mode === "signup") {
        const { error: signUpError } = await signUpWithEmail(email, password);
        if (signUpError) throw signUpError;
        setMessage("가입 확인 이메일을 보냈습니다. 메일함을 확인해 주세요.");
      } else {
        const { error: resetError } = await requestPasswordReset(email);
        if (resetError) throw resetError;
        setMessage("비밀번호 재설정 안내 이메일을 보냈습니다.");
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "요청 처리에 실패했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 border-b border-[#E4E1DC]">
        {(Object.keys(MODE_LABEL) as AuthMode[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setMode(key);
              setError(null);
              setMessage(null);
            }}
            className={`${FOCUS_RING_CLASS_NAME} border-b-2 px-4 py-2 text-[14px] font-semibold ${
              mode === key
                ? "border-[#F0653C] text-[#F0653C]"
                : "border-transparent text-[#6B6863]"
            }`}
          >
            {MODE_LABEL[key]}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-[13px] text-[#6B6863]">
          이메일
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className={`${FOCUS_RING_CLASS_NAME} h-12 rounded-[10px] border border-[#E4E1DC] px-3 text-[16px] text-[#2B2A28]`}
          />
        </label>

        {mode !== "reset" ? (
          <label className="flex flex-col gap-1 text-[13px] text-[#6B6863]">
            비밀번호
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              className={`${FOCUS_RING_CLASS_NAME} h-12 rounded-[10px] border border-[#E4E1DC] px-3 text-[16px] text-[#2B2A28]`}
            />
          </label>
        ) : null}

        {error ? (
          <p role="alert" className="text-[14px] font-semibold text-[#D0342C]">
            {error}
          </p>
        ) : null}
        {message ? (
          <p role="status" className="text-[14px] text-[#1E8A5F]">
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`${FOCUS_RING_CLASS_NAME} ${MIN_TOUCH_TARGET_CLASS_NAME} w-fit rounded-[999px] bg-[#F0653C] px-6 text-[16px] font-semibold text-[#FFFFFF] disabled:cursor-not-allowed disabled:bg-[#FDE3D8]`}
        >
          {isSubmitting ? "처리 중..." : MODE_LABEL[mode]}
        </button>
      </form>

      <p className="text-[13px] leading-[1.5] text-[#6B6863]">
        로그인하면 동행 모집글 작성, 참가 요청, 신고·차단 기능을 이용할 수
        있습니다. 정확한 생년월일은 저장하지 않으며 성인 확인 여부와 확인 시각만
        기록합니다.
      </p>
    </div>
  );
}
