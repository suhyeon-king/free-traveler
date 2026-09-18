/**
 * URL 공유 유틸리티 (REQ-FUNC-069).
 *
 * Web Share API를 우선 시도하고, 지원하지 않거나 실패하면 클립보드 복사로 폴백한다.
 */

export interface ShareLinkInput {
  url: string;
  title?: string;
  text?: string;
}

export type ShareLinkResult =
  { method: "web-share" } | { method: "clipboard" } | { method: "failed" };

function hasWebShare(): boolean {
  return (
    typeof navigator !== "undefined" && typeof navigator.share === "function"
  );
}

function hasClipboard(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.clipboard?.writeText === "function"
  );
}

export async function shareLink({
  url,
  title,
  text,
}: ShareLinkInput): Promise<ShareLinkResult> {
  if (hasWebShare()) {
    try {
      await navigator.share({ url, title, text });
      return { method: "web-share" };
    } catch (error) {
      // 사용자가 공유 시트를 취소한 경우는 실패가 아니라 그대로 종료한다.
      if (error instanceof DOMException && error.name === "AbortError") {
        return { method: "web-share" };
      }
      // 그 외 실패는 클립보드 복사로 폴백한다.
    }
  }

  if (hasClipboard()) {
    try {
      await navigator.clipboard.writeText(url);
      return { method: "clipboard" };
    } catch {
      return { method: "failed" };
    }
  }

  return { method: "failed" };
}
