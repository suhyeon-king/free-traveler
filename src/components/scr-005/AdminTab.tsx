"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";

import { EmptyState } from "@/components/shared/EmptyState";
import { FOCUS_RING_CLASS_NAME, MIN_TOUCH_TARGET_CLASS_NAME } from "@/lib/a11y";
import type { Report, ReportStatus } from "@/lib/db/reports";

export type AdminActionResult = { ok: true } | { ok: false; error: string };

const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  OPEN: "접수됨",
  REVIEWING: "검토중",
  RESOLVED: "처리완료",
  DISMISSED: "기각됨",
};

const REPORT_STATUS_OPTIONS: ReportStatus[] = [
  "OPEN",
  "REVIEWING",
  "RESOLVED",
  "DISMISSED",
];

interface AdminTabProps {
  isAdmin: boolean;
  reports: Report[];
  activeStatusFilter: ReportStatus | null;
  flightOutboundUrl: string;
  hotelOutboundUrl: string;
  onUpdateReportStatus: (
    reportId: string,
    status: ReportStatus,
  ) => Promise<AdminActionResult>;
  onSaveOutboundUrls: (input: {
    flightOutboundUrl: string;
    hotelOutboundUrl: string;
  }) => Promise<AdminActionResult>;
}

/**
 * SCR-005 관리자 전용 탭(REQ-FUNC-041/042/077 간소화). Admin이 아니면 아무것도
 * 렌더링하지 않는다 — 실제 접근 제어는 RLS(`reports_update_admin_only` 등)가
 * 서버에서 이중으로 강제한다. 콘텐츠 CMS·감사 로그는 포함하지 않는다(EXCLUDED).
 */
export function AdminTab({
  isAdmin,
  reports,
  activeStatusFilter,
  flightOutboundUrl,
  hotelOutboundUrl,
  onUpdateReportStatus,
  onSaveOutboundUrls,
}: AdminTabProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [reportError, setReportError] = useState<string | null>(null);
  const [flightUrl, setFlightUrl] = useState(flightOutboundUrl);
  const [hotelUrl, setHotelUrl] = useState(hotelOutboundUrl);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isAdmin) {
    return null;
  }

  function handleFilterChange(status: ReportStatus | "ALL") {
    const params = new URLSearchParams(searchParams.toString());
    if (status === "ALL") {
      params.delete("reportStatus");
    } else {
      params.set("reportStatus", status);
    }
    router.push(`/account?${params.toString()}`);
  }

  async function handleStatusChange(reportId: string, status: ReportStatus) {
    setReportError(null);
    const result = await onUpdateReportStatus(reportId, status);
    if (!result.ok) {
      setReportError(result.error);
    }
  }

  async function handleSettingsSubmit(event: FormEvent) {
    event.preventDefault();
    setSettingsError(null);
    setSettingsMessage(null);
    setIsSaving(true);
    const result = await onSaveOutboundUrls({
      flightOutboundUrl: flightUrl,
      hotelOutboundUrl: hotelUrl,
    });
    setIsSaving(false);
    if (result.ok) {
      setSettingsMessage("외부 URL 설정을 저장했습니다.");
    } else {
      setSettingsError(result.error);
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h3 className="mb-3 text-[18px] font-semibold text-[#2B2A28]">
          신고 큐
        </h3>
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleFilterChange("ALL")}
            className={`${FOCUS_RING_CLASS_NAME} rounded-[999px] border px-4 py-2 text-[13px] font-semibold ${
              activeStatusFilter === null
                ? "border-[#F0653C] text-[#F0653C]"
                : "border-[#E4E1DC] text-[#6B6863]"
            }`}
          >
            전체
          </button>
          {REPORT_STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => handleFilterChange(status)}
              className={`${FOCUS_RING_CLASS_NAME} rounded-[999px] border px-4 py-2 text-[13px] font-semibold ${
                activeStatusFilter === status
                  ? "border-[#F0653C] text-[#F0653C]"
                  : "border-[#E4E1DC] text-[#6B6863]"
              }`}
            >
              {REPORT_STATUS_LABEL[status]}
            </button>
          ))}
        </div>

        {reportError ? (
          <p
            role="alert"
            className="mb-3 text-[14px] font-semibold text-[#D0342C]"
          >
            {reportError}
          </p>
        ) : null}

        {reports.length === 0 ? (
          <EmptyState
            reason="조건에 맞는 신고가 없어요."
            guidance="필터를 바꿔 다른 상태의 신고를 확인해 보세요."
            action={{
              label: "전체 신고 보기",
              onClick: () => handleFilterChange("ALL"),
            }}
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {reports.map((report) => (
              <li
                key={report.id}
                className="rounded-[16px] border border-[#E4E1DC] p-4"
              >
                <p className="text-[13px] text-[#6B6863]">
                  접수번호 {report.id} · {report.targetType}
                </p>
                <p className="mt-1 text-[15px] text-[#2B2A28]">
                  {report.reason}
                </p>
                <label className="mt-2 flex items-center gap-2 text-[13px] text-[#6B6863]">
                  상태
                  <select
                    value={report.status}
                    onChange={(event) =>
                      handleStatusChange(
                        report.id,
                        event.target.value as ReportStatus,
                      )
                    }
                    className={`${FOCUS_RING_CLASS_NAME} h-10 rounded-[10px] border border-[#E4E1DC] px-2 text-[14px] text-[#2B2A28]`}
                  >
                    {REPORT_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {REPORT_STATUS_LABEL[status]}
                      </option>
                    ))}
                  </select>
                </label>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-[18px] font-semibold text-[#2B2A28]">
          항공·숙소 외부 URL 설정
        </h3>
        <form onSubmit={handleSettingsSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-[13px] text-[#6B6863]">
            항공권 외부 URL(HTTPS만 허용)
            <input
              type="url"
              value={flightUrl}
              onChange={(event) => setFlightUrl(event.target.value)}
              required
              placeholder="https://"
              className={`${FOCUS_RING_CLASS_NAME} h-12 rounded-[10px] border border-[#E4E1DC] px-3 text-[16px] text-[#2B2A28]`}
            />
          </label>
          <label className="flex flex-col gap-1 text-[13px] text-[#6B6863]">
            숙소 외부 URL(HTTPS만 허용)
            <input
              type="url"
              value={hotelUrl}
              onChange={(event) => setHotelUrl(event.target.value)}
              required
              placeholder="https://"
              className={`${FOCUS_RING_CLASS_NAME} h-12 rounded-[10px] border border-[#E4E1DC] px-3 text-[16px] text-[#2B2A28]`}
            />
          </label>

          {settingsError ? (
            <p
              role="alert"
              className="text-[14px] font-semibold text-[#D0342C]"
            >
              {settingsError}
            </p>
          ) : null}
          {settingsMessage ? (
            <p role="status" className="text-[14px] text-[#1E8A5F]">
              {settingsMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSaving}
            className={`${FOCUS_RING_CLASS_NAME} ${MIN_TOUCH_TARGET_CLASS_NAME} w-fit rounded-[999px] bg-[#F0653C] px-6 text-[16px] font-semibold text-[#FFFFFF] disabled:cursor-not-allowed disabled:bg-[#FDE3D8]`}
          >
            {isSaving ? "저장 중..." : "설정 저장"}
          </button>
        </form>
      </section>
    </div>
  );
}
