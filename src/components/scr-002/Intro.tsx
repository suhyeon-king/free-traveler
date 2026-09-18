import {
  REPRESENTATIVE_INTRO,
  REPRESENTATIVE_PHILOSOPHY,
} from "@/data/representative";

/**
 * SCR-002 ③ 소개 문단(2~4개, REQ-FUNC-058). `src/data/representative.ts`가
 * 제공하는 소개문·철학 두 문단을 자연스러운 한국어 완성 문장 그대로 표시한다.
 */
export function Intro() {
  return (
    <section className="flex flex-col gap-6 px-4">
      <p className="text-[16px] leading-[1.6] text-[#2B2A28]">
        {REPRESENTATIVE_INTRO}
      </p>
      <p className="text-[16px] leading-[1.6] text-[#2B2A28]">
        {REPRESENTATIVE_PHILOSOPHY}
      </p>
    </section>
  );
}
