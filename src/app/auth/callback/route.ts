import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/auth";

/**
 * Supabase Auth 이메일 인증·로그인 콜백 처리(기술 Route, Screen 수에 포함하지 않음).
 * `code` 쿼리 파라미터를 세션으로 교환한 뒤 지정된 경로(기본 `/account`)로 리다이렉트한다.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectPath = searchParams.get("redirect_to") ?? "/account";

  if (code) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}${redirectPath}`);
}
