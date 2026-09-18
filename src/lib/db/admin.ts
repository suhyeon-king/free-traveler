import { createServerSupabaseClient } from "@/lib/auth";
import { validateOutboundUrl } from "@/lib/outbound-link";

/**
 * 관리자 설정(`app_settings`) 데이터 접근 계층 (REQ-FUNC-077).
 *
 * 항공·숙소 외부 URL을 HTTPS 허용목록으로만 저장한다. DB CHECK 제약
 * (`value ~ '^https://'`)에 더해, 저장 전에도 `validateOutboundUrl`로 검증해
 * 잘못된 값을 조기에 거른다. 쓰기는 Admin/Moderator만 RLS로 허용된다.
 */

export type AppSettingKey = "flight_outbound_url" | "hotel_outbound_url";

export interface AppSetting {
  key: AppSettingKey;
  value: string;
  updatedAt: string;
  updatedBy: string | null;
}

const APP_SETTING_COLUMNS = "key, value, updated_at, updated_by";

function toAppSetting(row: Record<string, unknown>): AppSetting {
  return {
    key: row.key as AppSettingKey,
    value: row.value as string,
    updatedAt: row.updated_at as string,
    updatedBy: (row.updated_by as string | null) ?? null,
  };
}

/** 비로그인 사용자도 조회할 수 있다(SELECT는 공개 정책, REQ-FUNC-016/024가 이 값을 사용). */
export async function getAppSetting(
  key: AppSettingKey,
): Promise<AppSetting | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("app_settings")
    .select(APP_SETTING_COLUMNS)
    .eq("key", key)
    .maybeSingle();
  if (error) {
    throw error;
  }
  return data ? toAppSetting(data) : null;
}

export async function listAppSettings(): Promise<AppSetting[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("app_settings")
    .select(APP_SETTING_COLUMNS);
  if (error) {
    throw error;
  }
  return (data ?? []).map(toAppSetting);
}

/** HTTPS 허용목록 검증 후 저장한다. 검증에 실패하면 DB에 쓰지 않고 예외를 던진다. */
export async function setAppSetting(
  key: AppSettingKey,
  value: string,
  updatedBy: string,
): Promise<AppSetting> {
  const validation = validateOutboundUrl(value);
  if (!validation.ok) {
    throw new Error(
      `허용되지 않은 URL입니다(${validation.reason}). HTTPS URL만 저장할 수 있습니다.`,
    );
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("app_settings")
    .upsert({ key, value: validation.url, updated_by: updatedBy })
    .select(APP_SETTING_COLUMNS)
    .single();
  if (error) {
    throw error;
  }
  return toAppSetting(data);
}
