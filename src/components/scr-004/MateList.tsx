import Link from "next/link";

import { EmptyState } from "@/components/shared/EmptyState";
import type { MatePost } from "@/lib/db/mates";

const MAX_CARDS = 8;

export interface MateListProps {
  /** Page Owner가 필터를 적용해 미리 조회한 목록. `effectiveStatus`로 자동 마감이 이미 계산되어 있다. */
  posts: MatePost[];
  /** 현재 필터가 하나라도 걸려 있는지(Empty State의 "필터 초기화" 노출 여부 결정용). */
  hasActiveFilter: boolean;
}

/**
 * SCR-004 동행글 목록 Card List + Empty State(REQ-FUNC-030/037). 최대 8개까지
 * 표시하며, 카드 클릭은 `?post=<id>` 쿼리로 이동해 같은 화면의 상세
 * 패널/Drawer(`MateDetailPanel`)를 연다(별도 Route를 만들지 않는다).
 */
export function MateList({ posts, hasActiveFilter }: MateListProps) {
  const visiblePosts = posts.slice(0, MAX_CARDS);

  if (visiblePosts.length === 0) {
    return (
      <EmptyState
        reason={
          hasActiveFilter
            ? "조건에 맞는 동행글이 없습니다."
            : "아직 등록된 동행글이 없습니다."
        }
        guidance="필터를 조정하거나 새로운 동행글을 작성해 보세요."
        action={
          hasActiveFilter
            ? { label: "필터 초기화", href: "/mates" }
            : { label: "동행글 작성하기", href: "/travel-tools" }
        }
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {visiblePosts.map((post) => (
        <li key={post.id} className="list-none">
          <Link
            href={`/mates?post=${post.id}`}
            className="block rounded-[16px] border border-[#E4E1DC] p-4"
          >
            <span
              className={`inline-block rounded-[999px] px-3 py-1 text-[13px] font-semibold ${
                post.effectiveStatus === "RECRUITING"
                  ? "bg-[#FDE3D8] text-[#F0653C]"
                  : "bg-[#F7F6F4] text-[#6B6863]"
              }`}
            >
              {post.effectiveStatus === "RECRUITING" ? "모집중" : "마감"}
            </span>
            <p className="mt-2 text-[14px] text-[#6B6863]">
              {post.country}
              {post.region ? ` · ${post.region}` : ""} · {post.startDate} ~{" "}
              {post.endDate} · {post.headcount}명
            </p>
            <h3 className="mt-1 text-[18px] font-semibold text-[#2B2A28]">
              {post.title}
            </h3>
            {post.travelStyle.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {post.travelStyle.map((style) => (
                  <span
                    key={style}
                    className="rounded-[999px] border border-[#E4E1DC] px-2 py-1 text-[12px] text-[#2B2A28]"
                  >
                    {style}
                  </span>
                ))}
              </div>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
