import { createServerSupabaseClient } from "@/lib/auth";

/**
 * 동행 모집글/참가 요청/차단 데이터 접근 계층 (REQ-FUNC-030/033/034/035/036/037/038/040/043).
 *
 * 모든 함수는 요청 스코프의 Server Supabase Client(RLS 적용)로 동작한다.
 * 이메일·연락처는 어떤 select에도 포함하지 않는다(REQ-FUNC-033 — `profiles`/`auth.users`의
 * 이메일 컬럼을 조회하지 않음).
 */

export type MatePostStatus = "RECRUITING" | "CLOSED";
export type GenderPreference = "male" | "female" | "any";
export type MateApplicationStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface MatePost {
  id: string;
  authorId: string;
  country: string;
  region: string | null;
  startDate: string;
  endDate: string;
  headcount: number;
  ageRange: string | null;
  genderPreference: GenderPreference | null;
  travelStyle: string[];
  title: string;
  description: string;
  status: MatePostStatus;
  /** `status`와 `endDate` 경과 여부를 함께 계산한 실질 마감 상태(REQ-FUNC-037, 배치 작업 없음). */
  effectiveStatus: MatePostStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MatePostFilter {
  country?: string;
  region?: string;
  /** 이 기간과 겹치는 모집글만 반환한다. */
  dateFrom?: string;
  dateTo?: string;
  ageRange?: string;
  genderPreference?: GenderPreference;
  travelStyle?: string;
  status?: MatePostStatus;
}

export interface MatePostInput {
  country: string;
  region?: string;
  startDate: string;
  endDate: string;
  headcount: number;
  ageRange?: string;
  genderPreference?: GenderPreference;
  travelStyle: string[];
  title: string;
  description: string;
}

export interface MateApplication {
  id: string;
  postId: string;
  applicantId: string;
  message: string;
  status: MateApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

const MATE_POST_COLUMNS =
  "id, author_id, country, region, start_date, end_date, headcount, age_range, gender_preference, travel_style, title, description, status, created_at, updated_at";

const MATE_APPLICATION_COLUMNS =
  "id, post_id, applicant_id, message, status, created_at, updated_at";

/**
 * `status`(작성자의 수동 마감)와 `endDate` 경과 여부를 함께 계산해 실질 마감
 * 상태를 정한다(REQ-FUNC-037, 배치 작업 없이 조회 시점에 계산). `endDate`가
 * 오늘(자정 기준)보다 이전이면 `status`와 무관하게 `CLOSED`로 본다.
 */
export function computeEffectiveMatePostStatus(
  status: MatePostStatus,
  endDate: string,
): MatePostStatus {
  const isPastEndDate = new Date(endDate) < new Date(new Date().toDateString());
  return status === "CLOSED" || isPastEndDate ? "CLOSED" : "RECRUITING";
}

function toMatePost(row: Record<string, unknown>): MatePost {
  const endDate = row.end_date as string;
  const status = row.status as MatePostStatus;

  return {
    id: row.id as string,
    authorId: row.author_id as string,
    country: row.country as string,
    region: (row.region as string | null) ?? null,
    startDate: row.start_date as string,
    endDate,
    headcount: row.headcount as number,
    ageRange: (row.age_range as string | null) ?? null,
    genderPreference:
      (row.gender_preference as GenderPreference | null) ?? null,
    travelStyle: (row.travel_style as string[]) ?? [],
    title: row.title as string,
    description: row.description as string,
    status,
    effectiveStatus: computeEffectiveMatePostStatus(status, endDate),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function toMateApplication(row: Record<string, unknown>): MateApplication {
  return {
    id: row.id as string,
    postId: row.post_id as string,
    applicantId: row.applicant_id as string,
    message: row.message as string,
    status: row.status as MateApplicationStatus,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/** 필터 조합(국가·지역·기간 겹침·연령대·성별·스타일·상태)으로 모집글 목록을 조회한다. 차단 사용자 글 제외는 RLS가 처리한다. */
export async function listMatePosts(
  filter: MatePostFilter = {},
): Promise<MatePost[]> {
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("mate_posts")
    .select(MATE_POST_COLUMNS)
    .order("created_at", { ascending: false });

  if (filter.country) {
    query = query.eq("country", filter.country);
  }
  if (filter.region) {
    query = query.eq("region", filter.region);
  }
  if (filter.dateFrom) {
    query = query.gte("end_date", filter.dateFrom);
  }
  if (filter.dateTo) {
    query = query.lte("start_date", filter.dateTo);
  }
  if (filter.ageRange) {
    query = query.eq("age_range", filter.ageRange);
  }
  if (filter.genderPreference) {
    query = query.eq("gender_preference", filter.genderPreference);
  }
  if (filter.travelStyle) {
    query = query.contains("travel_style", [filter.travelStyle]);
  }
  if (filter.status) {
    query = query.eq("status", filter.status);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }
  return (data ?? []).map(toMatePost);
}

export async function getMatePostById(id: string): Promise<MatePost | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("mate_posts")
    .select(MATE_POST_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) {
    throw error;
  }
  return data ? toMatePost(data) : null;
}

export async function createMatePost(
  authorId: string,
  input: MatePostInput,
): Promise<MatePost> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("mate_posts")
    .insert({
      author_id: authorId,
      country: input.country,
      region: input.region ?? null,
      start_date: input.startDate,
      end_date: input.endDate,
      headcount: input.headcount,
      age_range: input.ageRange ?? null,
      gender_preference: input.genderPreference ?? null,
      travel_style: input.travelStyle,
      title: input.title,
      description: input.description,
    })
    .select(MATE_POST_COLUMNS)
    .single();
  if (error) {
    throw error;
  }
  return toMatePost(data);
}

/** 작성자의 수동 마감·수정. 승인된 참가자가 있으면 호출자가 경고를 띄울 수 있도록 별도로 `hasAcceptedApplicants`를 먼저 확인한다(REQ-FUNC-038). */
export async function updateMatePost(
  id: string,
  patch: Partial<MatePostInput & { status: MatePostStatus }>,
): Promise<MatePost> {
  const supabase = await createServerSupabaseClient();
  const updatePayload: Record<string, unknown> = {};
  if (patch.country !== undefined) updatePayload.country = patch.country;
  if (patch.region !== undefined) updatePayload.region = patch.region;
  if (patch.startDate !== undefined) updatePayload.start_date = patch.startDate;
  if (patch.endDate !== undefined) updatePayload.end_date = patch.endDate;
  if (patch.headcount !== undefined) updatePayload.headcount = patch.headcount;
  if (patch.ageRange !== undefined) updatePayload.age_range = patch.ageRange;
  if (patch.genderPreference !== undefined)
    updatePayload.gender_preference = patch.genderPreference;
  if (patch.travelStyle !== undefined)
    updatePayload.travel_style = patch.travelStyle;
  if (patch.title !== undefined) updatePayload.title = patch.title;
  if (patch.description !== undefined)
    updatePayload.description = patch.description;
  if (patch.status !== undefined) updatePayload.status = patch.status;

  const { data, error } = await supabase
    .from("mate_posts")
    .update(updatePayload)
    .eq("id", id)
    .select(MATE_POST_COLUMNS)
    .single();
  if (error) {
    throw error;
  }
  return toMatePost(data);
}

export async function deleteMatePost(id: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("mate_posts").delete().eq("id", id);
  if (error) {
    throw error;
  }
}

/** 승인(ACCEPTED)된 참가 요청이 있는지 확인한다 — 수정·마감 전 경고 표시용(REQ-FUNC-038). */
export async function hasAcceptedApplicants(postId: string): Promise<boolean> {
  const supabase = await createServerSupabaseClient();
  const { count, error } = await supabase
    .from("mate_applications")
    .select("id", { count: "exact", head: true })
    .eq("post_id", postId)
    .eq("status", "ACCEPTED");
  if (error) {
    throw error;
  }
  return (count ?? 0) > 0;
}

/** 500자 이내 참가 메시지로 참가 요청을 생성한다(REQ-FUNC-034). 중복 방지는 DB unique 제약이 처리한다(REQ-FUNC-035). */
export async function createMateApplication(
  applicantId: string,
  postId: string,
  message: string,
): Promise<MateApplication> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("mate_applications")
    .insert({
      post_id: postId,
      applicant_id: applicantId,
      message: message.slice(0, 500),
    })
    .select(MATE_APPLICATION_COLUMNS)
    .single();
  if (error) {
    throw error;
  }
  return toMateApplication(data);
}

/** 글 작성자만 승인/거절할 수 있다(RLS가 강제, REQ-FUNC-036 간소화 — 별도 감사 로그 없음). */
export async function updateMateApplicationStatus(
  applicationId: string,
  status: Exclude<MateApplicationStatus, "PENDING">,
): Promise<MateApplication> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("mate_applications")
    .update({ status })
    .eq("id", applicationId)
    .select(MATE_APPLICATION_COLUMNS)
    .single();
  if (error) {
    throw error;
  }
  return toMateApplication(data);
}

export async function withdrawMateApplication(
  applicationId: string,
): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("mate_applications")
    .delete()
    .eq("id", applicationId);
  if (error) {
    throw error;
  }
}

export async function listApplicationsForPost(
  postId: string,
): Promise<MateApplication[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("mate_applications")
    .select(MATE_APPLICATION_COLUMNS)
    .eq("post_id", postId)
    .order("created_at", { ascending: false });
  if (error) {
    throw error;
  }
  return (data ?? []).map(toMateApplication);
}

export async function listMyApplications(
  applicantId: string,
): Promise<MateApplication[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("mate_applications")
    .select(MATE_APPLICATION_COLUMNS)
    .eq("applicant_id", applicantId)
    .order("created_at", { ascending: false });
  if (error) {
    throw error;
  }
  return (data ?? []).map(toMateApplication);
}

/** 사용자를 차단한다. 차단 시 상호 비노출은 `mate_posts`/`mate_applications` RLS가 처리한다(REQ-FUNC-040). */
export async function blockUser(
  blockerId: string,
  blockedId: string,
): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("user_blocks")
    .insert({ blocker_id: blockerId, blocked_id: blockedId });
  if (error) {
    throw error;
  }
}

export async function unblockUser(
  blockerId: string,
  blockedId: string,
): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("user_blocks")
    .delete()
    .eq("blocker_id", blockerId)
    .eq("blocked_id", blockedId);
  if (error) {
    throw error;
  }
}

export async function listBlockedUsers(blockerId: string): Promise<string[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("user_blocks")
    .select("blocked_id")
    .eq("blocker_id", blockerId);
  if (error) {
    throw error;
  }
  return (data ?? []).map((row) => row.blocked_id as string);
}
