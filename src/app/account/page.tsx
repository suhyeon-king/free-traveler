import type { ReactNode } from "react";

import {
  AdminTab,
  type AdminActionResult,
} from "@/components/scr-005/AdminTab";
import { AuthTab } from "@/components/scr-005/AuthTab";
import {
  MyActivityTab,
  type ActivityActionResult,
  type ApplicationWithPostTitle,
  type BlockedUserSummary,
  type MyPostSummary,
} from "@/components/scr-005/MyActivityTab";
import {
  ProfileTab,
  type ProfileActionResult,
  type ProfileData,
} from "@/components/scr-005/ProfileTab";
import { Footer } from "@/components/shared/Footer";
import { Header } from "@/components/shared/Header";
import {
  confirmAdult,
  createServerSupabaseClient,
  getServerUser,
} from "@/lib/auth";
import { getAppSetting, setAppSetting } from "@/lib/db/admin";
import {
  deleteMatePost,
  getMatePostById,
  hasAcceptedApplicants,
  listApplicationsForPost,
  listBlockedUsers,
  listMyApplications,
  unblockUser,
  updateMateApplicationStatus,
  updateMatePost,
  type MateApplicationStatus,
  type MatePostStatus,
} from "@/lib/db/mates";
import {
  listMyReports,
  listReports,
  updateReportStatus,
  type ReportStatus,
} from "@/lib/db/reports";
import { getScreenMetadata } from "@/lib/seo";

export const metadata = getScreenMetadata("/account");

function computeEffectiveStatus(
  status: MatePostStatus,
  endDate: string,
): MatePostStatus {
  const isPastEndDate = new Date(endDate) < new Date(new Date().toDateString());
  return status === "CLOSED" || isPastEndDate ? "CLOSED" : "RECRUITING";
}

async function requireUserId(): Promise<string | null> {
  const user = await getServerUser();
  return user?.id ?? null;
}

async function saveProfileAction(input: {
  nickname: string;
  ageRange: string;
  gender: string | null;
  travelStyle: string[];
}): Promise<ProfileActionResult> {
  "use server";

  const userId = await requireUserId();
  if (!userId) {
    return { ok: false, error: "로그인이 필요합니다." };
  }
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      nickname: input.nickname,
      age_range: input.ageRange,
      gender: input.gender,
      travel_style: input.travelStyle,
    });
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "저장에 실패했습니다.",
    };
  }
}

async function confirmAdultAction(): Promise<ProfileActionResult> {
  "use server";

  const userId = await requireUserId();
  if (!userId) {
    return { ok: false, error: "로그인이 필요합니다." };
  }
  try {
    await confirmAdult(userId);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "성인 확인에 실패했습니다.",
    };
  }
}

async function updatePostStatusAction(
  postId: string,
  status: MatePostStatus,
): Promise<ActivityActionResult> {
  "use server";

  try {
    await updateMatePost(postId, { status });
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "상태 변경에 실패했습니다.",
    };
  }
}

async function deletePostAction(postId: string): Promise<ActivityActionResult> {
  "use server";

  try {
    await deleteMatePost(postId);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "삭제에 실패했습니다.",
    };
  }
}

async function updateApplicationStatusAction(
  applicationId: string,
  status: Exclude<MateApplicationStatus, "PENDING">,
): Promise<ActivityActionResult> {
  "use server";

  try {
    await updateMateApplicationStatus(applicationId, status);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "처리에 실패했습니다.",
    };
  }
}

async function unblockAction(
  blockedUserId: string,
): Promise<ActivityActionResult> {
  "use server";

  const userId = await requireUserId();
  if (!userId) {
    return { ok: false, error: "로그인이 필요합니다." };
  }
  try {
    await unblockUser(userId, blockedUserId);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "차단 해제에 실패했습니다.",
    };
  }
}

async function updateReportStatusAction(
  reportId: string,
  status: ReportStatus,
): Promise<AdminActionResult> {
  "use server";

  try {
    await updateReportStatus(reportId, status);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "상태 변경에 실패했습니다.",
    };
  }
}

async function saveOutboundUrlsAction(input: {
  flightOutboundUrl: string;
  hotelOutboundUrl: string;
}): Promise<AdminActionResult> {
  "use server";

  const userId = await requireUserId();
  if (!userId) {
    return { ok: false, error: "로그인이 필요합니다." };
  }
  try {
    await setAppSetting("flight_outbound_url", input.flightOutboundUrl, userId);
    await setAppSetting("hotel_outbound_url", input.hotelOutboundUrl, userId);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "저장에 실패했습니다.",
    };
  }
}

interface AccountTabDef {
  id: string;
  label: string;
  content: ReactNode;
}

interface AccountPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * 탭 전환은 `PAGE-SCR003`과 동일하게 순수 CSS(라디오 입력 + 형제 선택자)로
 * 구현했다 — Page Owner는 새 Client Wrapper Component를 만들 수 없다(규칙 9).
 * Admin 탭은 신고 상태 필터 변경 시 서버로 다시 이동(`router.push`)하므로 이때
 * 탭 선택 상태가 기본값으로 초기화된다 — `reportStatus` 쿼리 파라미터가 있으면
 * Admin 탭을 기본 선택으로 되돌려 이 한계를 완화했다(완전한 해결은 아님, 알려진
 * 제한사항으로 보고).
 */
export default async function AccountPage({ searchParams }: AccountPageProps) {
  const params = await searchParams;
  const reportStatusParam =
    typeof params.reportStatus === "string" ? params.reportStatus : undefined;
  const activeStatusFilter =
    (reportStatusParam as ReportStatus | undefined) ?? null;

  const user = await getServerUser();
  const isAdmin = Boolean(
    user &&
    ["admin", "moderator"].includes(
      (user.app_metadata?.role as string | undefined) ?? "",
    ),
  );

  const tabs: AccountTabDef[] = [];

  if (!user) {
    tabs.push({
      id: "auth",
      label: "로그인",
      content: <AuthTab isLoggedIn={false} />,
    });
  } else {
    const supabase = await createServerSupabaseClient();
    const { data: profileRow } = await supabase
      .from("profiles")
      .select(
        "nickname, age_range, gender, travel_style, is_adult, adult_verified_at",
      )
      .eq("id", user.id)
      .maybeSingle();

    const profileData: ProfileData = {
      nickname: (profileRow?.nickname as string | undefined) ?? "",
      ageRange: (profileRow?.age_range as string | undefined) ?? "",
      gender: (profileRow?.gender as string | null | undefined) ?? null,
      travelStyle: (profileRow?.travel_style as string[] | undefined) ?? [],
      isAdult: Boolean(profileRow?.is_adult),
      adultVerifiedAt:
        (profileRow?.adult_verified_at as string | null | undefined) ?? null,
    };

    const { data: myPostRows } = await supabase
      .from("mate_posts")
      .select(
        "id, author_id, country, region, start_date, end_date, headcount, age_range, gender_preference, travel_style, title, description, status, created_at, updated_at",
      )
      .eq("author_id", user.id)
      .order("created_at", { ascending: false });

    const myPosts: MyPostSummary[] = await Promise.all(
      (myPostRows ?? []).map(async (row) => {
        const hasAcceptedApplicant = await hasAcceptedApplicants(
          row.id as string,
        );
        return {
          id: row.id as string,
          authorId: row.author_id as string,
          country: row.country as string,
          region: (row.region as string | null) ?? null,
          startDate: row.start_date as string,
          endDate: row.end_date as string,
          headcount: row.headcount as number,
          ageRange: (row.age_range as string | null) ?? null,
          genderPreference: row.gender_preference as
            "male" | "female" | "any" | null,
          travelStyle: (row.travel_style as string[]) ?? [],
          title: row.title as string,
          description: row.description as string,
          status: row.status as MatePostStatus,
          effectiveStatus: computeEffectiveStatus(
            row.status as MatePostStatus,
            row.end_date as string,
          ),
          createdAt: row.created_at as string,
          updatedAt: row.updated_at as string,
          hasAcceptedApplicant,
        };
      }),
    );

    const receivedApplicationsNested = await Promise.all(
      myPosts.map(async (post) => {
        const applications = await listApplicationsForPost(post.id);
        return applications.map((application) => ({
          ...application,
          postTitle: post.title,
        }));
      }),
    );
    const receivedApplications: ApplicationWithPostTitle[] =
      receivedApplicationsNested.flat();

    const myApplicationsRaw = await listMyApplications(user.id);
    const myApplications: ApplicationWithPostTitle[] = await Promise.all(
      myApplicationsRaw.map(async (application) => {
        const post = await getMatePostById(application.postId);
        return {
          ...application,
          postTitle: post?.title ?? "삭제된 동행글",
        };
      }),
    );

    const myReports = await listMyReports(user.id);

    const blockedUserIds = await listBlockedUsers(user.id);
    let blockedUsers: BlockedUserSummary[] = [];
    if (blockedUserIds.length > 0) {
      const { data: blockedProfiles } = await supabase
        .from("profiles")
        .select("id, nickname")
        .in("id", blockedUserIds);
      blockedUsers = (blockedProfiles ?? []).map((row) => ({
        id: row.id as string,
        nickname: (row.nickname as string | undefined) ?? "알 수 없는 사용자",
      }));
    }

    tabs.push({
      id: "profile",
      label: "프로필",
      content: (
        <ProfileTab
          profile={profileData}
          onSave={saveProfileAction}
          onConfirmAdult={confirmAdultAction}
        />
      ),
    });
    tabs.push({
      id: "myactivity",
      label: "내 활동",
      content: (
        <MyActivityTab
          myPosts={myPosts}
          receivedApplications={receivedApplications}
          myApplications={myApplications}
          myReports={myReports}
          blockedUsers={blockedUsers}
          onUpdatePostStatus={updatePostStatusAction}
          onDeletePost={deletePostAction}
          onUpdateApplicationStatus={updateApplicationStatusAction}
          onUnblock={unblockAction}
        />
      ),
    });

    if (isAdmin) {
      let reports: Awaited<ReturnType<typeof listReports>> = [];
      try {
        reports = await listReports(activeStatusFilter ?? undefined);
      } catch {
        reports = [];
      }

      let flightOutboundUrl = process.env.FLIGHT_OUTBOUND_URL ?? "";
      let hotelOutboundUrl = process.env.HOTEL_OUTBOUND_URL ?? "";
      try {
        const flightSetting = await getAppSetting("flight_outbound_url");
        if (flightSetting) flightOutboundUrl = flightSetting.value;
        const hotelSetting = await getAppSetting("hotel_outbound_url");
        if (hotelSetting) hotelOutboundUrl = hotelSetting.value;
      } catch {
        // app_settings 조회 실패 시 환경변수 기본값을 그대로 사용한다.
      }

      tabs.push({
        id: "admin",
        label: "관리자",
        content: (
          <AdminTab
            isAdmin={isAdmin}
            reports={reports}
            activeStatusFilter={activeStatusFilter}
            flightOutboundUrl={flightOutboundUrl}
            hotelOutboundUrl={hotelOutboundUrl}
            onUpdateReportStatus={updateReportStatusAction}
            onSaveOutboundUrls={saveOutboundUrlsAction}
          />
        ),
      });
    }

    tabs.push({
      id: "auth",
      label: "계정",
      content: <AuthTab isLoggedIn />,
    });
  }

  const defaultTabId = reportStatusParam ? "admin" : (tabs[0]?.id ?? "auth");

  const tabStyles = tabs
    .map(
      (tab) =>
        `#account-tab-${tab.id}:checked ~ .account-tabbar label[for="account-tab-${tab.id}"] { color: #F0653C; border-color: #F0653C; background: #FFF7F3; } #account-tab-${tab.id}:checked ~ .account-panels #account-panel-${tab.id} { display: block; }`,
    )
    .join("\n");

  return (
    <>
      <Header />
      <main className="mx-auto flex max-w-[1280px] flex-col gap-8 px-4 py-16 md:px-8">
        <style>{`
          .account-radio { position: absolute; opacity: 0; width: 1px; height: 1px; }
          .account-panels > div { display: none; }
          .account-tabbar label {
            cursor: pointer;
            display: block;
            padding: 12px 16px;
            font-size: 15px;
            font-weight: 600;
            color: #6B6863;
            border-left: 3px solid transparent;
            border-radius: 8px;
          }
          @media (max-width: 767px) {
            .account-tabbar { display: flex; flex-direction: row; overflow-x: auto; gap: 8px; }
            .account-tabbar label { border-left: none; border-bottom: 3px solid transparent; white-space: nowrap; }
          }
          ${tabStyles}
        `}</style>

        <section>
          <h1 className="text-[32px] font-bold text-[#2B2A28]">계정</h1>
          <p className="mt-2 text-[16px] leading-[1.6] text-[#2B2A28]">
            {user
              ? "프로필과 동행 활동, 차단 목록을 관리할 수 있습니다."
              : "로그인하면 프로필 설정, 동행 활동 관리 기능을 이용할 수 있습니다."}
          </p>
        </section>

        <div className="flex flex-col gap-8 md:flex-row">
          {tabs.map((tab, index) => (
            <input
              key={tab.id}
              type="radio"
              name="account-tab"
              id={`account-tab-${tab.id}`}
              defaultChecked={
                tab.id === defaultTabId || (!defaultTabId && index === 0)
              }
              className="account-radio"
            />
          ))}

          <nav className="account-tabbar flex flex-col gap-1 md:w-[240px] md:shrink-0">
            {tabs.map((tab) => (
              <label key={tab.id} htmlFor={`account-tab-${tab.id}`}>
                {tab.label}
              </label>
            ))}
          </nav>

          <div className="account-panels max-w-[960px] flex-1">
            {tabs.map((tab) => (
              <div key={tab.id} id={`account-panel-${tab.id}`}>
                {tab.content}
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
