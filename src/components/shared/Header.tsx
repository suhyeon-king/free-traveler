"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { FOCUS_RING_CLASS_NAME, MIN_TOUCH_TARGET_CLASS_NAME } from "@/lib/a11y";

import { Modal } from "./Modal";

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "메인", href: "/" },
  { label: "여행 준비", href: "/travel-tools" },
  { label: "동행 찾기", href: "/mates" },
  { label: "대표 소개", href: "/about" },
];

interface HeaderProps {
  /** 로그인 사용자 닉네임. 없으면 Guest로 취급해 "로그인" 링크를 보여준다. */
  userNickname?: string;
}

/**
 * SCR-001~005 5개 화면이 동일하게 재사용하는 전역 Header(REQ-FUNC-064).
 * Desktop 72px/Mobile 56px, 좌측 워드마크 + 중앙(Desktop) 내비게이션 + 우측 계정 진입점.
 * Mobile은 로고+햄버거로 축소되고 메뉴는 Modal 시트로 열린다.
 */
export function Header({ userNickname }: HeaderProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinkClassName = (isActive: boolean) =>
    `${FOCUS_RING_CLASS_NAME} text-[16px] font-semibold ${
      isActive ? "text-[#F0653C]" : "text-[#2B2A28]"
    }`;

  const accountLabel = userNickname ?? "로그인";

  return (
    <header className="h-[56px] border-b border-[#E4E1DC] bg-[#FFFFFF] md:h-[72px]">
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-4 md:px-8">
        <Link href="/" className="text-[18px] font-bold text-[#2B2A28]">
          Free Traveler
        </Link>

        <nav
          className="hidden items-center gap-6 md:flex"
          aria-label="주요 내비게이션"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className={navLinkClassName(pathname === item.href)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/account"
          className={`hidden md:inline-flex ${FOCUS_RING_CLASS_NAME} text-[16px] font-semibold text-[#2B2A28]`}
        >
          {accountLabel}
        </Link>

        <button
          type="button"
          aria-label="메뉴 열기"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen(true)}
          className={`${FOCUS_RING_CLASS_NAME} ${MIN_TOUCH_TARGET_CLASS_NAME} md:hidden`}
        >
          <span aria-hidden="true">☰</span>
        </button>
      </div>

      <Modal
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        titleId="mobile-menu-title"
      >
        <h2
          id="mobile-menu-title"
          className="text-[18px] font-semibold text-[#2B2A28]"
        >
          메뉴
        </h2>
        <nav
          className="mt-4 flex flex-col gap-2"
          aria-label="모바일 내비게이션"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
              className={`${FOCUS_RING_CLASS_NAME} ${MIN_TOUCH_TARGET_CLASS_NAME} text-[16px] font-semibold text-[#2B2A28]`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/account"
            onClick={() => setIsMenuOpen(false)}
            className={`${FOCUS_RING_CLASS_NAME} ${MIN_TOUCH_TARGET_CLASS_NAME} text-[16px] font-semibold text-[#2B2A28]`}
          >
            {accountLabel}
          </Link>
        </nav>
      </Modal>
    </header>
  );
}
