import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  // tsconfig.json의 "@/*" → "./src/*" 경로 별칭을 Vitest(Vite)에서도 그대로
  // 쓸 수 있게 한다 — 없으면 `@/`로 import하는 소스 파일을 테스트에서 import할
  // 수 없다(UNIT-CONTACT-DETECTION에서 실제로 확인된 문제).
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    // src 내 Unit Test, tests/unit, tests/rls(통합 테스트, env-gated로 skip 가능)를
    // 실행 대상으로 삼는다. tests/e2e는 Playwright 전용이므로 Vitest가 검색하지
    // 않도록 명시적으로 제외한다.
    include: [
      "src/**/*.{test,spec}.{ts,tsx}",
      "tests/unit/**/*.{test,spec}.{ts,tsx}",
      "tests/rls/**/*.{test,spec}.{ts,tsx}",
    ],
    exclude: ["tests/e2e/**", "node_modules/**", ".next/**"],
    // 아직 Unit Test 파일이 하나도 없는 단계(계획 단계)에서도 실패하지 않고 통과로 종료한다.
    passWithNoTests: true,
  },
});
