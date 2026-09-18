import Link from "next/link";

import { EmptyState } from "@/components/shared/EmptyState";
import { listMatePosts } from "@/lib/db/mates";

/**
 * SCR-001 ⑥ 최근 동행글 List(3)/완성형 Empty(REQ-FUNC-030/037).
 * 모집중(수동 상태 RECRUITING이고 `end_date`도 아직 지나지 않은) 동행글 최신 3개를
 * 보여준다. 이메일·연락처 등 비공개 필드는 `listMatePosts`가 이미 select에서 제외한다.
 */
export async function MatePreview() {
  let posts: Awaited<ReturnType<typeof listMatePosts>> = [];
  try {
    posts = await listMatePosts({ status: "RECRUITING" });
  } catch {
    // Supabase 연결 실패 시에도 Section 자체는 완성형 Empty State로 대체한다.
    posts = [];
  }

  const recruitingPosts = posts
    .filter((post) => post.effectiveStatus === "RECRUITING")
    .slice(0, 3);

  if (recruitingPosts.length === 0) {
    return (
      <section aria-labelledby="mate-preview-heading">
        <h2
          id="mate-preview-heading"
          className="mb-4 text-[24px] font-bold text-[#2B2A28]"
        >
          최근 동행글
        </h2>
        <EmptyState
          reason="아직 모집 중인 동행글이 없습니다."
          guidance="동행글을 작성하면 이곳과 동행 찾기 목록에 함께 노출됩니다."
          action={{ label: "동행글 작성하기", href: "/travel-tools" }}
        />
      </section>
    );
  }

  return (
    <section aria-labelledby="mate-preview-heading">
      <div className="mb-4 flex items-center justify-between">
        <h2
          id="mate-preview-heading"
          className="text-[24px] font-bold text-[#2B2A28]"
        >
          최근 동행글
        </h2>
        <Link
          href="/mates"
          className="text-[14px] font-semibold text-[#F0653C]"
        >
          동행 더 보기
        </Link>
      </div>
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {recruitingPosts.map((post) => (
          <li
            key={post.id}
            className="rounded-[16px] border border-[#E4E1DC] p-4"
          >
            <span className="inline-block rounded-[999px] bg-[#FDE3D8] px-3 py-1 text-[13px] font-semibold text-[#F0653C]">
              모집중
            </span>
            <h3 className="mt-2 text-[18px] font-semibold text-[#2B2A28]">
              {post.title}
            </h3>
            <p className="mt-1 text-[14px] text-[#6B6863]">
              {post.country}
              {post.region ? ` · ${post.region}` : ""} · {post.startDate} ~{" "}
              {post.endDate}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
