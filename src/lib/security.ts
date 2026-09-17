/**
 * CSRF·입력 검증 기본기 (REQ-NF-014/015).
 *
 * Server Action/Route에서 쿠키를 직접 설정할 때 이 옵션을 사용해 SameSite CSRF 방어를
 * 적용한다. 사용자 입력을 저장하기 전에는 `sanitizeUserText`로 앞뒤 공백 제거 + 길이
 * 제한 + HTML 특수문자 이스케이프를 적용해 저장 XSS를 차단한다.
 */

export const SECURE_COOKIE_OPTIONS = {
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  httpOnly: true,
  path: "/",
};

const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** `&<>"'`를 HTML Entity로 치환해 저장 XSS를 차단한다. */
export function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char] ?? char);
}

/** 앞뒤 공백 제거 + (선택) 길이 제한 + HTML 이스케이프를 적용한 뒤 저장 가능한 문자열을 반환한다. */
export function sanitizeUserText(input: string, maxLength?: number): string {
  const trimmed = input.trim();
  const limited =
    typeof maxLength === "number" ? trimmed.slice(0, maxLength) : trimmed;
  return escapeHtml(limited);
}
