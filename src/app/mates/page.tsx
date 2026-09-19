import Link from "next/link";

import {
  ApplyForm,
  type ApplySubmitResult,
} from "@/components/scr-004/ApplyForm";
import {
  BlockButton,
  type BlockActionResult,
} from "@/components/scr-004/BlockButton";
import {
  MateDetailPanel,
  type MateDetailPost,
} from "@/components/scr-004/MateDetailPanel";
import { MateFilter } from "@/components/scr-004/MateFilter";
import { MateList } from "@/components/scr-004/MateList";
import {
  ReportButton,
  type ReportSubmitResult,
} from "@/components/scr-004/ReportButton";
import { Footer } from "@/components/shared/Footer";
import { Header } from "@/components/shared/Header";
import { createServerSupabaseClient, getServerUser } from "@/lib/auth";
import {
  blockUser,
  createMateApplication,
  listMatePosts,
  type GenderPreference,
  type MatePostFilter,
  type MatePostStatus,
} from "@/lib/db/mates";
import { createReport, type ReportTargetType } from "@/lib/db/reports";
import { getScreenMetadata } from "@/lib/seo";

export const metadata = getScreenMetadata("/mates");

function asString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value || undefined;
}

async function applyAction(
  postId: string,
  message: string,
): Promise<ApplySubmitResult> {
  "use server";

  const user = await getServerUser();
  if (!user) {
    return { ok: false, error: "로그인이 필요합니다." };
  }
  try {
    await createMateApplication(user.id, postId, message);
    return { ok: true };
  } catch (error) {
    const isDuplicate =
      error instanceof Error && error.message.includes("duplicate");
    return {
      ok: false,
      error: isDuplicate
        ? "이미 이 글에 참가 요청을 보냈습니다."
        : error instanceof Error
          ? error.message
          : "참가 요청에 실패했습니다.",
    };
  }
}

async function blockAction(blockedUserId: string): Promise<BlockActionResult> {
  "use server";

  const user = await getServerUser();
  if (!user) {
    return { ok: false, error: "로그인이 필요합니다." };
  }
  try {
    await blockUser(user.id, blockedUserId);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "차단에 실패했습니다.",
    };
  }
}

async function reportAction(
  targetType: ReportTargetType,
  targetId: string,
  reason: string,
): Promise<ReportSubmitResult> {
  "use server";

  const user = await getServerUser();
  if (!user) {
    return { ok: false, error: "로그인이 필요합니다." };
  }
  try {
    const report = await createReport(user.id, {
      targetType,
      targetId,
      reason,
    });
    return { ok: true, reportId: report.id, createdAt: report.createdAt };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "신고 접수에 실패했습니다.",
    };
  }
}

interface MatesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function MatesPage({ searchParams }: MatesPageProps) {
  const params = await searchParams;

  const filter: MatePostFilter = {
    country: asString(params.country),
    region: asString(params.region),
    dateFrom: asString(params.dateFrom),
    dateTo: asString(params.dateTo),
    ageRange: asString(params.ageRange),
    genderPreference: asString(params.gender) as GenderPreference | undefined,
    travelStyle: asString(params.travelStyle),
    status: asString(params.status) as MatePostStatus | undefined,
  };
  const hasActiveFilter = Object.values(filter).some(Boolean);
  const selectedPostId = asString(params.post);

  const user = await getServerUser();
  let isAdult = false;
  if (user) {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from("profiles")
      .select("is_adult")
      .eq("id", user.id)
      .maybeSingle();
    isAdult = Boolean(data?.is_adult);
  }
  const mateUser = user ? { id: user.id, isAdult } : null;

  let posts: Awaited<ReturnType<typeof listMatePosts>> = [];
  try {
    posts = await listMatePosts(filter);
  } catch {
    posts = [];
  }

  let selectedPost: MateDetailPost | null = null;
  if (selectedPostId) {
    const found = posts.find((post) => post.id === selectedPostId);
    if (found) {
      const supabase = await createServerSupabaseClient();
      const { data: authorProfile } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("id", found.authorId)
        .maybeSingle();
      selectedPost = {
        ...found,
        authorNickname:
          (authorProfile?.nickname as string | undefined) ??
          "알 수 없는 사용자",
      };
    }
  }

  const detailActions = selectedPost ? (
    <>
      <ApplyForm
        postId={selectedPost.id}
        user={mateUser}
        onSubmit={applyAction}
      />
      <ReportButton
        targetType="POST"
        targetId={selectedPost.id}
        isLoggedIn={Boolean(mateUser)}
        onReport={reportAction}
      />
      {mateUser && mateUser.id !== selectedPost.authorId ? (
        <BlockButton
          blockedUserId={selectedPost.authorId}
          isLoggedIn={Boolean(mateUser)}
          onBlock={blockAction}
        />
      ) : null}
    </>
  ) : null;

  return (
    <>
      <Header />
      <main className="mx-auto flex max-w-[1280px] flex-col gap-8 px-4 py-16 md:px-8">
        <section className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-[32px] font-bold text-[#2B2A28]">동행 찾기</h1>
            <p className="mt-2 text-[16px] text-[#2B2A28]">
              함께 여행할 동행을 찾아보고, 직접 모집글을 작성해 보세요.
            </p>
          </div>
          <Link
            href="/travel-tools"
            className="inline-flex items-center rounded-[999px] bg-[#F0653C] px-6 py-3 text-[16px] font-semibold text-[#FFFFFF]"
          >
            동행글 작성하기
          </Link>
        </section>

        <MateFilter resultCount={posts.length} />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[30%_70%]">
          <MateList posts={posts} hasActiveFilter={hasActiveFilter} />
          {selectedPost ? (
            <MateDetailPanel post={selectedPost} actions={detailActions} />
          ) : (
            <div className="hidden items-center justify-center rounded-[16px] border border-dashed border-[#E4E1DC] p-8 text-center text-[14px] text-[#6B6863] md:flex">
              목록에서 동행글을 선택하면 여기에서 상세 내용을 볼 수 있습니다.
            </div>
          )}
        </div>

        <section className="rounded-[16px] bg-[#F7F6F4] px-6 py-8">
          <h2 className="text-[18px] font-semibold text-[#2B2A28]">
            참가 신청 방법
          </h2>
          <ol className="mt-3 flex flex-col gap-2 text-[14px] text-[#2B2A28]">
            <li>1. 관심 있는 동행글을 선택해 상세 내용을 확인하세요.</li>
            <li>2. 참가 메시지를 작성해 요청을 보내세요.</li>
            <li>3. 작성자가 승인하면 계정의 내 활동에서 확인할 수 있습니다.</li>
          </ol>
        </section>

        <section className="rounded-[16px] border border-[#1F4B8F] px-6 py-6">
          <h2 className="text-[16px] font-semibold text-[#1F4B8F]">
            안전한 동행을 위한 안내
          </h2>
          <p className="mt-2 text-[14px] text-[#2B2A28]">
            개인 연락처를 공개로 주고받지 마세요. 불편한 상황이 있다면 신고·차단
            기능을 이용해 주세요.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
