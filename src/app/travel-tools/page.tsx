import {
  detectContactInfo,
  MateWriteTab,
  type MateWriteFormInput,
  type MateWriteSubmitResult,
} from "@/components/scr-003/MateWriteTab";
import { FlightTab } from "@/components/scr-003/FlightTab";
import { HotelTab } from "@/components/scr-003/HotelTab";
import { Footer } from "@/components/shared/Footer";
import { Header } from "@/components/shared/Header";
import { createServerSupabaseClient, getServerUser } from "@/lib/auth";
import { getAppSetting } from "@/lib/db/admin";
import { createMatePost } from "@/lib/db/mates";
import { getScreenMetadata } from "@/lib/seo";

export const metadata = getScreenMetadata("/travel-tools");

async function resolveOutboundUrl(
  key: "flight_outbound_url" | "hotel_outbound_url",
  envValue: string | undefined,
): Promise<string | null> {
  try {
    const setting = await getAppSetting(key);
    if (setting) {
      return setting.value;
    }
  } catch {
    // app_settings 조회 실패 시 환경변수로 대체한다.
  }
  return envValue ?? null;
}

/**
 * 동행글 작성 Server Action. Client Component(`MateWriteTab`)는 `db/mates.ts`를
 * 직접 호출할 수 없어(서버 전용 `cookies()` 사용) 이 Server Action을 prop으로 받는다.
 */
async function createMatePostAction(
  input: MateWriteFormInput,
): Promise<MateWriteSubmitResult> {
  "use server";

  if (detectContactInfo(input.title) || detectContactInfo(input.description)) {
    return {
      ok: false,
      error: "전화번호·이메일·메신저 ID로 보이는 정보는 저장할 수 없습니다.",
    };
  }

  const user = await getServerUser();
  if (!user) {
    return { ok: false, error: "로그인이 필요합니다." };
  }

  try {
    const post = await createMatePost(user.id, input);
    return { ok: true, postId: post.id };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "등록에 실패했습니다.",
    };
  }
}

async function getMateWriteUser(): Promise<{
  id: string;
  isAdult: boolean;
} | null> {
  const user = await getServerUser();
  if (!user) {
    return null;
  }
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("profiles")
    .select("is_adult")
    .eq("id", user.id)
    .maybeSingle();
  return { id: user.id, isAdult: Boolean(data?.is_adult) };
}

/**
 * 탭 전환은 순수 CSS(라디오 입력 + 형제 선택자)로 구현했다. Page Owner는 새
 * Client Wrapper Component를 만들 수 없어(CLAUDE.md 규칙 9) 세 탭을 항상 함께
 * 마운트하고 CSS로만 노출을 전환한다 — 탭을 바꿔도 각 탭(FlightTab/HotelTab/
 * MateWriteTab)의 React 상태가 유지된다(Functional AC "탭 전환 시 입력 보존").
 * 다만 `role="tab"`의 JS 기반 `aria-selected`/roving tabindex(`SHR-A11Y-FOCUS`의
 * `getTabAriaProps`)는 적용하지 못했다 — 정확한 ARIA Tab 패턴이 필요하면 별도
 * Client Wrapper Component Task가 필요하다.
 */
const TAB_STYLES = `
  .tt-radio { position: absolute; opacity: 0; width: 1px; height: 1px; }
  .tt-panel { display: none; margin-top: 24px; }
  .tt-tab { cursor: pointer; display: inline-block; padding: 12px 16px; font-size: 16px; font-weight: 600; color: #6B6863; border-bottom: 2px solid transparent; }
  #tab-flight:checked ~ .tt-tabbar label[for="tab-flight"],
  #tab-hotel:checked ~ .tt-tabbar label[for="tab-hotel"],
  #tab-mate:checked ~ .tt-tabbar label[for="tab-mate"] { color: #F0653C; border-bottom-color: #F0653C; }
  #tab-flight:checked ~ #panel-flight,
  #tab-hotel:checked ~ #panel-hotel,
  #tab-mate:checked ~ #panel-mate { display: block; }
`;

export default async function TravelToolsPage() {
  const [flightUrl, hotelUrl, mateWriteUser] = await Promise.all([
    resolveOutboundUrl("flight_outbound_url", process.env.FLIGHT_OUTBOUND_URL),
    resolveOutboundUrl("hotel_outbound_url", process.env.HOTEL_OUTBOUND_URL),
    getMateWriteUser(),
  ]);

  return (
    <>
      <Header />
      <main className="mx-auto flex max-w-[1280px] flex-col gap-8 px-4 py-16 md:px-8">
        <style>{TAB_STYLES}</style>

        <section>
          <h1 className="text-[32px] font-bold text-[#2B2A28]">여행 준비</h1>
          <p className="mt-2 text-[16px] leading-[1.6] text-[#2B2A28]">
            국가·지역·날짜를 정리해 항공편·숙소 외부 사이트로 이동하거나, 동행을
            구하는 글을 작성해 보세요. 입력한 여행 조건은 이 화면을 벗어나면
            저장되지 않습니다.
          </p>
        </section>

        <div>
          <input
            type="radio"
            name="travel-tools-tab"
            id="tab-flight"
            defaultChecked
            className="tt-radio"
          />
          <input
            type="radio"
            name="travel-tools-tab"
            id="tab-hotel"
            className="tt-radio"
          />
          <input
            type="radio"
            name="travel-tools-tab"
            id="tab-mate"
            className="tt-radio"
          />

          <div className="tt-tabbar flex gap-2 border-b border-[#E4E1DC]">
            <label htmlFor="tab-flight" className="tt-tab">
              항공편
            </label>
            <label htmlFor="tab-hotel" className="tt-tab">
              숙소
            </label>
            <label htmlFor="tab-mate" className="tt-tab">
              동행 구하기
            </label>
          </div>

          <div id="panel-flight" className="tt-panel">
            <FlightTab outboundUrl={flightUrl} />
          </div>
          <div id="panel-hotel" className="tt-panel">
            <HotelTab outboundUrl={hotelUrl} />
          </div>
          <div id="panel-mate" className="tt-panel">
            <MateWriteTab
              user={mateWriteUser}
              onSubmit={createMatePostAction}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
