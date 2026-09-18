import { ErrorState } from "@/components/shared/ErrorState";

/** Next.js 404 화면(REQ-FUNC-078). 홈/이전 복구 행동을 제공한다. */
export default function NotFound() {
  return (
    <ErrorState
      title="페이지를 찾을 수 없습니다"
      message="주소가 바뀌었거나 더 이상 존재하지 않는 페이지입니다. 홈으로 돌아가거나 이전 화면으로 이동해 주세요."
      actions={[{ type: "home" }, { type: "back" }]}
    />
  );
}
