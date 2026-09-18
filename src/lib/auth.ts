import { createBrowserClient, createServerClient } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { SECURE_COOKIE_OPTIONS } from "@/lib/security";

/**
 * Supabase Auth·성인 확인 (REQ-FUNC-027/028/066).
 *
 * Client Component는 `createBrowserSupabaseClient()`, Server Component/Server
 * Action은 `createServerSupabaseClient()`를 사용한다. 두 Client 모두 로그인한
 * 사용자의 세션 권한으로만 동작하며 RLS를 그대로 적용받는다(CLAUDE.md 규칙 14).
 * `SUPABASE_SERVICE_ROLE_KEY`는 어디에서도 사용하지 않는다(규칙 15).
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

/** Client Component에서 사용하는 Browser Supabase Client. */
export function createBrowserSupabaseClient(): SupabaseClient {
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient(url, anonKey);
}

/**
 * Server Component/Server Action에서 사용하는 Server Supabase Client.
 * 요청 스코프의 쿠키로 사용자 세션을 읽고 쓴다. Server Component 내부에서는
 * 쿠키를 쓸 수 없어 `setAll`이 예외를 던질 수 있는데, 이 경우 무시한다
 * (세션 갱신은 Route Handler/Server Action에서 이뤄진다).
 */
export async function createServerSupabaseClient(): Promise<SupabaseClient> {
  const { url, anonKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, {
              ...options,
              ...SECURE_COOKIE_OPTIONS,
            });
          });
        } catch {
          // Server Component에서 호출된 경우 쿠키 쓰기가 차단된다 - 무시한다.
        }
      },
    },
  });
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

/** 현재 요청의 로그인 사용자를 반환한다(비로그인이면 `null`). */
export async function getServerUser(): Promise<User | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    return null;
  }
  return data.user;
}

/**
 * 성인 확인 상태를 저장한다. 정확한 생년월일은 저장하지 않고
 * `is_adult`/`adult_verified_at`만 갱신한다(REQ-FUNC-028).
 */
export async function confirmAdult(userId: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("profiles")
    .update({ is_adult: true, adult_verified_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) {
    throw error;
  }
}
