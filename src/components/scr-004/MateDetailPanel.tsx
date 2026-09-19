"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { FOCUS_RING_CLASS_NAME, MIN_TOUCH_TARGET_CLASS_NAME } from "@/lib/a11y";
import type { MatePost } from "@/lib/db/mates";
import { shareLink } from "@/lib/share";

export interface MateDetailPost extends MatePost {
  /** 작성자 닉네임만 표시한다 — 이메일·연락처는 절대 포함하지 않는다(REQ-FUNC-033). */
  authorNickname: string;
}

interface MateDetailPanelProps {
  post: MateDetailPost | null;
  /** 참가 요청/차단/신고 버튼 슬롯(Page Owner가 이미 렌더링해 전달한다). */
  actions?: ReactNode;
}

/**
 * SCR-004 상세 패널(Desktop)/Drawer(Mobile)(REQ-FUNC-033/069). `post`가
 * `null`이면 아무것도 렌더링하지 않는다 — 열림/닫힘은 `?post=<id>` 쿼리
 * 유무로만 제어하며(같은 화면, 별도 Route 없음), 닫기는 `/mates`로 이동한다.
 */
export function MateDetailPanel({ post, actions }: MateDetailPanelProps) {
  const router = useRouter();

  if (!post) {
    return null;
  }

  function handleShare() {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    void shareLink({
      url: `${origin}/mates?post=${post!.id}`,
      title: post!.title,
      text: post!.description,
    });
  }

  return (
    <div className="fixed inset-0 z-40 md:static md:inset-auto">
      <button
        type="button"
        aria-label="닫기"
        onClick={() => router.push("/mates")}
        className="absolute inset-0 h-full w-full cursor-default bg-[rgba(0,0,0,0.5)] md:hidden"
      />
      <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[16px] bg-[#FFFFFF] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.08)] md:static md:h-full md:max-h-none md:rounded-[16px] md:border md:border-[#E4E1DC] md:shadow-none">
        <div className="flex items-start justify-between gap-4">
          <span
            className={`inline-block rounded-[999px] px-3 py-1 text-[13px] font-semibold ${
              post.effectiveStatus === "RECRUITING"
                ? "bg-[#FDE3D8] text-[#F0653C]"
                : "bg-[#F7F6F4] text-[#6B6863]"
            }`}
          >
            {post.effectiveStatus === "RECRUITING" ? "모집중" : "마감"}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleShare}
              className={`${FOCUS_RING_CLASS_NAME} ${MIN_TOUCH_TARGET_CLASS_NAME} text-[14px] text-[#6B6863]`}
            >
              공유
            </button>
            <button
              type="button"
              onClick={() => router.push("/mates")}
              className={`${FOCUS_RING_CLASS_NAME} ${MIN_TOUCH_TARGET_CLASS_NAME} text-[14px] text-[#6B6863] md:hidden`}
            >
              닫기
            </button>
          </div>
        </div>

        <h2 className="mt-3 text-[24px] font-bold text-[#2B2A28]">
          {post.title}
        </h2>
        <p className="mt-1 text-[14px] text-[#6B6863]">
          작성자: {post.authorNickname}
        </p>
        <p className="mt-1 text-[14px] text-[#6B6863]">
          {post.country}
          {post.region ? ` · ${post.region}` : ""} · {post.startDate} ~{" "}
          {post.endDate} · {post.headcount}명
        </p>

        {post.travelStyle.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {post.travelStyle.map((style) => (
              <span
                key={style}
                className="rounded-[999px] border border-[#E4E1DC] px-3 py-1 text-[13px] text-[#2B2A28]"
              >
                {style}
              </span>
            ))}
          </div>
        ) : null}

        <p className="mt-4 whitespace-pre-wrap text-[16px] leading-[1.6] text-[#2B2A28]">
          {post.description}
        </p>

        {actions ? (
          <div className="mt-6 flex flex-col gap-3">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}
