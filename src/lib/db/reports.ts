import { createServerSupabaseClient } from "@/lib/auth";

/**
 * 신고 데이터 접근 계층 (REQ-FUNC-039/041/042, REQ-NF-005/019).
 *
 * 신고 상태 변경(처리 완료/기각)만 제공하며, 세분화된 제재 워크플로와 범용
 * 감사 로그는 다루지 않는다(EXCLUDED: REQ-FUNC-056/076). 접근 제어는 RLS
 * (`reports_select_own_or_admin`/`reports_update_admin_only`)가 강제한다.
 */

export type ReportTargetType = "POST" | "USER" | "APPLICATION";
export type ReportStatus = "OPEN" | "REVIEWING" | "RESOLVED" | "DISMISSED";

export interface Report {
  id: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ReportInput {
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
}

const REPORT_COLUMNS =
  "id, reporter_id, target_type, target_id, reason, status, created_at, updated_at";

function toReport(row: Record<string, unknown>): Report {
  return {
    id: row.id as string,
    reporterId: row.reporter_id as string,
    targetType: row.target_type as ReportTargetType,
    targetId: row.target_id as string,
    reason: row.reason as string,
    status: row.status as ReportStatus,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/** 신고를 접수한다. 반환된 `id`를 접수번호로 화면에 표시한다(REQ-FUNC-039). */
export async function createReport(
  reporterId: string,
  input: ReportInput,
): Promise<Report> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("reports")
    .insert({
      reporter_id: reporterId,
      target_type: input.targetType,
      target_id: input.targetId,
      reason: input.reason.slice(0, 1000),
    })
    .select(REPORT_COLUMNS)
    .single();
  if (error) {
    throw error;
  }
  return toReport(data);
}

/** 관리자 탭에서 신고 상태로 필터링해 조회한다(REQ-FUNC-041). RLS가 Admin/Moderator만 전체 목록을 볼 수 있게 강제한다. */
export async function listReports(status?: ReportStatus): Promise<Report[]> {
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("reports")
    .select(REPORT_COLUMNS)
    .order("created_at", { ascending: false });
  if (status) {
    query = query.eq("status", status);
  }
  const { data, error } = await query;
  if (error) {
    throw error;
  }
  return (data ?? []).map(toReport);
}

export async function listMyReports(reporterId: string): Promise<Report[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("reports")
    .select(REPORT_COLUMNS)
    .eq("reporter_id", reporterId)
    .order("created_at", { ascending: false });
  if (error) {
    throw error;
  }
  return (data ?? []).map(toReport);
}

/** 처리 완료/기각 등 상태 변경만 제공한다(REQ-FUNC-042 간소화). Admin/Moderator만 RLS로 허용된다. */
export async function updateReportStatus(
  reportId: string,
  status: ReportStatus,
): Promise<Report> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("reports")
    .update({ status })
    .eq("id", reportId)
    .select(REPORT_COLUMNS)
    .single();
  if (error) {
    throw error;
  }
  return toReport(data);
}
