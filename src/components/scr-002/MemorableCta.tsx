import Link from "next/link";

import {
  getRecommendedDestinations,
  getRepresentativeContactLinks,
} from "@/data/representative";
import { FOCUS_RING_CLASS_NAME, MIN_TOUCH_TARGET_CLASS_NAME } from "@/lib/a11y";

const ALLOWED_PROTOCOLS = ["https:", "mailto:"];

/** `javascript:` 등 위험한 프로토콜 링크를 차단한다(Security AC). */
function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url, "https://placeholder.invalid");
    return ALLOWED_PROTOCOLS.includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * SCR-002 ⑦ 기억에 남는 여행지 + CTA 배너(REQ-FUNC-062/063 간소화). 추천
 * 여행지는 `getRecommendedDestinations()`가 이미 비공개/삭제된 ID를 자동 제외한
 * 결과를 그대로 쓴다. 문의·SNS 링크는 값이 없으면 렌더링하지 않으며, 허용된
 * 프로토콜(https/mailto)만 통과시킨다.
 */
export function MemorableCta() {
  const destinations = getRecommendedDestinations();
  const contactLinks = getRepresentativeContactLinks().filter((link) =>
    isSafeUrl(link.url),
  );

  return (
    <section className="flex flex-col gap-8 px-4">
      <div>
        <h2 className="mb-4 text-[24px] font-bold text-[#2B2A28]">
          기억에 남는 여행지
        </h2>
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {destinations.map((destination) => (
            <li key={destination.id} className="list-none">
              <Link
                href={`/?destination=${destination.id}`}
                className={`${FOCUS_RING_CLASS_NAME} block rounded-[16px] border border-[#E4E1DC] p-4`}
              >
                <span className="text-[16px] font-semibold text-[#2B2A28]">
                  {destination.name}
                </span>
                <p className="text-[13px] text-[#6B6863]">
                  {destination.country}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col items-center gap-4 rounded-[16px] bg-[#F7F6F4] px-6 py-12 text-center">
        <p className="text-[16px] text-[#2B2A28]">
          지금 바로 여행을 준비해 보세요.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/travel-tools"
            className={`${FOCUS_RING_CLASS_NAME} ${MIN_TOUCH_TARGET_CLASS_NAME} inline-flex items-center rounded-[999px] bg-[#F0653C] px-6 text-[16px] font-semibold text-[#FFFFFF] active:bg-[#D64F29]`}
          >
            여행 준비 시작하기
          </Link>
          <Link
            href="/mates"
            className={`${FOCUS_RING_CLASS_NAME} ${MIN_TOUCH_TARGET_CLASS_NAME} inline-flex items-center rounded-[999px] border border-[#E4E1DC] px-6 text-[16px] font-semibold text-[#2B2A28]`}
          >
            동행 찾아보기
          </Link>
        </div>
        {contactLinks.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-3 text-[14px] text-[#6B6863]">
            {contactLinks.map((link) => (
              <a
                key={link.label}
                href={link.url}
                className={FOCUS_RING_CLASS_NAME}
              >
                {link.label}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
