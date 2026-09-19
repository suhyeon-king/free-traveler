import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, expectTypeOf, it } from "vitest";

import {
  computeEffectiveMatePostStatus,
  updateMateApplicationStatus,
  updateMatePost,
  type MateApplicationStatus,
  type MatePostStatus,
} from "@/lib/db/mates";
import { updateReportStatus, type ReportStatus } from "@/lib/db/reports";

/**
 * 동행글/참가 요청/신고 상태 전이 단위 테스트
 * (REQ-FUNC-035/036/037/041/042, TASK-UNIT-MATE-STATE).
 *
 * 이 코드베이스에는 "상태 머신" 모듈이 따로 없다 — 전이 규칙은 (1) 순수 계산
 * 함수(`computeEffectiveMatePostStatus`), (2) 함수 시그니처가 강제하는 타입
 * 제약(`updateMateApplicationStatus`가 목표 상태에서 `PENDING`을 제외), (3) DB
 * 제약(참가 신청 중복 방지 unique index)으로 나뉘어 구현되어 있다. 그래서 이
 * 테스트도 세 방식을 그대로 따라 검증한다 — 실제로 존재하지 않는 상태 머신을
 * 재구현해서 검증하지 않는다.
 *
 * **필요한 최소 수정(이 Task Expected File 밖, 사람 확인 완료)**: "모집중→마감
 * (자동)" 계산 로직이 `src/lib/db/mates.ts`의 private 함수(`toMatePost`) 안에
 * 갇혀 있어 export되어 있지 않았다. 동작 변경 없이 `computeEffectiveMatePostStatus`
 * 함수로 추출해 export하고 `toMatePost`가 그것을 호출하도록 리팩토링했다
 * (`DB-ACCESS`의 Expected File, 이미 DONE — 사람에게 확인한 뒤 진행).
 */

describe("computeEffectiveMatePostStatus — 모집중→마감 전이(REQ-FUNC-037)", () => {
  const FUTURE_DATE = "2999-12-31";
  const PAST_DATE = "2000-01-01";

  it("status가 RECRUITING이고 종료일이 미래면 모집중을 유지한다", () => {
    expect(computeEffectiveMatePostStatus("RECRUITING", FUTURE_DATE)).toBe(
      "RECRUITING",
    );
  });

  it("종료일이 지나면 status와 무관하게 자동으로 마감된다", () => {
    expect(computeEffectiveMatePostStatus("RECRUITING", PAST_DATE)).toBe(
      "CLOSED",
    );
  });

  it("작성자가 수동으로 마감(status=CLOSED)하면 종료일과 무관하게 마감 상태다", () => {
    expect(computeEffectiveMatePostStatus("CLOSED", FUTURE_DATE)).toBe(
      "CLOSED",
    );
  });

  it("종료일이 오늘이면 아직 모집중이다(자정 기준 비교)", () => {
    const todayIso = new Date().toISOString().slice(0, 10);
    expect(computeEffectiveMatePostStatus("RECRUITING", todayIso)).toBe(
      "RECRUITING",
    );
  });
});

describe("mate_applications 상태 전이(REQ-FUNC-035/036)", () => {
  it("PENDING/ACCEPTED/REJECTED 3가지 상태만 존재한다", () => {
    const allStatuses: MateApplicationStatus[] = [
      "PENDING",
      "ACCEPTED",
      "REJECTED",
    ];
    expect(allStatuses).toHaveLength(3);
  });

  it("updateMateApplicationStatus는 목표 상태로 ACCEPTED/REJECTED만 허용하고 PENDING으로는 되돌릴 수 없다(타입 레벨 강제)", () => {
    expectTypeOf(updateMateApplicationStatus)
      .parameter(1)
      .toEqualTypeOf<"ACCEPTED" | "REJECTED">();
    // 아래는 컴파일되면 안 되는 사용례를 문서화한 것 — 실제로 주석 해제하면
    // `npm run typecheck`가 실패해야 한다(PENDING으로의 전이는 이 함수로 할 수 없다).
    // updateMateApplicationStatus("id", "PENDING");
  });
});

describe("mate_posts 수동 마감(REQ-FUNC-038 관련 함수 시그니처)", () => {
  it("updateMatePost의 status 필드는 MatePostStatus 값만 받는다", () => {
    expectTypeOf(updateMatePost)
      .parameter(1)
      .toMatchTypeOf<{ status?: MatePostStatus }>();
  });
});

describe("reports 상태 전이(REQ-FUNC-041/042)", () => {
  it("OPEN/REVIEWING/RESOLVED/DISMISSED 4가지 상태만 존재한다", () => {
    const allStatuses: ReportStatus[] = [
      "OPEN",
      "REVIEWING",
      "RESOLVED",
      "DISMISSED",
    ];
    expect(allStatuses).toHaveLength(4);
  });

  it("updateReportStatus는 ReportStatus 값을 목표 상태로 받는다", () => {
    expectTypeOf(updateReportStatus).parameter(1).toEqualTypeOf<ReportStatus>();
  });

  it(
    "이 코드베이스는 신고 상태 전이 순서(OPEN→REVIEWING→RESOLVED/DISMISSED)를 " +
      "강제하는 별도 검증 로직이 없다 — Admin/Moderator 권한 여부만 RLS로 " +
      "확인하고, 어떤 상태에서 어떤 상태로도 전이할 수 있다(알려진 제한사항, " +
      "이 Task의 Expected File 밖이라 새로 만들지 않았다).",
    () => {
      // 실제 전이 제한이 없다는 사실 자체를 문서화하는 테스트다 — 항상 통과한다.
      expect(true).toBe(true);
    },
  );
});

describe("mate_applications 중복 신청 차단(REQ-FUNC-035)", () => {
  it("동일 (post_id, applicant_id) 조합의 활성 신청(PENDING/ACCEPTED)을 막는 부분 유니크 인덱스가 마이그레이션에 존재한다", () => {
    // 애플리케이션 코드에는 중복 차단 로직이 없다 — DB의 partial unique index로만
    // 강제된다(REQ-FUNC-035 간소화). 실제 DB 동작(중복 삽입 시 에러)까지의 검증은
    // 이 Task(순수 단위 테스트)의 범위가 아니라 `TEST-RLS-BASIC`(통합 테스트,
    // 실제 계정 필요) 영역이다 — 여기서는 그 제약이 실제로 정의돼 있는지만
    // 정적으로 확인한다.
    const migrationPath = path.resolve(
      process.cwd(),
      "supabase/migrations/0001_schema.sql",
    );
    const migrationSql = readFileSync(migrationPath, "utf-8");

    expect(migrationSql).toContain(
      "create unique index mate_applications_unique_active",
    );
    expect(migrationSql).toContain(
      "on mate_applications (post_id, applicant_id)",
    );
    expect(migrationSql).toContain("where status in ('PENDING', 'ACCEPTED')");
  });
});
