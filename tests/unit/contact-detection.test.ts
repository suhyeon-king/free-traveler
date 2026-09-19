import { describe, expect, it } from "vitest";

import { detectContactInfo } from "@/components/scr-003/MateWriteTab";

/**
 * 연락처 패턴 탐지 단위 테스트 (REQ-FUNC-032, TASK-UNIT-CONTACT-DETECTION).
 *
 * `detectContactInfo()`(`src/components/scr-003/MateWriteTab.tsx`)는 전화번호·
 * 이메일·메신저 ID로 보이는 패턴을 정규식으로 탐지한다. Functional AC가 요구하는
 * 기준(탐지율 95% 이상, 오탐 5% 이하)은 개별 문자열 하나하나가 아니라 아래
 * 테스트셋 전체에 대한 비율로 검증한다 — 정규식 기반 탐지는 모든 표현을 완벽하게
 * 잡아낼 수 없으므로(예: "카톡 아이디는 나중에 알려드릴게요"처럼 키워드와 ID
 * 사이에 다른 말이 끼는 경우), 개별 케이스 단위 단언 대신 집계 비율로 판단한다.
 */

const POSITIVE_CASES = [
  // 전화번호
  "010-1234-5678",
  "01012345678",
  "010.1234.5678",
  "010 1234 5678",
  "제 번호는 010-9876-5432입니다",
  "연락 주세요 010 5555 1234",
  "011-123-4567",
  "016-1234-5678",
  "+82 10-1234-5678",
  // 카카오톡
  "카카오톡 travelmate",
  "카카오 톡 abc123",
  "카톡: mytalk01",
  "카톡-mytalk02",
  "kakaotalk hello123",
  "kakao talk: hi_there",
  // 인스타그램
  "인스타 travel_kr",
  "인스타그램 travelmate1",
  "instagram: traveler99",
  "인스타그램: my.travel.diary",
  // 텔레그램
  "텔레그램 tguser01",
  "telegram: tguser02",
  // 위챗
  "위챗 wxid123",
  "wechat: wxid456",
  // 라인
  "라인 id line_user1",
  "line id: lineuser2",
  "라인id my_line_id",
  // 이메일
  "test@example.com",
  "제 이메일은 hello.world@gmail.com 입니다",
  "연락처: abc_123@naver.co.kr",
  "메일 주소는 traveler.kim@daum.net 입니다",
];

const NEGATIVE_CASES = [
  "같이 여행 가실 분 구합니다",
  "인원 3명, 3박 4일 여행입니다",
  "숙소는 게스트하우스로 예약할 예정입니다",
  "관심 있으신 분은 신청 눌러주세요",
  "일정은 2024년 1월 1일부터입니다",
  "저는 인스타 감성 사진 찍는 걸 좋아해요",
  "카페에서 만나서 이야기해요",
  "예산은 1인당 50만원 정도 생각합니다",
  "동행 안전수칙을 꼭 지켜주세요",
  "번호가 아니라 그냥 이야기입니다 12345",
  "가격은 1234원입니다",
  "이 여행지는 별점 4.5점입니다",
  "카톡 아이디는 나중에 앱 안에서 알려드릴게요",
  "우리 숙소 체크인은 오후 3시입니다",
  "같이 사진 찍을 사람 구해요",
];

const MIN_DETECTION_RATE = 0.95;
const MAX_FALSE_POSITIVE_RATE = 0.05;

describe("detectContactInfo", () => {
  it(`연락처로 보이는 문자열 테스트셋(${POSITIVE_CASES.length}개)의 탐지율이 ${MIN_DETECTION_RATE * 100}% 이상이다`, () => {
    const hits = POSITIVE_CASES.filter((text) => detectContactInfo(text));
    const rate = hits.length / POSITIVE_CASES.length;
    const missed = POSITIVE_CASES.filter((text) => !detectContactInfo(text));

    expect(rate, `탐지 실패: ${JSON.stringify(missed)}`).toBeGreaterThanOrEqual(
      MIN_DETECTION_RATE,
    );
  });

  it(`연락처가 아닌 일반 문자열 테스트셋(${NEGATIVE_CASES.length}개)의 오탐율이 ${MAX_FALSE_POSITIVE_RATE * 100}% 이하다`, () => {
    const falsePositives = NEGATIVE_CASES.filter((text) =>
      detectContactInfo(text),
    );
    const rate = falsePositives.length / NEGATIVE_CASES.length;

    expect(
      rate,
      `오탐 발생: ${JSON.stringify(falsePositives)}`,
    ).toBeLessThanOrEqual(MAX_FALSE_POSITIVE_RATE);
  });

  it("대표적인 전화번호 형식을 탐지한다", () => {
    expect(detectContactInfo("010-1234-5678")).toBe(true);
    expect(detectContactInfo("연락처는 01012345678 입니다")).toBe(true);
  });

  it("대표적인 이메일 형식을 탐지한다", () => {
    expect(detectContactInfo("문의: hello@example.com")).toBe(true);
  });

  it("대표적인 메신저 ID 표현을 탐지한다", () => {
    expect(detectContactInfo("카카오톡: travelbuddy")).toBe(true);
    expect(detectContactInfo("instagram: my_travel_log")).toBe(true);
  });

  it("연락처 정보가 없는 일반적인 동행글 설명에는 반응하지 않는다", () => {
    expect(
      detectContactInfo(
        "함께 서울 3박 4일 여행하실 분 구합니다. 일정은 유동적으로 조율 가능합니다.",
      ),
    ).toBe(false);
  });
});
