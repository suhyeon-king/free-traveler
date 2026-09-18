/**
 * 여행지 즐겨찾기 `localStorage` 유틸리티 (REQ-FUNC-068).
 *
 * 서버로 전송하지 않고 개인 기기의 `localStorage`에만 저장한다.
 * 접근이 차단된 환경(Private 모드 등)에서는 조용히 무시하고 빈 목록으로 동작한다.
 */

const STORAGE_KEY = "free-traveler:favorites";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readFavoriteIds(): string[] {
  if (!isBrowser()) {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

function writeFavoriteIds(ids: string[]): void {
  if (!isBrowser()) {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // localStorage 접근 불가(Private 모드, 저장 공간 초과 등) - 조용히 무시한다.
  }
}

/** 현재 즐겨찾기한 여행지 ID 목록을 반환한다. */
export function getFavoriteIds(): string[] {
  return readFavoriteIds();
}

export function isFavorite(destinationId: string): boolean {
  return readFavoriteIds().includes(destinationId);
}

/** 이미 즐겨찾기된 ID면 중복 추가하지 않는다. */
export function addFavorite(destinationId: string): string[] {
  const current = readFavoriteIds();
  if (current.includes(destinationId)) {
    return current;
  }
  const next = [...current, destinationId];
  writeFavoriteIds(next);
  return next;
}

export function removeFavorite(destinationId: string): string[] {
  const current = readFavoriteIds();
  const next = current.filter((id) => id !== destinationId);
  writeFavoriteIds(next);
  return next;
}

export interface ToggleFavoriteResult {
  ids: string[];
  isFavorite: boolean;
}

export function toggleFavorite(destinationId: string): ToggleFavoriteResult {
  const wasFavorite = isFavorite(destinationId);
  const ids = wasFavorite
    ? removeFavorite(destinationId)
    : addFavorite(destinationId);
  return { ids, isFavorite: !wasFavorite };
}
