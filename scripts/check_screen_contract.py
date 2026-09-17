#!/usr/bin/env python3
"""
check_screen_contract.py — Traveler 5개 고정 화면(Screen)의 계약 준수를 검사한다.

입력:
  - design-reference/SCREEN_ROUTE_CONTRACT.json (schema_version: traveler-screen-route-v1)
  - TASKS/TASK_MANIFEST.csv (Page Owner Task·Depends On 정본, scripts/audit_tasks.py 산출물)
  - src/app 디렉터리 (mode=ci·mode=release에서만 실제 구현 파일을 스캔한다)

실행 모드(--mode=plan|ci|release, 기본값 ci):
  - plan:    Page Owner와 Route 계획만 검사한다(검사 1·2·5). src/app 파일시스템을 읽지 않는다.
  - ci:      plan의 검사 + 실제 구현된 Page 파일·공개 경로 검사(검사 1의 구현 존재 확인·3·4)를 더한다.
  - release: ci 검사 + Preview Checkpoint 존재 여부(검사 6)를 더한다.

검사(요청된 순서 그대로):
  1. 고정 화면 5개가 정확히 존재한다(Contract·Manifest 일치, ci/release에서는 Page 파일 실존도 확인).
  2. 각 화면 Page Owner Task가 정확히 하나다.
  3. 기술 경로(/auth/callback, /api/**, not-found)를 사용자 화면으로 세지 않는다.
  4. 여행지 상세·안전정보를 새 Page로 만들지 않았는지 검사한다(Drawer로만 구현해야 한다).
  5. SCR-003 Page Owner Task가 여행 입력(항공/숙소)과 동행 작성 양쪽 요구를 모두 포함한다.
  6. release 모드에서는 docs/preview-checks/SCR-001.md ~ SCR-005.md 존재를 확인한다.

오류는 파일·화면 ID·수정 힌트를 포함해 출력하고, 하나라도 있으면 exit code 1로 끝낸다.
표준 라이브러리만 사용한다(외부 의존성 없음). 이 스크립트는 어떤 파일도 수정하지 않는다.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

SCREEN_ROUTE_CONTRACT_PATH = REPO_ROOT / "design-reference" / "SCREEN_ROUTE_CONTRACT.json"
MANIFEST_CSV_PATH = REPO_ROOT / "TASKS" / "TASK_MANIFEST.csv"
SRC_APP_DIR = REPO_ROOT / "src" / "app"
PREVIEW_CHECKS_DIR = REPO_ROOT / "docs" / "preview-checks"

EXPECTED_HARNESS_SCHEMA = "traveler-screen-route-v1"

# 고정 화면 5개 — 사용자 지시에 그대로 고정된 값. Contract·Manifest가 이와 다르면 실패한다.
FIXED_SCREENS: list[tuple[str, str]] = [
    ("SCR-001", "/"),
    ("SCR-002", "/about"),
    ("SCR-003", "/travel-tools"),
    ("SCR-004", "/mates"),
    ("SCR-005", "/account"),
]
FIXED_SCREEN_IDS = [sid for sid, _ in FIXED_SCREENS]
FIXED_ROUTE_BY_SCREEN = dict(FIXED_SCREENS)
FIXED_ROUTES = set(FIXED_ROUTE_BY_SCREEN.values())

# 허용 기술 경로 — 사용자 화면으로 세지 않는다.
ALLOWED_TECHNICAL_ROUTE_PATTERNS = ["/auth/callback", "/api/**", "not-found"]

STRAY_KEYWORD_PATTERNS = [
    re.compile(r"destinations?", re.IGNORECASE),
    re.compile(r"safety", re.IGNORECASE),
]


@dataclass
class Issue:
    check: int
    file: str
    screen_id: str
    message: str
    hint: str


@dataclass
class Report:
    issues: list[Issue] = field(default_factory=list)

    def fail(self, check: int, file: str, screen_id: str, message: str, hint: str) -> None:
        self.issues.append(Issue(check, file, screen_id, message, hint))

    @property
    def ok(self) -> bool:
        return len(self.issues) == 0


# --------------------------------------------------------------------------
# Loading
# --------------------------------------------------------------------------

def read_text(path: Path) -> str | None:
    if not path.exists():
        return None
    return path.read_text(encoding="utf-8")


def load_contract(report: Report) -> dict | None:
    rel = SCREEN_ROUTE_CONTRACT_PATH.relative_to(REPO_ROOT)
    text = read_text(SCREEN_ROUTE_CONTRACT_PATH)
    if text is None:
        report.fail(1, str(rel), "—", "SCREEN_ROUTE_CONTRACT.json 파일이 없습니다.",
                    f"{rel} 파일을 생성하거나 경로를 확인하세요.")
        return None
    try:
        data = json.loads(text)
    except json.JSONDecodeError as e:
        report.fail(1, str(rel), "—", f"JSON 파싱 실패: {e}", f"{rel}의 JSON 문법을 확인하세요.")
        return None
    if data.get("schema_version") != EXPECTED_HARNESS_SCHEMA:
        report.fail(1, str(rel), "—",
                    f"schema_version이 {EXPECTED_HARNESS_SCHEMA!r}가 아닙니다: {data.get('schema_version')!r}",
                    f"{rel}의 schema_version을 {EXPECTED_HARNESS_SCHEMA!r}로 맞추세요.")
        return None
    return data


def load_manifest_rows(report: Report) -> list[dict] | None:
    rel = MANIFEST_CSV_PATH.relative_to(REPO_ROOT)
    text = read_text(MANIFEST_CSV_PATH)
    if text is None:
        report.fail(2, str(rel), "—", "TASK_MANIFEST.csv 파일이 없습니다.",
                    "python scripts/audit_tasks.py를 먼저 실행해 생성하세요.")
        return None
    rows = list(csv.DictReader(text.splitlines()))
    if not rows:
        report.fail(2, str(rel), "—", "TASK_MANIFEST.csv에 Task 행이 없습니다.",
                    "python scripts/audit_tasks.py를 다시 실행해 재생성하세요.")
        return None
    for r in rows:
        r["depends_on"] = [d for d in r.get("depends_on", "").split(";") if d]
    return rows


# --------------------------------------------------------------------------
# Check 1: 고정 화면 5개가 정확히 존재한다
# --------------------------------------------------------------------------

def check_1_fixed_screens(report: Report, contract: dict, rows: list[dict], mode: str) -> None:
    rel_contract = SCREEN_ROUTE_CONTRACT_PATH.relative_to(REPO_ROOT)
    contract_screens = {s.get("screen_id"): s for s in contract.get("screens", [])}

    for sid, route in FIXED_SCREENS:
        cs = contract_screens.get(sid)
        if cs is None:
            report.fail(1, str(rel_contract), sid, f"{sid}가 SCREEN_ROUTE_CONTRACT.json screens[]에 없습니다.",
                        f"{rel_contract}에 {sid}(route={route})를 추가하세요.")
            continue
        if cs.get("route") != route:
            report.fail(1, str(rel_contract), sid,
                        f"route가 고정값과 다릅니다: {cs.get('route')!r} != {route!r}",
                        f"{rel_contract}의 {sid}.route를 {route!r}로 고정하세요.")

    extra_ids = set(contract_screens) - set(FIXED_SCREEN_IDS)
    if extra_ids:
        report.fail(1, str(rel_contract), ", ".join(sorted(extra_ids)),
                    f"고정 5개 화면 외 Screen이 Contract에 정의되어 있습니다: {sorted(extra_ids)}",
                    f"{rel_contract}에서 고정 5개 화면(SCR-001~005) 외 Screen을 제거하거나 사람 승인을 먼저 받으세요.")

    # Contract 자체 정합성(중복 route/page_entry, screen 수)도 함께 확인한다.
    routes = [s.get("route") for s in contract.get("screens", [])]
    if len(routes) != len(set(routes)):
        report.fail(1, str(rel_contract), "—", "Contract 안에 중복된 route가 있습니다.",
                    f"{rel_contract}의 screens[].route 값을 서로 다르게 유지하세요.")
    entries = [s.get("page_entry") for s in contract.get("screens", [])]
    if len(entries) != len(set(entries)):
        report.fail(1, str(rel_contract), "—", "Contract 안에 중복된 page_entry가 있습니다.",
                    f"{rel_contract}의 screens[].page_entry 값을 서로 다르게 유지하세요.")

    # Manifest 쪽에서도 5개 Page Owner의 Screen/Route/Page Entry가 고정값과 일치하는지 본다.
    rel_manifest = MANIFEST_CSV_PATH.relative_to(REPO_ROOT)
    page_owner_rows = {r["screen"]: r for r in rows if r.get("category") == "PAGE_OWNER"}
    for sid, route in FIXED_SCREENS:
        r = page_owner_rows.get(sid)
        if r is None:
            report.fail(1, str(rel_manifest), sid, f"{sid}의 PAGE_OWNER Task가 TASK_MANIFEST.csv에 없습니다.",
                        "TASKS/00_TASK_LIST.md에 해당 Screen의 PAGE_OWNER Task를 추가한 뒤 audit_tasks.py를 다시 실행하세요.")
            continue
        if r.get("route") != route:
            report.fail(1, str(rel_manifest), sid,
                        f"Page Owner Task({r['task_id']})의 route가 고정값과 다릅니다: {r.get('route')!r} != {route!r}",
                        f"TASKS/TASK-{r['task_id']}.md의 Route를 {route!r}로 맞추세요.")

    if mode in ("ci", "release"):
        _check_1_implementation(report, rel_manifest, page_owner_rows)


def _discover_page_routes() -> dict[str, Path]:
    """src/app 아래 page.tsx/ts/jsx 파일을 스캔해 {route: file_path}를 반환한다."""
    routes: dict[str, Path] = {}
    if not SRC_APP_DIR.exists():
        return routes
    for pattern in ("page.tsx", "page.ts", "page.jsx"):
        for p in SRC_APP_DIR.rglob(pattern):
            rel_parts = p.relative_to(SRC_APP_DIR).parts[:-1]  # 파일명(page.*) 제외
            segments = [s for s in rel_parts if not (s.startswith("(") and s.endswith(")")) and not s.startswith("@")]
            route = "/" + "/".join(segments) if segments else "/"
            routes[route] = p
    return routes


def _check_1_implementation(report: Report, rel_manifest: Path, page_owner_rows: dict[str, dict]) -> None:
    discovered = _discover_page_routes()

    for sid, route in FIXED_SCREENS:
        p = discovered.get(route)
        expected_entry = FIXED_ROUTE_BY_SCREEN.get(sid)
        r = page_owner_rows.get(sid)
        expected_file = r["page_entry"] if r else expected_entry
        if p is None:
            report.fail(1, expected_file or f"src/app{route}/page.tsx", sid,
                        f"{sid}({route})의 Page 파일이 아직 구현되지 않았습니다.",
                        f"`{expected_file}`을 생성해 {sid} Page Owner Task를 구현하세요.")


# --------------------------------------------------------------------------
# Check 2: 각 화면 Page Owner Task가 정확히 하나다
# --------------------------------------------------------------------------

def check_2_page_owner_unique(report: Report, rows: list[dict]) -> dict[str, dict]:
    rel = MANIFEST_CSV_PATH.relative_to(REPO_ROOT)
    by_screen: dict[str, dict] = {}
    for r in rows:
        if r.get("category") != "PAGE_OWNER":
            continue
        sid = r.get("screen")
        if sid in by_screen:
            report.fail(2, str(rel), sid,
                        f"{sid}에 PAGE_OWNER Task가 2개 이상입니다: {by_screen[sid]['task_id']}, {r['task_id']}",
                        f"TASKS/00_TASK_LIST.md에서 {sid}의 PAGE_OWNER Task를 하나로 합치세요.")
            continue
        by_screen[sid] = r

    for sid, _ in FIXED_SCREENS:
        if sid not in by_screen:
            report.fail(2, str(rel), sid, f"{sid}의 PAGE_OWNER Task가 없습니다.",
                        f"TASKS/00_TASK_LIST.md에 {sid}의 PAGE_OWNER Task를 추가하세요.")

    return by_screen


# --------------------------------------------------------------------------
# Check 3: 기술 경로를 사용자 화면으로 세지 않는다
# --------------------------------------------------------------------------

def _is_allowed_technical_route(route: str) -> bool:
    for pattern in ALLOWED_TECHNICAL_ROUTE_PATTERNS:
        if pattern == "not-found":
            if route in ("not-found", "/not-found"):
                return True
        elif pattern.endswith("/**"):
            prefix = pattern[:-3]
            if route == prefix or route.startswith(prefix + "/"):
                return True
        elif route == pattern:
            return True
    return False


def check_3_technical_routes_not_counted(report: Report, contract: dict, rows: list[dict], mode: str) -> None:
    rel_contract = SCREEN_ROUTE_CONTRACT_PATH.relative_to(REPO_ROOT)
    technical_routes = contract.get("technical_routes", [])

    declared_paths = {tr.get("path") for tr in technical_routes}
    for expected in ALLOWED_TECHNICAL_ROUTE_PATTERNS:
        if expected not in declared_paths and expected.replace("**", "*") not in declared_paths:
            report.fail(3, str(rel_contract), "—",
                        f"허용 기술 경로 {expected!r}가 technical_routes[]에 선언되어 있지 않습니다.",
                        f"{rel_contract}의 technical_routes[]에 {expected!r}를 counted_as_screen=false로 추가하세요.")

    for tr in technical_routes:
        if tr.get("counted_as_screen") is not False:
            report.fail(3, str(rel_contract), "—",
                        f"기술 경로 {tr.get('path')!r}의 counted_as_screen이 false가 아닙니다.",
                        f"{rel_contract}에서 {tr.get('path')!r}.counted_as_screen을 false로 바꾸세요.")

    # Manifest의 PAGE_OWNER Task 중 기술 경로를 Route로 쓰는 것이 있으면 화면으로 잘못 카운트된 것이다.
    rel_manifest = MANIFEST_CSV_PATH.relative_to(REPO_ROOT)
    for r in rows:
        if r.get("category") != "PAGE_OWNER":
            continue
        route = r.get("route", "")
        if route and _is_allowed_technical_route(route):
            report.fail(3, str(rel_manifest), r.get("screen", "—"),
                        f"PAGE_OWNER Task({r['task_id']})가 기술 경로({route!r})를 화면 Route로 사용합니다.",
                        f"TASKS/TASK-{r['task_id']}.md에서 기술 경로를 화면 Route로 쓰지 말고, "
                        f"기술 경로는 INFRA Task로 분리하세요.")

    if mode not in ("ci", "release"):
        return

    # 실제 src/app에 존재하는 Page 중 기술 경로에 해당하는 것이 5개 화면으로 잘못 세어지지 않는지 확인한다.
    discovered = _discover_page_routes()
    for route in discovered:
        if route in FIXED_ROUTES:
            continue
        if _is_allowed_technical_route(route):
            continue  # 기술 경로는 정상 — 화면으로 세지 않는다.
        # (check 4/일반 stray 검사에서 별도로 다룬다 — 여기서는 판단하지 않는다)


# --------------------------------------------------------------------------
# Check 4: 여행지 상세·안전정보를 새 Page로 만들지 않았는지
# --------------------------------------------------------------------------

def check_4_no_stray_detail_pages(report: Report, mode: str) -> None:
    if mode not in ("ci", "release"):
        return

    discovered = _discover_page_routes()
    for route, path in discovered.items():
        if route in FIXED_ROUTES or _is_allowed_technical_route(route):
            continue
        rel_path = path.relative_to(REPO_ROOT)
        if any(pat.search(route) for pat in STRAY_KEYWORD_PATTERNS):
            report.fail(4, str(rel_path), "SCR-001",
                        f"여행지 상세 또는 안전정보로 보이는 별도 Page가 발견됨: {route!r}",
                        "여행지 상세·국가 안전정보는 SCR-001의 DestinationDrawer/SafetyDrawer로만 구현해야 한다 "
                        f"— {rel_path}를 삭제하고 Drawer 컴포넌트로 대체하세요.")
        else:
            report.fail(1, str(rel_path), "—",
                        f"고정 5개 화면·허용 기술 경로 외의 정의되지 않은 Page가 발견됨: {route!r}",
                        f"{rel_path}가 필요하다면 먼저 design-reference/SCREEN_ROUTE_CONTRACT.json과 "
                        "사람 승인을 받아 Screen/기술 경로로 정식 등록하세요. 그렇지 않으면 삭제하세요.")


# --------------------------------------------------------------------------
# Check 5: SCR-003 Page Owner Task가 여행 입력·동행 작성 양쪽을 포함
# --------------------------------------------------------------------------

def check_5_scr003_dual_requirement(report: Report, by_screen: dict[str, dict]) -> None:
    r3 = by_screen.get("SCR-003")
    if r3 is None:
        return  # check_2에서 이미 보고됨

    rel = f"TASKS/TASK-{r3['task_id']}.md"
    deps = r3.get("depends_on", [])
    has_travel_input = any(re.search(r"FLIGHT|HOTEL", d, re.IGNORECASE) for d in deps)
    has_mate_write = any(re.search(r"MATE-WRITE", d, re.IGNORECASE) for d in deps)

    if not has_travel_input:
        report.fail(5, rel, "SCR-003",
                    f"{r3['task_id']}의 Depends On에 항공/숙소 여행 입력 Component가 없습니다: {deps}",
                    f"{rel}의 Depends On에 CMP-SCR003-FLIGHT-FORM·CMP-SCR003-HOTEL-FORM을 추가하세요.")
    if not has_mate_write:
        report.fail(5, rel, "SCR-003",
                    f"{r3['task_id']}의 Depends On에 동행 작성 Component가 없습니다: {deps}",
                    f"{rel}의 Depends On에 CMP-SCR003-MATE-WRITE를 추가하세요.")


# --------------------------------------------------------------------------
# Check 6 (release 모드): Preview Checkpoint 존재 여부
# --------------------------------------------------------------------------

def check_6_preview_checkpoints(report: Report, mode: str) -> None:
    if mode != "release":
        return
    for sid, _ in FIXED_SCREENS:
        p = PREVIEW_CHECKS_DIR / f"{sid}.md"
        if not p.exists():
            report.fail(6, str(p.relative_to(REPO_ROOT)), sid,
                        f"{sid}의 Preview Checkpoint 기록 파일이 없습니다.",
                        f"사람이 {sid} Preview(Vercel Preview 또는 로컬 실행 화면)를 확인한 뒤 "
                        f"docs/preview-checks/{sid}.md를 작성하세요.")


# --------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------

def print_report(report: Report, mode: str) -> None:
    print("=" * 60)
    print(f"Traveler Screen Contract Check (mode={mode})")
    print("=" * 60)
    if report.ok:
        print("문제가 발견되지 않았습니다.")
        return
    for issue in sorted(report.issues, key=lambda i: (i.check, i.screen_id, i.file)):
        print(f"[FAIL] Check {issue.check} | file={issue.file} | screen={issue.screen_id}")
        print(f"    사유: {issue.message}")
        print(f"    힌트: {issue.hint}")


def main() -> int:
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8")
        except AttributeError:
            pass

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mode", choices=["plan", "ci", "release"], default="ci",
                        help="plan|ci|release (기본값 ci)")
    args = parser.parse_args()
    mode = args.mode

    report = Report()

    contract = load_contract(report)
    rows = load_manifest_rows(report)

    if contract is not None and rows is not None:
        check_1_fixed_screens(report, contract, rows, mode)
        by_screen = check_2_page_owner_unique(report, rows)
        check_3_technical_routes_not_counted(report, contract, rows, mode)
        check_4_no_stray_detail_pages(report, mode)
        check_5_scr003_dual_requirement(report, by_screen)
        check_6_preview_checkpoints(report, mode)

    print_report(report, mode)

    if report.ok:
        print("SCREEN_CONTRACT_PASS")
        print(f"mode={mode}")
        return 0

    print("SCREEN_CONTRACT_FAIL")
    print(f"mode={mode}, 오류 {len(report.issues)}건")
    return 1


if __name__ == "__main__":
    sys.exit(main())
