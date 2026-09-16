#!/usr/bin/env python3
"""
audit_tasks.py — Traveler Task 생성 파이프라인의 최종 감사 스크립트.

입력:
  - TASKS/00_TASK_LIST.md   (Task List 정본, Markdown 표 + §4 NON_IMPLEMENTATION 표)
  - TASKS/TASK-*.md         (Task 상세 파일)
  - docs/PROJECT_SCOPE.md   (REQ별 IMPLEMENT/EXCLUDED 정본)
  - design-reference/SCREEN_ROUTE_CONTRACT.json (Screen/Route/Page Entry 정본)

검사 18개(요청된 순서 그대로):
  1. Task List 구현 ID와 상세 Task 파일 1:1
  2. 중복 Task ID 0
  3. Depends On 누락 0
  4. Dependency Cycle 0
  5. Screen 5개 모두 Page Owner 정확히 1개
  6. Route·Page Entry·Expected Files 일치
  7. Component-only Screen 0
  8. SCR-001 Starter 제거 AC 존재
  9. SCR-003 세 탭 조립 AC 존재
 10. SCR-005 역할별 상태 조립 AC 존재
 11. DB Schema·RLS·Access·Seed Task 존재
 12. DB Table 범위가 6개 기본 테이블을 크게 넘지 않음
 13. 외부 입력 비저장 AC 존재
 14. Auth·성인·기본 RLS AC 존재
 15. Playwright Chromium Smoke Task 존재
 16. AWS·EC2·자동 Merge 구현 Task 0
 17. REQ-FUNC 80개와 REQ-NF 34개가 Task 또는 EXCLUDED 표에 존재
 18. EXCLUDED 상세 구현 파일이 생성되지 않음

출력:
  - TASKS/TASK_MANIFEST.csv
  - TASKS/TASK_AUDIT_REPORT.md

성공 시 stdout에 "AUDIT_PASS"와 통과한 검사 수를 출력하고 exit 0.
하나라도 실패하면 exit 1. (출력 파일은 성공/실패와 무관하게 항상 갱신한다.)

이 스크립트는 TASKS/*.md 파일을 수정하지 않는다 — 있는 그대로 감사만 한다.
표준 라이브러리만 사용한다(외부 의존성 없음).
"""

from __future__ import annotations

import csv
import json
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

TASK_LIST_PATH = REPO_ROOT / "TASKS" / "00_TASK_LIST.md"
TASKS_DIR = REPO_ROOT / "TASKS"
PROJECT_SCOPE_PATH = REPO_ROOT / "docs" / "PROJECT_SCOPE.md"
SCREEN_ROUTE_CONTRACT_PATH = REPO_ROOT / "design-reference" / "SCREEN_ROUTE_CONTRACT.json"

MANIFEST_CSV_PATH = TASKS_DIR / "TASK_MANIFEST.csv"
AUDIT_REPORT_PATH = TASKS_DIR / "TASK_AUDIT_REPORT.md"

HARNESS_SCHEMA = "traveler-screen-route-v1"
TOTAL_CHECKS = 18

EXPECTED_SCREEN_IDS = [f"SCR-00{n}" for n in range(1, 6)]

ALLOWED_DB_TABLES = {
    "profiles", "mate_posts", "mate_applications",
    "user_blocks", "reports", "app_settings",
}
DB_TABLE_BASELINE = 6
DB_TABLE_SOFT_LIMIT = 8  # "크게 넘지 않음" 허용 오차 범위(참고 경고), 이 이상이면 실패

FORBIDDEN_TECH_KEYWORDS = ["aws", "ec2"]
FORBIDDEN_MERGE_KEYWORDS = ["자동 merge", "auto-merge", "automerge"]
NEGATION_CUES = ["않는다", "않음", "제외", "금지", "exclud", "포함하지 않", "만들지 않", "생략", "도입하지 않"]

MD_HEADERS = ["Seq", "Task ID", "제목", "Category", "Implementation Status", "Requirement Ref",
              "Screen", "Route", "Page Entry", "Depends On", "Expected Files", "Functional AC",
              "Visual AC", "Security/Privacy AC", "Verify", "Priority"]

REQ_ROW_RE = re.compile(r"^\|\s*(REQ-(?:FUNC|NF)-\d{3})[^|]*\|\s*([^|]+?)\s*\|", re.MULTILINE)


# --------------------------------------------------------------------------
# Data model
# --------------------------------------------------------------------------

@dataclass
class CheckResult:
    number: int
    name: str
    passed: bool
    details: list[str] = field(default_factory=list)


@dataclass
class Audit:
    results: list[CheckResult] = field(default_factory=list)

    def add(self, number: int, name: str, passed: bool, details: list[str] | None = None) -> None:
        self.results.append(CheckResult(number, name, passed, details or []))

    def sort(self) -> None:
        self.results.sort(key=lambda r: r.number)

    @property
    def ok(self) -> bool:
        return all(r.passed for r in self.results)

    @property
    def passed_count(self) -> int:
        return sum(1 for r in self.results if r.passed)


# --------------------------------------------------------------------------
# Parsing helpers
# --------------------------------------------------------------------------

def read_text(path: Path) -> str | None:
    if not path.exists():
        return None
    return path.read_text(encoding="utf-8")


def parse_task_rows(text: str) -> list[dict]:
    rows = []
    for line in text.splitlines():
        if not re.match(r"^\|\s*\d+\s*\|", line):
            continue
        parts = line.split("|")
        if len(parts) != 18:
            continue
        cells = [p.strip() for p in parts[1:-1]]
        rows.append(dict(zip(MD_HEADERS, cells)))
    return rows


def split_list(cell: str) -> list[str]:
    if cell in ("", "—", "-"):
        return []
    return [x.strip() for x in cell.split(",") if x.strip()]


def split_reqs(cell: str) -> list[str]:
    return re.findall(r"REQ-(?:FUNC|NF)-\d{3}", cell)


def parse_non_implementation_ids(list_text: str) -> set[str]:
    match = re.search(r"## 4\. NON_IMPLEMENTATION.*?(?=\n## \d|\Z)", list_text, re.DOTALL)
    if not match:
        return set()
    return set(re.findall(r"REQ-(?:FUNC|NF)-\d{3}", match.group(0)))


def parse_project_scope_status() -> tuple[set[str], set[str]]:
    """PROJECT_SCOPE.md에서 (implement_ids, excluded_ids)를 반환한다."""
    text = read_text(PROJECT_SCOPE_PATH)
    if text is None:
        return set(), set()
    implement_ids: set[str] = set()
    excluded_ids: set[str] = set()
    for m in REQ_ROW_RE.finditer(text):
        req_id, status = m.group(1), m.group(2).strip()
        if status.startswith("IMPLEMENT"):
            implement_ids.add(req_id)
        elif status == "EXCLUDED":
            excluded_ids.add(req_id)
    return implement_ids, excluded_ids


def strip_forbidden_section(text: str) -> str:
    return re.split(r"\n## Forbidden\b", text, maxsplit=1)[0]


def sentence_violates(text_lower: str, marker: str) -> bool:
    """marker가 들어간 문장 중 부정/제외 표현이 없는 문장이 하나라도 있으면 위반으로 본다."""
    for sentence in re.split(r"(?<=[.\n])", text_lower):
        if marker in sentence and not any(cue in sentence for cue in NEGATION_CUES):
            return True
    return False


def load_screen_route_contract() -> dict | None:
    text = read_text(SCREEN_ROUTE_CONTRACT_PATH)
    if text is None:
        return None
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return None


def load_detail_texts(ids: list[str]) -> tuple[dict[str, str], list[str]]:
    """반환: (id -> 파일 내용), 문제 목록(누락/초과 파일)."""
    problems: list[str] = []
    texts: dict[str, str] = {}
    if not TASKS_DIR.exists():
        return texts, [f"{TASKS_DIR} 디렉터리가 없습니다."]

    existing = {p.stem[len("TASK-"):]: p for p in TASKS_DIR.glob("TASK-*.md")}
    for tid in ids:
        p = existing.get(tid)
        if p is None:
            problems.append(f"TASK-{tid}.md 상세 파일이 없습니다.")
            continue
        texts[tid] = p.read_text(encoding="utf-8")

    extra = set(existing) - set(ids)
    for stem in sorted(extra):
        problems.append(f"TASKS/TASK-{stem}.md 는 00_TASK_LIST.md에 없는 Task ID입니다.")

    return texts, problems


# --------------------------------------------------------------------------
# Checks 1-3: identity / dependency existence
# --------------------------------------------------------------------------

def check_1_2_3(audit: Audit, rows: list[dict], detail_texts: dict[str, str], file_problems: list[str]) -> None:
    ids = [r["Task ID"] for r in rows]

    # Check 2: duplicate Task ID
    seen: set[str] = set()
    dupes: list[str] = []
    for tid in ids:
        if tid in seen:
            dupes.append(tid)
        seen.add(tid)
    audit.add(2, "중복 Task ID 0", len(dupes) == 0, [f"중복: {t}" for t in dupes])

    # Check 1: Task List <-> Task Detail 1:1
    audit.add(1, "Task List 구현 ID와 상세 Task 파일 1:1", len(file_problems) == 0, file_problems)

    # Check 3: Depends On 누락(dangling reference) 0
    all_ids = set(ids)
    dangling: list[str] = []
    for r in rows:
        for dep in split_list(r["Depends On"]):
            if dep not in all_ids:
                dangling.append(f"{r['Task ID']} -> {dep}")
    audit.add(3, "Depends On 누락 0", len(dangling) == 0, dangling)


# --------------------------------------------------------------------------
# Check 4: dependency cycle detection
# --------------------------------------------------------------------------

def check_4_cycles(audit: Audit, rows: list[dict]) -> None:
    graph: dict[str, list[str]] = {r["Task ID"]: split_list(r["Depends On"]) for r in rows}
    WHITE, GRAY, BLACK = 0, 1, 2
    color: dict[str, int] = {tid: WHITE for tid in graph}
    cycles: list[str] = []

    def dfs(node: str, path: list[str]) -> None:
        color[node] = GRAY
        path.append(node)
        for dep in graph.get(node, []):
            if dep not in color:
                continue
            if color[dep] == GRAY:
                cycle_start = path.index(dep)
                cycles.append(" -> ".join(path[cycle_start:] + [dep]))
            elif color[dep] == WHITE:
                dfs(dep, path)
        path.pop()
        color[node] = BLACK

    for tid in graph:
        if color[tid] == WHITE:
            dfs(tid, [])

    audit.add(4, "Dependency Cycle 0", len(cycles) == 0, cycles)


# --------------------------------------------------------------------------
# Checks 5-7: Screen / Page Owner structure
# --------------------------------------------------------------------------

def check_5_6_7(audit: Audit, rows: list[dict], contract: dict | None) -> dict[str, dict]:
    page_owners = [r for r in rows if r["Category"] == "PAGE_OWNER"]
    by_screen: dict[str, dict] = {}
    details5: list[str] = []

    for r in page_owners:
        sid = r["Screen"]
        if sid in by_screen:
            details5.append(f"{sid}에 PAGE_OWNER Task가 2개 이상입니다: {by_screen[sid]['Task ID']}, {r['Task ID']}")
        by_screen[sid] = r

    for sid in EXPECTED_SCREEN_IDS:
        if sid not in by_screen:
            details5.append(f"{sid}의 PAGE_OWNER Task가 없습니다.")

    ok5 = len(details5) == 0 and len(page_owners) == 5
    if len(page_owners) != 5:
        details5.append(f"PAGE_OWNER Task 총수가 5개가 아닙니다: {len(page_owners)}개")
    audit.add(5, "Screen 5개 모두 Page Owner 정확히 1개", ok5, details5)

    # Check 6: Route / Page Entry / Expected Files 일치
    details6: list[str] = []
    if contract is None:
        details6.append(f"{SCREEN_ROUTE_CONTRACT_PATH.relative_to(REPO_ROOT)}를 읽을 수 없습니다.")
    else:
        contract_by_id = {s.get("screen_id"): s for s in contract.get("screens", [])}
        for sid, row in by_screen.items():
            expected = contract_by_id.get(sid)
            if expected is None:
                details6.append(f"{sid}가 SCREEN_ROUTE_CONTRACT.json에 없습니다.")
                continue
            actual_route = row["Route"].strip("`")
            if actual_route != expected.get("route"):
                details6.append(
                    f"{row['Task ID']}: Route 불일치 {actual_route!r} != {expected.get('route')!r}"
                )
            actual_entry = row["Page Entry"].strip("`")
            expected_entry = expected.get("page_entry")
            if actual_entry != expected_entry:
                details6.append(
                    f"{row['Task ID']}: Page Entry 불일치 {actual_entry!r} != {expected_entry!r}"
                )
            if expected_entry and expected_entry not in row["Expected Files"]:
                details6.append(
                    f"{row['Task ID']}: Expected Files에 Page Entry({expected_entry})가 포함되지 않습니다."
                )
    audit.add(6, "Route·Page Entry·Expected Files 일치", len(details6) == 0, details6)

    # Check 7: Component-only Screen 0 (컴포넌트가 있는데 어떤 Page Owner에도 조립되지 않은 Screen)
    details7: list[str] = []
    for sid in EXPECTED_SCREEN_IDS:
        components = [r for r in rows if r["Category"] == "COMPONENT" and r["Screen"] == sid]
        po = by_screen.get(sid)
        po_deps = set(split_list(po["Depends On"])) if po else set()
        for c in components:
            if c["Task ID"] not in po_deps:
                details7.append(
                    f"{sid}: Component {c['Task ID']}가 어떤 Page Owner의 Depends On에도 없습니다(조립되지 않음)."
                )
        if po is None and components:
            details7.append(f"{sid}: Component만 있고 Page Owner가 없습니다({[c['Task ID'] for c in components]}).")
    audit.add(7, "Component-only Screen 0", len(details7) == 0, details7)

    return by_screen


# --------------------------------------------------------------------------
# Checks 8-10: Screen-specific Page Owner AC content
# --------------------------------------------------------------------------

def _po_text(row: dict, detail_texts: dict[str, str]) -> str:
    tid = row["Task ID"]
    return (
        row["Functional AC"] + " " + row["Visual AC"] + " " + row["Security/Privacy AC"]
        + " " + detail_texts.get(tid, "")
    )


def check_8_9_10(audit: Audit, by_screen: dict[str, dict], detail_texts: dict[str, str]) -> None:
    # 8: SCR-001 Starter 제거 AC
    r1 = by_screen.get("SCR-001")
    ok8, d8 = False, []
    if r1 is None:
        d8.append("SCR-001 Page Owner Task가 없습니다.")
    else:
        text = _po_text(r1, detail_texts)
        ok8 = bool(re.search(r"starter|스타터", text, re.IGNORECASE))
        if not ok8:
            d8.append(f"{r1['Task ID']}의 AC에 'Starter/스타터' 제거 문구가 없습니다.")
    audit.add(8, "SCR-001 Starter 제거 AC 존재", ok8, d8)

    # 9: SCR-003 세 탭 조립 AC
    r3 = by_screen.get("SCR-003")
    ok9, d9 = False, []
    if r3 is None:
        d9.append("SCR-003 Page Owner Task가 없습니다.")
    else:
        text = _po_text(r3, detail_texts)
        has_three_tabs = all(k in text for k in ("항공", "숙소", "동행"))
        has_independent = ("독립" in text) or ("서로" in text and ("유지" in text or "보존" in text))
        ok9 = has_three_tabs and has_independent
        if not ok9:
            d9.append(f"{r3['Task ID']}의 AC에 항공/숙소/동행 3탭 조립 또는 상태 독립 유지 문구가 부족합니다.")
    audit.add(9, "SCR-003 세 탭 조립 AC 존재", ok9, d9)

    # 10: SCR-005 역할별 상태 조립 AC
    r5 = by_screen.get("SCR-005")
    ok10, d10 = False, []
    if r5 is None:
        d10.append("SCR-005 Page Owner Task가 없습니다.")
    else:
        text = _po_text(r5, detail_texts)
        has_roles = all(k in text for k in ("Guest", "Member", "Admin"))
        has_conditional = ("렌더링하지 않" in text) or ("생략" in text)
        ok10 = has_roles and has_conditional
        if not ok10:
            d10.append(f"{r5['Task ID']}의 AC에 Guest/Member/Admin 역할별 조립 또는 조건부 렌더링 문구가 부족합니다.")
    audit.add(10, "SCR-005 역할별 상태 조립 AC 존재", ok10, d10)


# --------------------------------------------------------------------------
# Checks 11-12: DB
# --------------------------------------------------------------------------

def check_11_12(audit: Audit, rows: list[dict], detail_texts: dict[str, str]) -> None:
    db_rows = {r["Task ID"]: r for r in rows if r["Category"] == "DB"}

    required_db_tasks = ["DB-SCHEMA-BASE", "DB-RLS-BASE", "DB-ACCESS", "DB-SEED-BASE"]
    missing = [t for t in required_db_tasks if t not in db_rows]
    audit.add(11, "DB Schema·RLS·Access·Seed Task 존재", len(missing) == 0,
               [f"누락: {t}" for t in missing])

    table_line_re = re.compile(r"[^\n]*테이블[^\n]*")
    backtick_token_re = re.compile(r"`([a-z][a-z0-9_]{2,40})`")
    all_tables: set[str] = set()
    for tid, r in db_rows.items():
        text = r["Functional AC"] + "\n" + detail_texts.get(tid, "")
        for line in table_line_re.findall(text):
            all_tables.update(backtick_token_re.findall(line))

    details12: list[str] = []
    ok12 = True
    if len(all_tables) > DB_TABLE_SOFT_LIMIT:
        ok12 = False
        details12.append(
            f"DB 테이블 수가 허용 오차({DB_TABLE_SOFT_LIMIT}개)를 크게 초과합니다: {len(all_tables)}개 {sorted(all_tables)}"
        )
    elif len(all_tables) > DB_TABLE_BASELINE:
        details12.append(
            f"기본 {DB_TABLE_BASELINE}개보다 많지만 허용 오차 이내입니다: {len(all_tables)}개 {sorted(all_tables)}"
        )
    disallowed = all_tables - ALLOWED_DB_TABLES
    if disallowed and len(all_tables) > DB_TABLE_SOFT_LIMIT:
        details12.append(f"허용되지 않은 것으로 보이는 식별자: {sorted(disallowed)}")
    if not all_tables:
        details12.append("DB Task 텍스트에서 테이블 이름을 추출하지 못했습니다(수동 확인 권장, 실패 처리는 하지 않음).")

    audit.add(12, "DB Table 범위가 6개 기본 테이블을 크게 넘지 않음", ok12, details12)


# --------------------------------------------------------------------------
# Checks 13-14: Security / Privacy AC presence
# --------------------------------------------------------------------------

def check_13_14(audit: Audit, rows: list[dict], detail_texts: dict[str, str]) -> None:
    # 13: 외부 입력(항공/호텔) 비저장 AC — SCR-003 관련 Task들에서 확인
    travel_tool_tasks = [r for r in rows if r["Task ID"] in
                          ("PAGE-SCR003", "CMP-SCR003-FLIGHT-FORM", "CMP-SCR003-HOTEL-FORM")]
    ok13 = False
    d13: list[str] = []
    for r in travel_tool_tasks:
        text = _po_text(r, detail_texts)
        if re.search(r"(저장|전달|전송).{0,10}(하지 않|없|금지)", text) or "미저장" in text or "미전달" in text:
            ok13 = True
    if not ok13:
        d13.append("PAGE-SCR003 / CMP-SCR003-FLIGHT-FORM / CMP-SCR003-HOTEL-FORM 중 "
                    "입력값 비저장·비전달을 명시한 AC를 찾지 못했습니다.")
    audit.add(13, "외부 입력 비저장 AC 존재", ok13, d13)

    # 14: Auth·성인 확인·기본 RLS AC
    auth_task = next((r for r in rows if r["Task ID"] == "INFRA-AUTH"), None)
    rls_task = next((r for r in rows if r["Task ID"] == "DB-RLS-BASE"), None)
    d14: list[str] = []
    ok_auth = False
    if auth_task is None:
        d14.append("INFRA-AUTH Task가 없습니다.")
    else:
        text = _po_text(auth_task, detail_texts)
        ok_auth = ("성인" in text) and ("로그인" in text or "인증" in text)
        if not ok_auth:
            d14.append("INFRA-AUTH AC에 로그인/인증 + 성인 확인 내용이 부족합니다.")

    ok_rls = False
    if rls_task is None:
        d14.append("DB-RLS-BASE Task가 없습니다.")
    else:
        text = _po_text(rls_task, detail_texts)
        ok_rls = "RLS" in text or "Row Level Security" in text
        if not ok_rls:
            d14.append("DB-RLS-BASE AC에 RLS 관련 내용이 부족합니다.")

    audit.add(14, "Auth·성인·기본 RLS AC 존재", ok_auth and ok_rls, d14)


# --------------------------------------------------------------------------
# Check 15: Playwright Chromium
# --------------------------------------------------------------------------

def check_15(audit: Audit, rows: list[dict], detail_texts: dict[str, str]) -> None:
    e2e_rows = [r for r in rows if r["Category"] == "E2E_TEST"]
    ok = len(e2e_rows) > 0
    details: list[str] = []
    if not e2e_rows:
        details.append("E2E_TEST Task가 하나도 없습니다.")
    for r in e2e_rows:
        text = _po_text(r, detail_texts).lower()
        if "playwright" not in text:
            ok = False
            details.append(f"{r['Task ID']}에 'Playwright' 언급이 없습니다.")
        if "chromium" not in text:
            ok = False
            details.append(f"{r['Task ID']}에 'Chromium' 언급이 없습니다.")
    audit.add(15, "Playwright Chromium Smoke Task 존재", ok, details)


# --------------------------------------------------------------------------
# Check 16: forbidden tech / auto-merge in actual (non-Forbidden-section) content
# --------------------------------------------------------------------------

def check_16(audit: Audit, rows: list[dict], detail_texts: dict[str, str]) -> None:
    ok = True
    details: list[str] = []
    for r in rows:
        row_text = (r["Functional AC"] + " " + r["Visual AC"] + " " + r["Security/Privacy AC"]).lower()
        detail_text = strip_forbidden_section(detail_texts.get(r["Task ID"], "")).lower()
        text = row_text + " " + detail_text
        for kw in FORBIDDEN_TECH_KEYWORDS + FORBIDDEN_MERGE_KEYWORDS:
            if kw in text and sentence_violates(text, kw):
                ok = False
                details.append(f"{r['Task ID']}에서 금지어 '{kw}'가 금지 문맥 없이 발견됨")
    audit.add(16, "AWS·EC2·자동 Merge 구현 Task 0", ok, details)


# --------------------------------------------------------------------------
# Checks 17-18: Requirement coverage
# --------------------------------------------------------------------------

def check_17_18(audit: Audit, rows: list[dict], list_text: str) -> None:
    implement_ids, excluded_ids = parse_project_scope_status()
    non_impl_declared = parse_non_implementation_ids(list_text)

    covered_by_tasks: set[str] = set()
    for r in rows:
        covered_by_tasks.update(split_reqs(r["Requirement Ref"]))

    d17: list[str] = []
    ok17 = True
    if len(implement_ids) == 0 and len(excluded_ids) == 0:
        ok17 = False
        d17.append(f"{PROJECT_SCOPE_PATH.relative_to(REPO_ROOT)}에서 REQ 상태를 읽지 못했습니다.")
    else:
        if len(implement_ids) + len(excluded_ids) != 114:
            d17.append(
                f"PROJECT_SCOPE.md의 IMPLEMENT+EXCLUDED 합계가 114가 아닙니다: "
                f"{len(implement_ids)}+{len(excluded_ids)}={len(implement_ids)+len(excluded_ids)}"
            )
        missing_implement = implement_ids - covered_by_tasks
        if missing_implement:
            ok17 = False
            d17.append(
                f"IMPLEMENT {len(missing_implement)}건이 Task List Requirement Ref에 없음: "
                f"{sorted(missing_implement)[:10]}{' ...' if len(missing_implement) > 10 else ''}"
            )
        missing_excluded = excluded_ids - non_impl_declared
        if missing_excluded:
            ok17 = False
            d17.append(
                f"EXCLUDED {len(missing_excluded)}건이 §4 NON_IMPLEMENTATION 표에 없음: "
                f"{sorted(missing_excluded)[:10]}{' ...' if len(missing_excluded) > 10 else ''}"
            )
        all_req_ids = {f"REQ-FUNC-{n:03d}" for n in range(1, 81)} | {f"REQ-NF-{n:03d}" for n in range(1, 35)}
        covered_total = covered_by_tasks | non_impl_declared
        missing_any = all_req_ids - covered_total
        if missing_any:
            ok17 = False
            d17.append(
                f"REQ-FUNC-001~080/REQ-NF-001~034 중 어디에도 없는 ID {len(missing_any)}건: "
                f"{sorted(missing_any)[:10]}{' ...' if len(missing_any) > 10 else ''}"
            )
    audit.add(17, "REQ-FUNC 80개·REQ-NF 34개가 Task 또는 EXCLUDED 표에 존재", ok17, d17)

    # 18: EXCLUDED 요구사항이 구현 Task(Requirement Ref)로 들어가 있지 않아야 한다
    #     (= EXCLUDED에 대한 "상세 구현 파일"이 생성되지 않았음을 의미)
    wrongly_covered = covered_by_tasks & excluded_ids
    d18 = []
    if wrongly_covered:
        d18.append(
            f"EXCLUDED 요구사항인데 Task Requirement Ref에 포함되어 상세 구현 대상이 된 항목: {sorted(wrongly_covered)}"
        )
    # 추가 방어: 파일명이 EXCLUDED REQ ID를 직접 이름으로 쓴 상세 파일이 없는지 확인
    for p in TASKS_DIR.glob("TASK-*.md") if TASKS_DIR.exists() else []:
        stem = p.stem[len("TASK-"):]
        if stem in excluded_ids:
            d18.append(f"{p.name} 파일명이 EXCLUDED 요구사항 ID({stem})와 동일합니다.")
    audit.add(18, "EXCLUDED 상세 구현 파일이 생성되지 않음", len(d18) == 0, d18)


# --------------------------------------------------------------------------
# Output generation
# --------------------------------------------------------------------------

def write_manifest_csv(rows: list[dict], detail_texts: dict[str, str]) -> None:
    TASKS_DIR.mkdir(parents=True, exist_ok=True)
    fieldnames = [
        "seq", "task_id", "title", "category", "implementation_status",
        "screen", "route", "page_entry", "depends_on", "requirement_ref",
        "priority", "detail_file", "detail_file_exists",
    ]
    with MANIFEST_CSV_PATH.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for r in rows:
            tid = r["Task ID"]
            writer.writerow({
                "seq": r["Seq"],
                "task_id": tid,
                "title": r["제목"],
                "category": r["Category"],
                "implementation_status": r["Implementation Status"],
                "screen": r["Screen"],
                "route": r["Route"].strip("`"),
                "page_entry": r["Page Entry"].strip("`"),
                "depends_on": ";".join(split_list(r["Depends On"])),
                "requirement_ref": ";".join(split_reqs(r["Requirement Ref"])),
                "priority": r["Priority"],
                "detail_file": f"TASK-{tid}.md",
                "detail_file_exists": "true" if tid in detail_texts else "false",
            })


def write_audit_report(audit: Audit, rows: list[dict]) -> None:
    lines: list[str] = []
    lines.append("# Traveler Task Audit Report")
    lines.append("")
    lines.append(f"- **Task 총수:** {len(rows)}")
    lines.append(f"- **검사 총수:** {TOTAL_CHECKS}")
    lines.append(f"- **통과:** {audit.passed_count}/{TOTAL_CHECKS}")
    lines.append(f"- **최종 결과:** {'AUDIT_PASS' if audit.ok else 'AUDIT_FAIL'}")
    lines.append("")
    lines.append("입력: `TASKS/00_TASK_LIST.md`, `TASKS/TASK-*.md`, `docs/PROJECT_SCOPE.md`, "
                  "`design-reference/SCREEN_ROUTE_CONTRACT.json`. 산출물: `TASKS/TASK_MANIFEST.csv`, 본 리포트.")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## 검사 결과")
    lines.append("")
    lines.append("| # | 검사 | 결과 |")
    lines.append("|---:|---|---|")
    for r in audit.results:
        lines.append(f"| {r.number} | {r.name} | {'PASS' if r.passed else 'FAIL'} |")
    lines.append("")
    lines.append("## 상세")
    lines.append("")
    for r in audit.results:
        status = "✅ PASS" if r.passed else "❌ FAIL"
        lines.append(f"### {r.number}. {r.name} — {status}")
        lines.append("")
        if r.details:
            for d in r.details:
                lines.append(f"- {d}")
        else:
            lines.append("- (지적 사항 없음)")
        lines.append("")

    category_counts: dict[str, int] = {}
    for r in rows:
        category_counts[r["Category"]] = category_counts.get(r["Category"], 0) + 1
    lines.append("## Category별 Task 수")
    lines.append("")
    lines.append("| Category | 개수 |")
    lines.append("|---|---:|")
    for cat, count in sorted(category_counts.items()):
        lines.append(f"| {cat} | {count} |")
    lines.append(f"| **합계** | **{len(rows)}** |")
    lines.append("")

    AUDIT_REPORT_PATH.write_text("\n".join(lines), encoding="utf-8")


def print_console_report(audit: Audit) -> None:
    print("=" * 60)
    print("Traveler Task Audit")
    print("=" * 60)
    for r in audit.results:
        print(f"[{'PASS' if r.passed else 'FAIL'}] {r.number}. {r.name}")
        for d in r.details:
            print(f"    - {d}")
    print("=" * 60)


# --------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------

def main() -> int:
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8")
        except AttributeError:
            pass

    list_text = read_text(TASK_LIST_PATH)
    if list_text is None:
        print(f"ERROR: {TASK_LIST_PATH.relative_to(REPO_ROOT)} 가 없습니다.")
        return 1

    rows = parse_task_rows(list_text)
    if not rows:
        print(f"ERROR: {TASK_LIST_PATH.relative_to(REPO_ROOT)}에서 Task 행을 파싱하지 못했습니다.")
        return 1

    ids = [r["Task ID"] for r in rows]
    detail_texts, file_problems = load_detail_texts(ids)
    contract = load_screen_route_contract()

    audit = Audit()
    check_1_2_3(audit, rows, detail_texts, file_problems)
    check_4_cycles(audit, rows)
    by_screen = check_5_6_7(audit, rows, contract)
    check_8_9_10(audit, by_screen, detail_texts)
    check_11_12(audit, rows, detail_texts)
    check_13_14(audit, rows, detail_texts)
    check_15(audit, rows, detail_texts)
    check_16(audit, rows, detail_texts)
    check_17_18(audit, rows, list_text)
    audit.sort()

    write_manifest_csv(rows, detail_texts)
    write_audit_report(audit, rows)

    print_console_report(audit)
    print(f"Reports written: {MANIFEST_CSV_PATH.relative_to(REPO_ROOT)}, {AUDIT_REPORT_PATH.relative_to(REPO_ROOT)}")

    if audit.ok:
        print("AUDIT_PASS")
        print(f"Checks passed: {audit.passed_count}/{TOTAL_CHECKS}")
        return 0

    print("AUDIT_FAIL")
    print(f"Checks passed: {audit.passed_count}/{TOTAL_CHECKS}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
