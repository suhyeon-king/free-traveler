/**
 * 외부 링크(항공편/숙소) 안전 이동 유틸리티 (REQ-FUNC-016/018/024/026/077).
 *
 * 이 모듈은 항공/숙소별 URL을 알지 못한다 — 호출자(Component)가 환경변수
 * (`FLIGHT_OUTBOUND_URL`/`HOTEL_OUTBOUND_URL`) 또는 관리자 설정값(`app_settings`)에서
 * 읽은 URL만 인자로 전달한다. 목적지·날짜 등 사용자 입력값은 이 모듈의 함수 어디에도
 * 인자로 들어오지 않으며, 그 값을 Query Parameter로 덧붙이는 동작도 하지 않는다.
 */

export type OutboundLinkValidation =
  { ok: true; url: string } | { ok: false; reason: "MISSING" | "NOT_HTTPS" };

const HTTPS_URL_PATTERN = /^https:\/\//i;

/**
 * 허용목록(HTTPS만) 검증. 미설정이거나 HTTPS가 아니면 이동을 차단한다.
 * 호출자는 `ok: false`일 때 오류 표시 + 재시도 UI를 렌더링한다(REQ-FUNC-018/026).
 */
export function validateOutboundUrl(
  candidateUrl: string | null | undefined,
): OutboundLinkValidation {
  if (!candidateUrl) {
    return { ok: false, reason: "MISSING" };
  }
  if (!HTTPS_URL_PATTERN.test(candidateUrl)) {
    return { ok: false, reason: "NOT_HTTPS" };
  }
  return { ok: true, url: candidateUrl };
}

/**
 * 검증된 URL을 새 탭에서 연다. `noopener,noreferrer`로 opener 접근을 차단한다
 * (REQ-FUNC-016/024). Server 환경에서는 아무 동작도 하지 않는다.
 */
export function openOutboundLink(url: string): void {
  if (typeof window === "undefined") {
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}
