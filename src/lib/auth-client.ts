import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Client Component 전용 Supabase Auth 헬퍼. `src/lib/auth.ts`는
 * `next/headers`(서버 전용)를 함께 export해 Client Component 번들에 포함되면
 * 빌드가 실패한다(`next build` 실제 확인) — 그래서 Client에서 안전하게 쓸 수
 * 있는 함수만 이 파일에 별도로 둔다. 서버 전용 함수(`createServerSupabaseClient`
 * 등)는 여전히 `src/lib/auth.ts`가 유일한 정의처다.
 */

function getSupabaseEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY 환경변수가 설정되어 있지 않습니다.",
    );
  }
  return { url, anonKey };
}

function getSiteOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/+$/,
    "",
  );
}

export function createBrowserSupabaseClient(): SupabaseClient {
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient(url, anonKey);
}

export async function signUpWithEmail(email: string, password: string) {
  const supabase = createBrowserSupabaseClient();
  return supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${getSiteOrigin()}/auth/callback` },
  });
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = createBrowserSupabaseClient();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  const supabase = createBrowserSupabaseClient();
  return supabase.auth.signOut();
}

export async function requestPasswordReset(email: string) {
  const supabase = createBrowserSupabaseClient();
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getSiteOrigin()}/auth/callback`,
  });
}
