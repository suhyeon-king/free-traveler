import { describe, expect, it } from "vitest";

import {
  validateFlightDates,
  type FlightFormState,
} from "@/components/scr-003/FlightTab";
import {
  validateHotelDates,
  type HotelFormState,
} from "@/components/scr-003/HotelTab";

/**
 * 날짜 검증 단위 테스트 (REQ-FUNC-013/021, TASK-UNIT-TRAVEL-DATES).
 *
 * **필요한 최소 리팩토링(이 Task Expected File 밖)**: 항공/숙소 조건 폼의 날짜
 * 검증 로직(`validate()`)이 각 Component 함수 내부의 클로저였고 React 상태에
 * 의존해 외부에서 직접 import·검증할 수 없었다. `UNIT-MATE-STATE`에서 이미
 * 사람에게 확인받은 동일한 패턴(private 로직을 동작 변경 없이 순수 함수로
 * 추출해 export)을 그대로 적용해, `FlightTab.tsx`/`HotelTab.tsx`(각각
 * `CMP-SCR003-FLIGHT-FORM`/`CMP-SCR003-HOTEL-FORM`의 Expected Files, 이미
 * DONE)에 `validateFlightDates()`/`validateHotelDates()`를 추출·export하고
 * 각 Component의 `validate()`가 그것을 호출하도록 바꿨다.
 */

const TODAY = "2026-06-15";
const YESTERDAY = "2026-06-14";
const TOMORROW = "2026-06-16";

const BASE_FLIGHT: FlightFormState = {
  country: "일본",
  region: "도쿄",
  departureDate: TODAY,
  returnDate: TODAY,
};

const BASE_HOTEL: HotelFormState = {
  country: "일본",
  region: "도쿄",
  checkInDate: TODAY,
  checkOutDate: TOMORROW,
};

describe("validateFlightDates(REQ-FUNC-013)", () => {
  it("모든 필드가 채워져 있고 출발일이 오늘이며 귀국일이 출발일과 같으면 통과한다", () => {
    expect(validateFlightDates(BASE_FLIGHT, TODAY)).toBeNull();
  });

  it("출발일이 오늘 이후(내일)이고 귀국일이 그 이후면 통과한다", () => {
    expect(
      validateFlightDates(
        { ...BASE_FLIGHT, departureDate: TOMORROW, returnDate: TOMORROW },
        TODAY,
      ),
    ).toBeNull();
  });

  it("과거 출발일은 차단한다", () => {
    expect(
      validateFlightDates(
        { ...BASE_FLIGHT, departureDate: YESTERDAY, returnDate: TODAY },
        TODAY,
      ),
    ).not.toBeNull();
  });

  it("귀국일이 출발일보다 이전이면 차단한다", () => {
    expect(
      validateFlightDates(
        { ...BASE_FLIGHT, departureDate: TOMORROW, returnDate: TODAY },
        TODAY,
      ),
    ).not.toBeNull();
  });

  it.each(["country", "region", "departureDate", "returnDate"] as const)(
    "%s가 비어 있으면 차단한다",
    (field) => {
      expect(
        validateFlightDates({ ...BASE_FLIGHT, [field]: "" }, TODAY),
      ).not.toBeNull();
    },
  );
});

describe("validateHotelDates(REQ-FUNC-021)", () => {
  it("모든 필드가 채워져 있고 체크인이 오늘, 체크아웃이 그 이후면 통과한다", () => {
    expect(validateHotelDates(BASE_HOTEL, TODAY)).toBeNull();
  });

  it("과거 체크인은 차단한다", () => {
    expect(
      validateHotelDates(
        { ...BASE_HOTEL, checkInDate: YESTERDAY, checkOutDate: TODAY },
        TODAY,
      ),
    ).not.toBeNull();
  });

  it("체크아웃이 체크인과 같으면 차단한다(체크아웃 > 체크인 요구)", () => {
    expect(
      validateHotelDates(
        { ...BASE_HOTEL, checkInDate: TODAY, checkOutDate: TODAY },
        TODAY,
      ),
    ).not.toBeNull();
  });

  it("체크아웃이 체크인보다 이전이면 차단한다", () => {
    expect(
      validateHotelDates(
        { ...BASE_HOTEL, checkInDate: TOMORROW, checkOutDate: TODAY },
        TODAY,
      ),
    ).not.toBeNull();
  });

  it.each(["country", "region", "checkInDate", "checkOutDate"] as const)(
    "%s가 비어 있으면 차단한다",
    (field) => {
      expect(
        validateHotelDates({ ...BASE_HOTEL, [field]: "" }, TODAY),
      ).not.toBeNull();
    },
  );
});
