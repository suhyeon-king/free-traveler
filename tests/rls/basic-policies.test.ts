import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * RLS 기본 정책 통합 테스트 (REQ-FUNC-044, REQ-NF-013, TASK-TEST-RLS-BASIC).
 *
 * **중요 — 실제 프로젝트 대상 실행(env-gated)**: 이 프로젝트에는 별도의 Supabase
 * 테스트 프로젝트가 없어(인프라 제약, 사람 확인 완료) 실제 배포 프로젝트를 대상으로
 * 실행한다. 아래 환경변수가 모두 없으면 이 파일 전체를 명시적으로 skip한다(실패로
 * 처리하지 않는다) — `npm run test:unit`을 평소처럼 실행해도 이 변수들이 없으면
 * 조용히 건너뛰므로 CI 기본 Gate에 영향을 주지 않는다.
 *
 * 필요한 환경변수(더미 테스트 계정 — CLAUDE.md 규칙에 따라 실제 개인정보를 쓰지 않는다):
 *   - NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY (이미 사용 중)
 *   - RLS_TEST_USER_A_EMAIL / RLS_TEST_USER_A_PASSWORD (일반 회원 1 — "본인" 역할)
 *   - RLS_TEST_USER_B_EMAIL / RLS_TEST_USER_B_PASSWORD (일반 회원 2 — "타인" 역할)
 *   - (선택) SUPABASE_SERVICE_ROLE_KEY + RLS_TEST_ADMIN_EMAIL / RLS_TEST_ADMIN_PASSWORD
 *     — Admin/Moderator RLS 검증용. `app_metadata.role`은 Admin API로만 설정할 수
 *     있어 이 조합이 없으면 Admin 관련 테스트만 skip한다(다른 검증에는 영향 없음).
 *     `SUPABASE_SERVICE_ROLE_KEY`는 이 Vitest 설정 파일(Node 전용, 빌드 산출물에
 *     포함되지 않음)에서만 읽으며, Client/브라우저 코드 어디에도 쓰지 않는다
 *     (CLAUDE.md 규칙 15).
 *
 * 위 회원 계정 2개는 Supabase Auth에 미리 만들어 이메일 인증까지 완료해 둬야 한다
 * (자동 가입은 이메일 인증 절차 때문에 이 테스트에서 처리할 수 없다).
 *
 * 테스트가 만든 행은 가능한 한 각 클라이언트의 소유자 권한으로 직접 정리
 * (cleanup)한다. 다만 `reports` 테이블은 어떤 역할에도 DELETE 정책이 없어(관리자
 * 포함 조회/상태변경만 가능) service_role 없이는 되돌릴 수 없다 — 그래서 기본
 * 티어에서는 신고 생성 자체를 하지 않고 익명 사용자의 삽입 거부만 검증하며,
 * 실제 신고 생성+정리는 service_role이 있는 Admin 티어에서만 수행한다.
 */

const RUN_TAG = `rls-test-${Date.now()}`;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const USER_A_EMAIL = process.env.RLS_TEST_USER_A_EMAIL;
const USER_A_PASSWORD = process.env.RLS_TEST_USER_A_PASSWORD;
const USER_B_EMAIL = process.env.RLS_TEST_USER_B_EMAIL;
const USER_B_PASSWORD = process.env.RLS_TEST_USER_B_PASSWORD;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL = process.env.RLS_TEST_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.RLS_TEST_ADMIN_PASSWORD;

const hasCoreEnv = Boolean(
  SUPABASE_URL &&
  ANON_KEY &&
  USER_A_EMAIL &&
  USER_A_PASSWORD &&
  USER_B_EMAIL &&
  USER_B_PASSWORD,
);
const hasAdminEnv = Boolean(
  hasCoreEnv && SERVICE_ROLE_KEY && ADMIN_EMAIL && ADMIN_PASSWORD,
);

function anonClient(): SupabaseClient {
  return createClient(SUPABASE_URL!, ANON_KEY!);
}

async function signIn(
  email: string,
  password: string,
): Promise<SupabaseClient> {
  const client = anonClient();
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(
      `로그인 실패(${email}): ${error.message} — RLS_TEST_* 계정이 미리 생성·이메일 인증되어 있는지 확인하세요.`,
    );
  }
  return client;
}

async function currentUserId(client: SupabaseClient): Promise<string> {
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) {
    throw new Error("현재 로그인 사용자를 확인할 수 없습니다.");
  }
  return data.user.id;
}

describe.skipIf(!hasCoreEnv)("RLS 기본 정책(익명/본인/타인)", () => {
  let clientA: SupabaseClient;
  let clientB: SupabaseClient;
  let userIdA: string;
  let userIdB: string;
  let postId: string | null = null;
  let applicationId: string | null = null;

  beforeAll(async () => {
    clientA = await signIn(USER_A_EMAIL!, USER_A_PASSWORD!);
    clientB = await signIn(USER_B_EMAIL!, USER_B_PASSWORD!);
    userIdA = await currentUserId(clientA);
    userIdB = await currentUserId(clientB);

    for (const [client, id, nickname] of [
      [clientA, userIdA, "RLS Test A"],
      [clientB, userIdB, "RLS Test B"],
    ] as const) {
      const { error } = await client.from("profiles").upsert({
        id,
        nickname,
        age_range: "19-24",
        travel_style: ["배낭여행"],
        is_adult: true,
      });
      if (error) {
        throw new Error(`프로필 upsert 실패(${nickname}): ${error.message}`);
      }
    }
  });

  afterAll(async () => {
    if (applicationId) {
      await clientB.from("mate_applications").delete().eq("id", applicationId);
    }
    if (postId) {
      await clientA.from("mate_posts").delete().eq("id", postId);
    }
    await clientA
      .from("user_blocks")
      .delete()
      .eq("blocker_id", userIdA)
      .eq("blocked_id", userIdB);
  });

  describe("profiles", () => {
    it("익명 사용자는 profiles를 조회할 수 없다(authenticated 전용 정책)", async () => {
      const { data } = await anonClient().from("profiles").select("id");
      expect(data ?? []).toHaveLength(0);
    });

    it("인증된 타인은 본인이 아닌 profiles도 조회할 수 있다(공개 열람 정책)", async () => {
      const { data, error } = await clientB
        .from("profiles")
        .select("id")
        .eq("id", userIdA);
      expect(error).toBeNull();
      expect(data).toHaveLength(1);
    });

    it("타인은 본인이 아닌 profiles를 수정할 수 없다", async () => {
      const { data } = await clientB
        .from("profiles")
        .update({ nickname: "해킹 시도" })
        .eq("id", userIdA)
        .select();
      expect(data ?? []).toHaveLength(0);
    });
  });

  describe("mate_posts", () => {
    it("익명 사용자는 동행글을 작성할 수 없다", async () => {
      const { error } = await anonClient()
        .from("mate_posts")
        .insert({
          author_id: userIdA,
          country: "테스트국",
          start_date: "2027-01-01",
          end_date: "2027-01-05",
          headcount: 2,
          travel_style: [],
          title: `${RUN_TAG}-anon-insert`,
          description: "익명 삽입 거부 검증용",
        });
      expect(error).not.toBeNull();
    });

    it("본인은 동행글을 작성할 수 있고, 익명 사용자도 그 글을 조회할 수 있다", async () => {
      const { data, error } = await clientA
        .from("mate_posts")
        .insert({
          author_id: userIdA,
          country: "테스트국",
          start_date: "2027-01-01",
          end_date: "2027-01-05",
          headcount: 2,
          travel_style: ["배낭여행"],
          title: `${RUN_TAG}-post`,
          description: "RLS 통합 테스트용 동행글입니다.",
        })
        .select()
        .single();
      expect(error).toBeNull();
      expect(data?.id).toBeTruthy();
      postId = data!.id as string;

      const { data: anonView, error: anonError } = await anonClient()
        .from("mate_posts")
        .select("id, title")
        .eq("id", postId);
      expect(anonError).toBeNull();
      expect(anonView).toHaveLength(1);
    });

    it("타인은 본인이 아닌 동행글을 수정할 수 없다", async () => {
      const { data } = await clientB
        .from("mate_posts")
        .update({ title: `${RUN_TAG}-hijacked` })
        .eq("id", postId!)
        .select();
      expect(data ?? []).toHaveLength(0);
    });

    it("본인은 자신의 동행글을 수정할 수 있다", async () => {
      const { data, error } = await clientA
        .from("mate_posts")
        .update({ headcount: 3 })
        .eq("id", postId!)
        .select();
      expect(error).toBeNull();
      expect(data).toHaveLength(1);
      expect(data?.[0]?.headcount).toBe(3);
    });
  });

  describe("mate_applications", () => {
    it("타인(성인 인증된 회원)은 참가 요청을 보낼 수 있고, 작성자는 그 요청을 볼 수 있다", async () => {
      const { data: inserted, error: insertError } = await clientB
        .from("mate_applications")
        .insert({
          post_id: postId!,
          applicant_id: userIdB,
          message: `${RUN_TAG}-application`,
        })
        .select()
        .single();
      expect(insertError).toBeNull();
      applicationId = inserted!.id as string;

      const { data: authorView, error: authorError } = await clientA
        .from("mate_applications")
        .select("id")
        .eq("id", applicationId);
      expect(authorError).toBeNull();
      expect(authorView).toHaveLength(1);
    });

    it("익명 사용자는 참가 요청을 조회할 수 없다", async () => {
      const { data } = await anonClient()
        .from("mate_applications")
        .select("id")
        .eq("id", applicationId!);
      expect(data ?? []).toHaveLength(0);
    });

    it("신청자 본인은 참가 요청 상태를 변경할 수 없다(작성자/관리자만 가능)", async () => {
      const { data } = await clientB
        .from("mate_applications")
        .update({ status: "ACCEPTED" })
        .eq("id", applicationId!)
        .select();
      expect(data ?? []).toHaveLength(0);
    });

    it("글 작성자는 참가 요청을 승인할 수 있다", async () => {
      const { data, error } = await clientA
        .from("mate_applications")
        .update({ status: "ACCEPTED" })
        .eq("id", applicationId!)
        .select();
      expect(error).toBeNull();
      expect(data?.[0]?.status).toBe("ACCEPTED");
    });
  });

  describe("user_blocks", () => {
    it("본인은 타인을 차단할 수 있고, 차단 목록은 차단한 본인만 조회할 수 있다", async () => {
      const { error: insertError } = await clientA.from("user_blocks").insert({
        blocker_id: userIdA,
        blocked_id: userIdB,
      });
      expect(insertError).toBeNull();

      const { data: ownView, error: ownError } = await clientA
        .from("user_blocks")
        .select("id")
        .eq("blocker_id", userIdA)
        .eq("blocked_id", userIdB);
      expect(ownError).toBeNull();
      expect(ownView).toHaveLength(1);
    });

    it("차단당한 사람은 그 차단 행을 조회할 수 없다", async () => {
      const { data } = await clientB
        .from("user_blocks")
        .select("id")
        .eq("blocker_id", userIdA)
        .eq("blocked_id", userIdB);
      expect(data ?? []).toHaveLength(0);
    });
  });

  describe("reports (익명 삽입 거부만 검증 — 정리 불가능한 행은 만들지 않음)", () => {
    it("익명 사용자는 신고를 접수할 수 없다", async () => {
      const { error } = await anonClient()
        .from("reports")
        .insert({
          reporter_id: userIdA,
          target_type: "POST",
          target_id: postId ?? userIdA,
          reason: `${RUN_TAG}-anon-report`,
        });
      expect(error).not.toBeNull();
    });
  });

  describe("app_settings", () => {
    it("익명 사용자도 항공·숙소 외부 URL 설정을 조회할 수 있다(공개 설정값)", async () => {
      const { data, error } = await anonClient()
        .from("app_settings")
        .select("key");
      expect(error).toBeNull();
      expect(data).not.toBeNull();
    });

    it("Admin/Moderator가 아닌 일반 회원은 설정을 변경할 수 없다", async (ctx) => {
      // update()는 대상 행이 없으면 권한과 무관하게 0행을 반환하므로, 먼저 행이
      // 실제로 존재하는지 확인해 "RLS가 막았다"는 결론이 거짓 양성이 되지 않게 한다.
      const { data: existing } = await anonClient()
        .from("app_settings")
        .select("key")
        .eq("key", "flight_outbound_url")
        .maybeSingle();
      if (!existing) {
        ctx.skip();
        return;
      }
      const { data } = await clientB
        .from("app_settings")
        .update({ value: "https://example.com/hacked" })
        .eq("key", "flight_outbound_url")
        .select();
      expect(data ?? []).toHaveLength(0);
    });
  });
});

describe.skipIf(!hasAdminEnv)("RLS 기본 정책(Admin/Moderator)", () => {
  let serviceClient: SupabaseClient;
  let adminClient: SupabaseClient;
  let userIdA: string;
  let adminUserId: string;
  let postId: string | null = null;
  let reportId: string | null = null;

  beforeAll(async () => {
    serviceClient = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!);

    const clientA = await signIn(USER_A_EMAIL!, USER_A_PASSWORD!);
    userIdA = await currentUserId(clientA);
    await clientA.from("profiles").upsert({
      id: userIdA,
      nickname: "RLS Test A",
      age_range: "19-24",
      travel_style: ["배낭여행"],
      is_adult: true,
    });
    const { data: post, error: postError } = await clientA
      .from("mate_posts")
      .insert({
        author_id: userIdA,
        country: "테스트국",
        start_date: "2027-01-01",
        end_date: "2027-01-05",
        headcount: 2,
        travel_style: ["배낭여행"],
        title: `${RUN_TAG}-admin-post`,
        description: "Admin RLS 통합 테스트용 동행글입니다.",
      })
      .select()
      .single();
    if (postError) {
      throw new Error(`관리자 테스트용 동행글 생성 실패: ${postError.message}`);
    }
    postId = post!.id as string;

    // 신고자 역할은 clientA로 충분하다 — Admin 티어는 "Admin이 남의 신고를
    // 볼 수 있는지"만 검증하면 되고, 신고자가 누구인지는 중요하지 않다.
    const { data: report, error: reportError } = await clientA
      .from("reports")
      .insert({
        reporter_id: userIdA,
        target_type: "POST",
        target_id: postId,
        reason: `${RUN_TAG}-admin-report`,
      })
      .select()
      .single();
    if (reportError) {
      throw new Error(`관리자 테스트용 신고 생성 실패: ${reportError.message}`);
    }
    reportId = report!.id as string;

    // app_metadata.role은 Admin API로만 설정할 수 있고, JWT 클레임에 반영되려면
    // 재로그인(새 액세스 토큰 발급)이 필요하다.
    const adminSignIn = await signIn(ADMIN_EMAIL!, ADMIN_PASSWORD!);
    adminUserId = await currentUserId(adminSignIn);
    const { error: roleError } = await serviceClient.auth.admin.updateUserById(
      adminUserId,
      { app_metadata: { role: "admin" } },
    );
    if (roleError) {
      throw new Error(`Admin 역할 설정 실패: ${roleError.message}`);
    }
    await adminSignIn.auth.signOut();
    adminClient = await signIn(ADMIN_EMAIL!, ADMIN_PASSWORD!);
  });

  afterAll(async () => {
    // reports는 어떤 역할도 DELETE 정책이 없어 service_role로만 정리할 수 있다.
    if (reportId) {
      await serviceClient.from("reports").delete().eq("id", reportId);
    }
    if (postId) {
      await serviceClient.from("mate_posts").delete().eq("id", postId);
    }
  });

  it("Admin은 본인이 신고하지 않은 신고 건도 조회할 수 있다", async () => {
    const { data, error } = await adminClient
      .from("reports")
      .select("id")
      .eq("id", reportId!);
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
  });

  it("Admin은 신고 상태를 변경할 수 있다", async () => {
    const { data, error } = await adminClient
      .from("reports")
      .update({ status: "RESOLVED" })
      .eq("id", reportId!)
      .select();
    expect(error).toBeNull();
    expect(data?.[0]?.status).toBe("RESOLVED");
  });

  it("Admin은 본인 소유가 아닌 동행글도 수정할 수 있다", async () => {
    const { data, error } = await adminClient
      .from("mate_posts")
      .update({ headcount: 4 })
      .eq("id", postId!)
      .select();
    expect(error).toBeNull();
    expect(data?.[0]?.headcount).toBe(4);
  });

  it("Admin은 외부 URL 설정을 변경할 수 있다", async () => {
    // 행이 아직 없을 수도 있어(이 환경엔 별도 시드가 적용되지 않음) update가 아닌
    // upsert로 검증한다(실제 `setAppSetting()` 구현과 동일한 방식).
    const { data: existing } = await adminClient
      .from("app_settings")
      .select("value")
      .eq("key", "flight_outbound_url")
      .maybeSingle();
    const originalValue = existing?.value as string | undefined;

    const { data, error } = await adminClient
      .from("app_settings")
      .upsert({
        key: "flight_outbound_url",
        value: "https://www.google.com/travel/flights",
        updated_by: adminUserId,
      })
      .select();
    expect(error).toBeNull();
    expect(data).toHaveLength(1);

    if (originalValue) {
      await adminClient
        .from("app_settings")
        .update({ value: originalValue })
        .eq("key", "flight_outbound_url");
    } else {
      await serviceClient
        .from("app_settings")
        .delete()
        .eq("key", "flight_outbound_url");
    }
  });
});
