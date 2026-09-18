"use client";

import Link from "next/link";
import { useState } from "react";

import { FOCUS_RING_CLASS_NAME } from "@/lib/a11y";

import { Modal } from "./Modal";

type PolicyKey = "terms" | "privacy" | "safety" | "disclaimer";

interface PolicyContent {
  title: string;
  body: string;
}

/**
 * 정책 본문. `design-reference/SCREEN_ROUTE_CONTRACT.json`에 별도 정책 Route가
 * 정의되어 있지 않아(REQ-FUNC-080 콘텐츠는 CMP-SCR003-MATE-WRITE 동의 흐름에서
 * 다룬다) 새 Route를 만들지 않고 Modal로 본문을 보여준다(CLAUDE.md 규칙 5).
 */
const POLICY_CONTENT: Record<PolicyKey, PolicyContent> = {
  terms: {
    title: "이용약관",
    body: "Free Traveler는 여행지 정보 열람과 동행 모집 연결을 제공하는 서비스이며, 항공·호텔 예약을 대행하지 않습니다. 게시된 여행지·안전정보는 참고용이며 출국 전 공식 출처로 재확인해야 합니다.",
  },
  privacy: {
    title: "개인정보처리방침",
    body: "회원 가입 시 이메일과 성인 확인 정보만 수집하며 생년월일 원본은 저장하지 않습니다. 수집한 정보는 동행 서비스 운영 목적 외에는 사용하지 않으며 제3자에게 제공하지 않습니다.",
  },
  safety: {
    title: "동행 안전수칙",
    body: "동행 모집글 작성·참가 전 개인 연락처를 공개하지 않고, 첫 만남은 공개된 장소에서 진행하는 것을 권장합니다. 불편한 상황이 발생하면 신고·차단 기능을 이용해 주세요.",
  },
  disclaimer: {
    title: "콘텐츠 면책",
    body: "여행지·안전정보 콘텐츠는 작성 시점 기준이며 실제 현지 상황과 다를 수 있습니다. 출국 전 반드시 공식 출처의 최신 정보를 직접 확인해야 합니다.",
  },
};

const POLICY_LINKS: { key: PolicyKey; label: string }[] = [
  { key: "terms", label: "이용약관" },
  { key: "privacy", label: "개인정보처리방침" },
  { key: "safety", label: "동행 안전수칙" },
  { key: "disclaimer", label: "콘텐츠 면책" },
];

/**
 * SCR-001~005 5개 화면이 동일하게 재사용하는 전역 Footer(REQ-FUNC-064).
 * Desktop 3열(서비스/회사/정책) → Mobile 1열, 하단 legal band에 저작권 문구와
 * "항공·호텔 정보는 외부 사이트로 연결되며 예약을 대행하지 않습니다" 고지를 포함한다.
 */
export function Footer() {
  const [openPolicy, setOpenPolicy] = useState<PolicyKey | null>(null);
  const linkClassName = `${FOCUS_RING_CLASS_NAME} text-[14px] text-[#6B6863]`;

  return (
    <footer className="border-t border-[#E4E1DC] bg-[#FFFFFF]">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-8 px-4 py-8 md:grid-cols-3 md:px-8">
        <div className="flex flex-col gap-3">
          <h3 className="text-[14px] font-semibold text-[#2B2A28]">서비스</h3>
          <Link href="/travel-tools" className={linkClassName}>
            여행 준비
          </Link>
          <Link href="/mates" className={linkClassName}>
            동행 찾기
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-[14px] font-semibold text-[#2B2A28]">회사</h3>
          <Link href="/about" className={linkClassName}>
            대표 소개
          </Link>
          <Link href="/account" className={linkClassName}>
            계정
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-[14px] font-semibold text-[#2B2A28]">정책</h3>
          {POLICY_LINKS.map((policy) => (
            <button
              key={policy.key}
              type="button"
              onClick={() => setOpenPolicy(policy.key)}
              className={`${linkClassName} text-left`}
            >
              {policy.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-[#E4E1DC] px-4 py-4 text-center md:px-8">
        <p className="text-[13px] text-[#6B6863]">
          항공·호텔 정보는 외부 사이트로 연결되며 예약을 대행하지 않습니다.
        </p>
        <p className="mt-1 text-[13px] text-[#6B6863]">
          © {new Date().getFullYear()} Free Traveler
        </p>
      </div>

      {POLICY_LINKS.map((policy) => (
        <Modal
          key={policy.key}
          isOpen={openPolicy === policy.key}
          onClose={() => setOpenPolicy(null)}
          titleId={`policy-title-${policy.key}`}
        >
          <h2
            id={`policy-title-${policy.key}`}
            className="text-[18px] font-semibold text-[#2B2A28]"
          >
            {POLICY_CONTENT[policy.key].title}
          </h2>
          <p className="mt-4 text-[16px] leading-[1.6] text-[#2B2A28]">
            {POLICY_CONTENT[policy.key].body}
          </p>
        </Modal>
      ))}
    </footer>
  );
}
