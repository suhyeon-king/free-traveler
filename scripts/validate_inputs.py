#!/usr/bin/env python3
"""
validate_inputs.py — Traveler Task 생성 파이프라인의 입력 검증 스크립트.

아래 11개 검사를 순서대로 수행한다.

 1. package.json에 Next.js 의존성이 있다.
 2. src/app/page.tsx와 src/app/layout.tsx가 존재한다.
 3. PRD·SRS·Project Scope·UI 문서가 존재한다.
 4. D-001 DESIGN.md와 LOCKED 상태의 Manifest가 존재한다.
 5. SCREEN_ROUTE_CONTRACT.json을 JSON으로 파싱할 수 있다.
 6. Screen 수가 정확히 5개다.
 7. SCR-001~005가 모두 존재한다.
 8. Route가 `/`, `/about`, `/travel-tools`, `/mates`, `/account`다.
 9. Page Entry가 실제 Next.js App Router 경로 형식이다.
10. PROJECT_SCOPE에 REQ-FUNC 80개와 REQ-NF 34개가 모두 등장한다.
11. AWS·EC2가 활성 기술로 정의되지 않았다.

검사를 모두 통과하면 stdout에 "VALIDATE_INPUTS_PASS"와 통과한 검사 수를 출력하고 exit 0.
하나라도 실패하면 누락된 파일·Screen·Requirement ID를 출력하고 exit 1.

표준 라이브러리만 사용한다(외부 의존성 없음).
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

TOTAL_CHECKS = 11

EXPECTED_ROUTES = ["/", "/about", "/travel-tools", "/mates", "/account"]
EXPECTED_SCREEN_IDS = [f"SCR-00{n}" for n in range(1, 6)]

PRD_SRS_SCOPE_UI_DOCS = [
    "docs/01_PRD.md.md",
    "docs/02_SRS_BASELINE.md.md",
    "docs/06_SRS_UIUX_REVISED.md",
    "docs/PROJECT_SCOPE.md",
    "docs/03_UI_COVERAGE_ANALYSIS.md",
    "docs/04_UIUX_PLAN.md",
    "docs/05_UIUX_APPROVED.md",
    "docs/UIUX_TRACEABILITY.md",
    "design-reference/UI_CONTRACT.md",
]

DESIGN_DOC = "design-reference/D-001/DESIGN.md"
MANIFEST_DOC = "design-reference/DESIGN_MANIFEST.md"
SCREEN_ROUTE_CONTRACT_PATH = "design-reference/SCREEN_ROUTE_CONTRACT.json"
PACKAGE_JSON_PATH = "package.json"

PAGE_ENTRY_RE = re.compile(r"^src/app(/[a-zA-Z0-9_\-]+)*/page\.tsx$")

# 활성 기술(EC2/AWS)로 취급하지 않을, 제외·금지 문맥을 나타내는 표시어.
EXCLUSION_MARKERS = [
    "제외",
    "EXCLUDED",
    "금지",
    "사용하지 않",
    "구성하지 않",
    "만든다지 않",
    "만들지 않",
    "않는다",
    "않음",
]

# AWS/EC2 활성 기술 여부를 확인할 대상 문서(파이프라인 메타 문서인 .claude/*는 제외).
AWS_EC2_SCAN_DOCS = [
    PACKAGE_JSON_PATH,
    "docs/PROJECT_SCOPE.md",
    SCREEN_ROUTE_CONTRACT_PATH,
    DESIGN_DOC,
    "design-reference/UI_CONTRACT.md",
]


class ValidationError(Exception):
    def __init__(self, check_number: int, check_name: str, reasons: list[str]):
        super().__init__(check_name)
        self.check_number = check_number
        self.check_name = check_name
        self.reasons = reasons


def read_text(rel_path: str) -> str | None:
    path = REPO_ROOT / rel_path
    if not path.exists():
        return None
    return path.read_text(encoding="utf-8")


def require_files(check_number: int, check_name: str, rel_paths: list[str]) -> None:
    missing = [p for p in rel_paths if not (REPO_ROOT / p).exists()]
    if missing:
        raise ValidationError(check_number, check_name, [f"누락 파일: {p}" for p in missing])


def check_1_nextjs_dependency() -> None:
    raw = read_text(PACKAGE_JSON_PATH)
    if raw is None:
        raise ValidationError(1, "package.json Next.js 의존성", [f"누락 파일: {PACKAGE_JSON_PATH}"])
    try:
        data = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValidationError(1, "package.json Next.js 의존성", [f"package.json JSON 파싱 실패: {exc}"])

    deps = {**data.get("dependencies", {}), **data.get("devDependencies", {})}
    if "next" not in deps:
        raise ValidationError(
            1, "package.json Next.js 의존성", ["package.json에 'next' 의존성이 없습니다."]
        )


def check_2_app_entry_files() -> None:
    require_files(
        2,
        "src/app 필수 진입 파일",
        ["src/app/page.tsx", "src/app/layout.tsx"],
    )


def check_3_prd_srs_scope_ui_docs() -> None:
    require_files(3, "PRD·SRS·Project Scope·UI 문서", PRD_SRS_SCOPE_UI_DOCS)


def check_4_design_and_locked_manifest() -> None:
    reasons: list[str] = []
    if not (REPO_ROOT / DESIGN_DOC).exists():
        reasons.append(f"누락 파일: {DESIGN_DOC}")
    manifest_raw = read_text(MANIFEST_DOC)
    if manifest_raw is None:
        reasons.append(f"누락 파일: {MANIFEST_DOC}")
    elif "LOCKED" not in manifest_raw:
        reasons.append(f"{MANIFEST_DOC}에 'LOCKED' 상태 표기가 없습니다.")
    if reasons:
        raise ValidationError(4, "D-001 DESIGN.md와 LOCKED Manifest", reasons)


def check_5_screen_route_contract_json() -> dict:
    raw = read_text(SCREEN_ROUTE_CONTRACT_PATH)
    if raw is None:
        raise ValidationError(
            5, "SCREEN_ROUTE_CONTRACT.json 파싱", [f"누락 파일: {SCREEN_ROUTE_CONTRACT_PATH}"]
        )
    try:
        return json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValidationError(5, "SCREEN_ROUTE_CONTRACT.json 파싱", [f"JSON 파싱 실패: {exc}"])


def check_6_screen_count_is_5(contract: dict) -> list[dict]:
    screens = contract.get("screens", [])
    if len(screens) != 5:
        raise ValidationError(
            6, "Screen 수 = 5", [f"Screen 수가 5개가 아닙니다: {len(screens)}개"]
        )
    return screens


def check_7_scr001_to_005_present(screens: list[dict]) -> dict[str, dict]:
    by_id = {s.get("screen_id"): s for s in screens}
    missing = [sid for sid in EXPECTED_SCREEN_IDS if sid not in by_id]
    if missing:
        raise ValidationError(
            7, "SCR-001~005 존재", [f"누락 Screen: {sid}" for sid in missing]
        )
    return by_id


def check_8_routes_match(by_id: dict[str, dict]) -> None:
    reasons: list[str] = []
    actual_routes = [by_id[sid].get("route") for sid in EXPECTED_SCREEN_IDS]
    for sid, expected_route in zip(EXPECTED_SCREEN_IDS, EXPECTED_ROUTES):
        actual = by_id[sid].get("route")
        if actual != expected_route:
            reasons.append(f"{sid}의 route가 예상과 다릅니다: {actual!r} != {expected_route!r}")
    if sorted(actual_routes) != sorted(EXPECTED_ROUTES):
        reasons.append(
            f"Route 집합이 예상과 다릅니다: {sorted(actual_routes)} != {sorted(EXPECTED_ROUTES)}"
        )
    if reasons:
        raise ValidationError(8, "Route 집합 일치", reasons)


def check_9_page_entry_format(by_id: dict[str, dict]) -> None:
    reasons: list[str] = []
    page_entries = []
    for sid in EXPECTED_SCREEN_IDS:
        page_entry = by_id[sid].get("page_entry", "")
        page_entries.append(page_entry)
        if not PAGE_ENTRY_RE.match(page_entry or ""):
            reasons.append(
                f"{sid}의 page_entry가 Next.js App Router 경로 형식이 아닙니다: {page_entry!r}"
            )
    if len(set(page_entries)) != len(page_entries):
        reasons.append("Page Entry가 중복됩니다.")
    if reasons:
        raise ValidationError(9, "Page Entry 형식", reasons)


def check_10_project_scope_requirement_ids() -> None:
    raw = read_text("docs/PROJECT_SCOPE.md")
    if raw is None:
        raise ValidationError(
            10, "PROJECT_SCOPE Requirement ID 커버리지", ["누락 파일: docs/PROJECT_SCOPE.md"]
        )

    missing: list[str] = []
    for n in range(1, 81):
        req_id = f"REQ-FUNC-{n:03d}"
        if req_id not in raw:
            missing.append(req_id)
    for n in range(1, 35):
        req_id = f"REQ-NF-{n:03d}"
        if req_id not in raw:
            missing.append(req_id)

    if missing:
        raise ValidationError(
            10,
            "PROJECT_SCOPE Requirement ID 커버리지",
            [f"누락 Requirement ID: {req_id}" for req_id in missing],
        )


def check_11_no_active_aws_ec2() -> None:
    findings: list[str] = []
    for rel_path in AWS_EC2_SCAN_DOCS:
        raw = read_text(rel_path)
        if raw is None:
            continue
        for lineno, line in enumerate(raw.splitlines(), start=1):
            if "AWS" not in line and "EC2" not in line:
                continue
            if any(marker in line for marker in EXCLUSION_MARKERS):
                continue
            findings.append(f"{rel_path}:{lineno}: 제외 문맥 없이 AWS/EC2 언급 — {line.strip()[:120]}")

    if findings:
        raise ValidationError(11, "AWS·EC2 비활성 확인", findings)


def main() -> int:
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8")
        except AttributeError:
            pass

    passed = 0
    try:
        check_1_nextjs_dependency()
        passed += 1
        check_2_app_entry_files()
        passed += 1
        check_3_prd_srs_scope_ui_docs()
        passed += 1
        check_4_design_and_locked_manifest()
        passed += 1

        contract = check_5_screen_route_contract_json()
        passed += 1
        screens = check_6_screen_count_is_5(contract)
        passed += 1
        by_id = check_7_scr001_to_005_present(screens)
        passed += 1
        check_8_routes_match(by_id)
        passed += 1
        check_9_page_entry_format(by_id)
        passed += 1
        check_10_project_scope_requirement_ids()
        passed += 1
        check_11_no_active_aws_ec2()
        passed += 1

    except ValidationError as err:
        print(f"[validate_inputs] FAIL at check {err.check_number}/{TOTAL_CHECKS}: {err.check_name}")
        for reason in err.reasons:
            print(f"  - {reason}")
        print(f"\n[validate_inputs] {passed}/{TOTAL_CHECKS} checks passed before failure.")
        return 1

    print("VALIDATE_INPUTS_PASS")
    print(f"Checks passed: {passed}/{TOTAL_CHECKS}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
