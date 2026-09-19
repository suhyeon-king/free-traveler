"use client";

import { useState } from "react";

import { EmptyState } from "@/components/shared/EmptyState";
import { FOCUS_RING_CLASS_NAME, MIN_TOUCH_TARGET_CLASS_NAME } from "@/lib/a11y";
import type {
  MateApplication,
  MateApplicationStatus,
  MatePost,
  MatePostStatus,
} from "@/lib/db/mates";
import type { Report } from "@/lib/db/reports";

export type ActivityActionResult = { ok: true } | { ok: false; error: string };

export interface MyPostSummary extends MatePost {
  hasAcceptedApplicant: boolean;
}

export interface ApplicationWithPostTitle extends MateApplication {
  postTitle: string;
}

export interface BlockedUserSummary {
  id: string;
  nickname: string;
}

interface MyActivityTabProps {
  myPosts: MyPostSummary[];
  receivedApplications: ApplicationWithPostTitle[];
  myApplications: ApplicationWithPostTitle[];
  myReports: Report[];
  blockedUsers: BlockedUserSummary[];
  onUpdatePostStatus: (
    postId: string,
    status: MatePostStatus,
  ) => Promise<ActivityActionResult>;
  onDeletePost: (postId: string) => Promise<ActivityActionResult>;
  onUpdateApplicationStatus: (
    applicationId: string,
    status: Exclude<MateApplicationStatus, "PENDING">,
  ) => Promise<ActivityActionResult>;
  onUnblock: (blockedUserId: string) => Promise<ActivityActionResult>;
}

/**
 * SCR-005 내 글·참가 요청·차단 목록(Member, REQ-FUNC-036~040/043 간소화).
 * 상태 변경 결과는 인라인 안내로 표시한다(전역 `ToastProvider`가 아직 앱에
 * 연결되지 않아 `useToast()`를 직접 호출하지 않았다 — `CMP-SCR004-APPLY`와
 * 동일한 판단).
 */
export function MyActivityTab({
  myPosts,
  receivedApplications,
  myApplications,
  myReports,
  blockedUsers,
  onUpdatePostStatus,
  onDeletePost,
  onUpdateApplicationStatus,
  onUnblock,
}: MyActivityTabProps) {
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAction(
    action: () => Promise<ActivityActionResult>,
    successMessage: string,
  ) {
    setError(null);
    setNotice(null);
    const result = await action();
    if (result.ok) {
      setNotice(successMessage);
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="flex flex-col gap-10">
      {notice ? (
        <p role="status" className="text-[14px] text-[#1E8A5F]">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-[14px] font-semibold text-[#D0342C]">
          {error}
        </p>
      ) : null}

      <section>
        <h3 className="mb-3 text-[18px] font-semibold text-[#2B2A28]">
          내가 쓴 동행글
        </h3>
        {myPosts.length === 0 ? (
          <EmptyState
            reason="아직 작성한 동행글이 없어요."
            guidance="여행 준비 화면에서 동행글을 작성해 보세요."
            action={{ label: "동행글 작성하기", href: "/travel-tools" }}
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {myPosts.map((post) => (
              <li
                key={post.id}
                className="rounded-[16px] border border-[#E4E1DC] p-4"
              >
                <p className="text-[16px] font-semibold text-[#2B2A28]">
                  {post.title}
                </p>
                <p className="mt-1 text-[13px] text-[#6B6863]">
                  {post.effectiveStatus === "RECRUITING" ? "모집중" : "마감"}
                </p>
                {post.hasAcceptedApplicant ? (
                  <p className="mt-1 text-[13px] text-[#B7791F]">
                    이미 승인한 참가자가 있습니다. 마감·삭제 시 유의하세요.
                  </p>
                ) : null}
                <div className="mt-2 flex gap-3">
                  {post.status === "RECRUITING" ? (
                    <button
                      type="button"
                      onClick={() =>
                        runAction(
                          () => onUpdatePostStatus(post.id, "CLOSED"),
                          "모집을 마감했습니다.",
                        )
                      }
                      className={`${FOCUS_RING_CLASS_NAME} ${MIN_TOUCH_TARGET_CLASS_NAME} text-[13px] text-[#6B6863] underline`}
                    >
                      마감하기
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() =>
                      runAction(
                        () => onDeletePost(post.id),
                        "동행글을 삭제했습니다.",
                      )
                    }
                    className={`${FOCUS_RING_CLASS_NAME} ${MIN_TOUCH_TARGET_CLASS_NAME} text-[13px] text-[#D0342C] underline`}
                  >
                    삭제하기
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-[18px] font-semibold text-[#2B2A28]">
          들어온 참가 요청
        </h3>
        {receivedApplications.length === 0 ? (
          <EmptyState
            reason="아직 들어온 참가 요청이 없어요."
            guidance="동행글이 노출되면 참가 요청이 이곳에 표시됩니다."
            action={{ label: "동행 찾기로 이동", href: "/mates" }}
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {receivedApplications.map((application) => (
              <li
                key={application.id}
                className="rounded-[16px] border border-[#E4E1DC] p-4"
              >
                <p className="text-[14px] text-[#6B6863]">
                  {application.postTitle}
                </p>
                <p className="mt-1 text-[16px] text-[#2B2A28]">
                  {application.message}
                </p>
                <p className="mt-1 text-[13px] text-[#6B6863]">
                  상태:{" "}
                  {application.status === "PENDING"
                    ? "대기중"
                    : application.status === "ACCEPTED"
                      ? "승인됨"
                      : "거절됨"}
                </p>
                {application.status === "PENDING" ? (
                  <div className="mt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        runAction(
                          () =>
                            onUpdateApplicationStatus(
                              application.id,
                              "ACCEPTED",
                            ),
                          "참가 요청을 승인했습니다.",
                        )
                      }
                      className={`${FOCUS_RING_CLASS_NAME} ${MIN_TOUCH_TARGET_CLASS_NAME} text-[13px] font-semibold text-[#1E8A5F] underline`}
                    >
                      승인
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        runAction(
                          () =>
                            onUpdateApplicationStatus(
                              application.id,
                              "REJECTED",
                            ),
                          "참가 요청을 거절했습니다.",
                        )
                      }
                      className={`${FOCUS_RING_CLASS_NAME} ${MIN_TOUCH_TARGET_CLASS_NAME} text-[13px] text-[#D0342C] underline`}
                    >
                      거절
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-[18px] font-semibold text-[#2B2A28]">
          내가 보낸 참가 요청
        </h3>
        {myApplications.length === 0 ? (
          <EmptyState
            reason="아직 보낸 참가 요청이 없어요."
            guidance="동행 찾기에서 관심 있는 동행글에 참가 요청을 보내보세요."
            action={{ label: "동행 찾기로 이동", href: "/mates" }}
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {myApplications.map((application) => (
              <li
                key={application.id}
                className="rounded-[16px] border border-[#E4E1DC] p-4 text-[14px] text-[#2B2A28]"
              >
                {application.postTitle} ·{" "}
                {application.status === "PENDING"
                  ? "대기중"
                  : application.status === "ACCEPTED"
                    ? "승인됨"
                    : "거절됨"}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-[18px] font-semibold text-[#2B2A28]">
          내가 접수한 신고
        </h3>
        {myReports.length === 0 ? (
          <EmptyState
            reason="접수한 신고 내역이 없어요."
            guidance="불편한 상황이 있었다면 동행글·사용자 상세에서 신고할 수 있습니다."
            action={{ label: "동행 찾기로 이동", href: "/mates" }}
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {myReports.map((report) => (
              <li
                key={report.id}
                className="rounded-[16px] border border-[#E4E1DC] p-4 text-[14px] text-[#2B2A28]"
              >
                접수번호 {report.id} · 상태:{" "}
                {report.status === "OPEN"
                  ? "접수됨"
                  : report.status === "REVIEWING"
                    ? "검토중"
                    : report.status === "RESOLVED"
                      ? "처리완료"
                      : "기각됨"}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-[18px] font-semibold text-[#2B2A28]">
          차단한 사용자
        </h3>
        {blockedUsers.length === 0 ? (
          <EmptyState
            reason="차단한 사용자가 없어요."
            guidance="불편한 상대가 있다면 동행글 상세에서 차단할 수 있습니다."
            action={{ label: "동행 찾기로 이동", href: "/mates" }}
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {blockedUsers.map((blockedUser) => (
              <li
                key={blockedUser.id}
                className="flex items-center justify-between rounded-[16px] border border-[#E4E1DC] p-4"
              >
                <span className="text-[14px] text-[#2B2A28]">
                  {blockedUser.nickname}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    runAction(
                      () => onUnblock(blockedUser.id),
                      "차단을 해제했습니다.",
                    )
                  }
                  className={`${FOCUS_RING_CLASS_NAME} ${MIN_TOUCH_TARGET_CLASS_NAME} text-[13px] text-[#1F4B8F] underline`}
                >
                  차단 해제
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
