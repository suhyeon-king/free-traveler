#!/usr/bin/env python3
"""
validate_harness.py — Traveler 프로젝트의 Claude Code 하네스(운영 규칙 계층) 자체를 검증한다.

애플리케이션 요구사항이 아니라 "에이전트가 따라야 할 규칙이 실제로 존재하고
서로 일치하는가"를 검사한다. 13개 검사를 순서대로 수행한다.

 1. CLAUDE.md 존재
 2. Claude Code Skill 파일 존재
 3. 7개 Command 존재
 4. traveler-screen-route-v1 Marker 존재
 5. D-001 DESIGN 경로 일치
 6. Screen Contract 경로 일치
 7. Page Owner 5개 규칙 존재
 8. DB Table 6개 기본 범위 존재
 9. 외부 입력 비저장 규칙 존재
10. Playwright Chromium Smoke 규칙 존재
11. AUTO_MERGE=false
12. AWS_ENABLED=false
13. EXCLUDED 보호 규칙 존재

성공 시 stdout에 "VALIDATE_HARNESS_PASS"와 통과한 검사 수를 출력하고 exit 0.
하나라도 실패하면 문제가 있는 파일과 누락된 규칙을 출력하고 exit 1로 종료한다.

표준 라이브러리만 사용한다(외부 의존성 없음). 이 스크립트는 어떤 파일도 수정하지 않는다.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

TOTAL_CHECKS = 13

CLAUDE_MD_PATH = REPO_ROOT / "CLAUDE.md"
SKILL_PATH = REPO_ROOT / ".claude" / "skills" / "traveler-project-pipeline" / "SKILL.md"
COMMANDS_DIR = REPO_ROOT / ".claude" / "commands"

REQUIRED_COMMANDS = [
    "gen-tasklist.md",
    "gen-task-details.md",
    "audit-tasks.md",
    "prepare-task.md",
    "implement-task.md",
    "run-wave.md",
    "release-check.md",
]

EXPECTED_HARNESS_SCHEMA = "traveler-screen-route-v1"
EXPECTED_DESIGN_PATH = "design-reference/D-001/DESIGN.md"
EXPECTED_SCREEN_CONTRACT = "design-reference/SCREEN_ROUTE_CONTRACT.json"

MARKER_BLOCK_RE = re.compile(r"```[^\n]*\n((?:[A-Z_]+=[^\n]*\n?)+)```", re.MULTILINE)
MARKER_LINE_RE = re.compile(r"^([A-Z_]+)=(.*)$")

ALLOWED_DB_TABLES = [
    "profiles", "mate_posts", "mate_applications",
    "user_blocks", "reports", "app_settings",
]


class ValidationError(Exception):
    def __init__(self, check_number: int, check_name: str, reasons: list[str]):
        super().__init__(check_name)
        self.check_number = check_number
        self.check_name = check_name
        self.reasons = reasons


def read_text(path: Path) -> str | None:
    if not path.exists():
        return None
    return path.read_text(encoding="utf-8")


def require(check_number: int, check_name: str, condition: bool, reasons: list[str]) -> None:
    if not condition:
        raise ValidationError(check_number, check_name, reasons)


def parse_harness_markers(claude_md_text: str) -> dict[str, str]:
    """CLAUDE.md의 'Harness Marker' 코드 블록에서 KEY=VALUE 쌍을 추출한다."""
    for match in MARKER_BLOCK_RE.finditer(claude_md_text):
        block = match.group(1)
        markers: dict[str, str] = {}
        for line in block.splitlines():
            m = MARKER_LINE_RE.match(line.strip())
            if m:
                markers[m.group(1)] = m.group(2).strip()
        if "HARNESS_SCHEMA" in markers:
            return markers
    return {}


def sentence_window_has_all(text: str, keywords: list[str], window: int = 200) -> bool:
    """text 안에서 keywords가 모두 window 글자 이내에 함께 등장하는 지점이 있으면 True."""
    lowered = text.lower()
    keywords_lower = [k.lower() for k in keywords]
    first_kw = keywords_lower[0]
    start = 0
    while True:
        idx = lowered.find(first_kw, start)
        if idx == -1:
            return False
        span = lowered[max(0, idx - window): idx + window]
        if all(k in span for k in keywords_lower[1:]):
            return True
        start = idx + 1


def check_1_claude_md_exists() -> str:
    text = read_text(CLAUDE_MD_PATH)
    require(1, "CLAUDE.md 존재", text is not None,
            [f"누락 파일: {CLAUDE_MD_PATH.relative_to(REPO_ROOT)}"])
    return text  # type: ignore[return-value]


def check_2_skill_exists() -> str:
    text = read_text(SKILL_PATH)
    require(2, "Claude Code Skill 파일 존재", text is not None,
            [f"누락 파일: {SKILL_PATH.relative_to(REPO_ROOT)}"])
    return text  # type: ignore[return-value]


def check_3_seven_commands_exist() -> dict[str, str]:
    missing: list[str] = []
    texts: dict[str, str] = {}
    for name in REQUIRED_COMMANDS:
        path = COMMANDS_DIR / name
        text = read_text(path)
        if text is None:
            missing.append(f"누락 파일: {COMMANDS_DIR.relative_to(REPO_ROOT)}/{name}")
        else:
            texts[name] = text

    extra = []
    if COMMANDS_DIR.exists():
        actual = {p.name for p in COMMANDS_DIR.glob("*.md")}
        extra = sorted(actual - set(REQUIRED_COMMANDS))

    reasons = list(missing)
    if len(texts) != 7:
        reasons.append(f"Command 파일 수가 7개가 아닙니다: {len(texts)}개 존재")
    if extra:
        reasons.append(f"참고: 정의된 7개 외 추가 Command 파일 발견 {extra}(오류는 아님)")

    require(3, "7개 Command 존재", len(missing) == 0 and len(texts) == 7,
            [r for r in reasons if not r.startswith("참고")])
    return texts


def check_4_harness_schema_marker(markers: dict[str, str]) -> None:
    value = markers.get("HARNESS_SCHEMA")
    require(
        4, "traveler-screen-route-v1 Marker 존재",
        value == EXPECTED_HARNESS_SCHEMA,
        [f"CLAUDE.md Harness Marker의 HARNESS_SCHEMA 값이 다릅니다: {value!r} != {EXPECTED_HARNESS_SCHEMA!r}"],
    )


def check_5_design_path(markers: dict[str, str]) -> None:
    value = markers.get("DESIGN_PATH")
    reasons: list[str] = []
    if value != EXPECTED_DESIGN_PATH:
        reasons.append(f"CLAUDE.md의 DESIGN_PATH 값이 다릅니다: {value!r} != {EXPECTED_DESIGN_PATH!r}")
    design_file = REPO_ROOT / EXPECTED_DESIGN_PATH
    if not design_file.exists():
        reasons.append(f"실제 파일이 없습니다: {EXPECTED_DESIGN_PATH}")

    manifest_text = read_text(REPO_ROOT / "design-reference" / "DESIGN_MANIFEST.md")
    if manifest_text is not None:
        m = re.search(r"Active File:\*\*\s*`([^`]+)`", manifest_text)
        if m and m.group(1) != EXPECTED_DESIGN_PATH:
            reasons.append(
                f"design-reference/DESIGN_MANIFEST.md의 Active File과 불일치: {m.group(1)!r} != {EXPECTED_DESIGN_PATH!r}"
            )

    require(5, "D-001 DESIGN 경로 일치", len(reasons) == 0, reasons)


def check_6_screen_contract(markers: dict[str, str]) -> None:
    value = markers.get("SCREEN_CONTRACT")
    reasons: list[str] = []
    if value != EXPECTED_SCREEN_CONTRACT:
        reasons.append(f"CLAUDE.md의 SCREEN_CONTRACT 값이 다릅니다: {value!r} != {EXPECTED_SCREEN_CONTRACT!r}")

    contract_path = REPO_ROOT / EXPECTED_SCREEN_CONTRACT
    raw = read_text(contract_path)
    if raw is None:
        reasons.append(f"실제 파일이 없습니다: {EXPECTED_SCREEN_CONTRACT}")
    else:
        try:
            data = json.loads(raw)
            if data.get("schema_version") != EXPECTED_HARNESS_SCHEMA:
                reasons.append(
                    f"{EXPECTED_SCREEN_CONTRACT}의 schema_version이 harness와 다릅니다: "
                    f"{data.get('schema_version')!r}"
                )
        except json.JSONDecodeError as exc:
            reasons.append(f"{EXPECTED_SCREEN_CONTRACT} JSON 파싱 실패: {exc}")

    require(6, "Screen Contract 경로 일치", len(reasons) == 0, reasons)


def check_7_page_owner_rule(combined_text: str) -> None:
    ok = sentence_window_has_all(combined_text, ["page owner", "5개"]) or \
        sentence_window_has_all(combined_text, ["page_owner", "5개"])
    require(7, "Page Owner 5개 규칙 존재", ok,
            ["CLAUDE.md/SKILL.md에서 'Page Owner'와 '5개'가 함께 언급된 규칙을 찾지 못했습니다."])


def check_8_db_table_rule(combined_text: str) -> None:
    has_six_table = sentence_window_has_all(combined_text, ["6개", "테이블"], window=300)
    table_names_present = sum(1 for t in ALLOWED_DB_TABLES if t in combined_text)
    ok = has_six_table and table_names_present >= 4
    reasons = []
    if not has_six_table:
        reasons.append("'6개'와 '테이블'이 함께 언급된 규칙을 찾지 못했습니다.")
    if table_names_present < 4:
        reasons.append(f"6개 기본 테이블 이름이 충분히 언급되지 않았습니다({table_names_present}/6개 이름 발견).")
    require(8, "DB Table 6개 기본 범위 존재", ok, reasons)


def check_9_no_external_input_storage_rule(combined_text: str) -> None:
    ok = (
        sentence_window_has_all(combined_text, ["항공", "숙소", "않는다"], window=400)
        and any(k in combined_text for k in ["서버", "db", "url", "로그"])
    )
    require(9, "외부 입력 비저장 규칙 존재", ok,
            ["항공·숙소 입력값을 서버/DB/URL/로그로 보내지 않는다는 규칙 문구를 찾지 못했습니다."])


def check_10_playwright_chromium_rule(combined_text: str, markers: dict[str, str]) -> None:
    has_text_rule = sentence_window_has_all(combined_text, ["chromium", "smoke"])
    scope_marker_ok = markers.get("PLAYWRIGHT_SCOPE") == "chromium-smoke"
    ok = has_text_rule or scope_marker_ok
    require(10, "Playwright Chromium Smoke 규칙 존재", ok,
            ["'Chromium'과 'Smoke'가 함께 언급된 규칙, 또는 PLAYWRIGHT_SCOPE=chromium-smoke 마커를 찾지 못했습니다."])


def check_11_auto_merge_false(markers: dict[str, str]) -> None:
    value = markers.get("AUTO_MERGE")
    require(11, "AUTO_MERGE=false", value == "false",
            [f"CLAUDE.md Harness Marker의 AUTO_MERGE 값이 다릅니다: {value!r} != 'false'"])


def check_12_aws_enabled_false(markers: dict[str, str]) -> None:
    value = markers.get("AWS_ENABLED")
    require(12, "AWS_ENABLED=false", value == "false",
            [f"CLAUDE.md Harness Marker의 AWS_ENABLED 값이 다릅니다: {value!r} != 'false'"])


def check_13_excluded_protection_rule(combined_text: str) -> None:
    ok = sentence_window_has_all(combined_text, ["excluded", "구현"], window=200) or \
        sentence_window_has_all(combined_text, ["excluded", "만들지"], window=200)
    require(13, "EXCLUDED 보호 규칙 존재", ok,
            ["EXCLUDED로 분류된 기능을 임의로 구현하지 않는다는 규칙 문구를 찾지 못했습니다."])


def main() -> int:
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8")
        except AttributeError:
            pass

    passed = 0
    try:
        claude_md_text = check_1_claude_md_exists()
        passed += 1

        skill_text = check_2_skill_exists()
        passed += 1

        command_texts = check_3_seven_commands_exist()
        passed += 1

        markers = parse_harness_markers(claude_md_text)
        if not markers:
            raise ValidationError(
                4, "traveler-screen-route-v1 Marker 존재",
                ["CLAUDE.md에서 Harness Marker 코드 블록(HARNESS_SCHEMA=... 포함)을 찾지 못했습니다."],
            )

        check_4_harness_schema_marker(markers)
        passed += 1

        check_5_design_path(markers)
        passed += 1

        check_6_screen_contract(markers)
        passed += 1

        combined_text = claude_md_text + "\n" + skill_text + "\n" + "\n".join(command_texts.values())

        check_7_page_owner_rule(combined_text)
        passed += 1

        check_8_db_table_rule(combined_text)
        passed += 1

        check_9_no_external_input_storage_rule(combined_text)
        passed += 1

        check_10_playwright_chromium_rule(combined_text, markers)
        passed += 1

        check_11_auto_merge_false(markers)
        passed += 1

        check_12_aws_enabled_false(markers)
        passed += 1

        check_13_excluded_protection_rule(combined_text)
        passed += 1

    except ValidationError as err:
        print(f"[validate_harness] FAIL at check {err.check_number}/{TOTAL_CHECKS}: {err.check_name}")
        for reason in err.reasons:
            print(f"  - {reason}")
        print(f"\n[validate_harness] {passed}/{TOTAL_CHECKS} checks passed before failure.")
        return 1

    print("VALIDATE_HARNESS_PASS")
    print(f"Checks passed: {passed}/{TOTAL_CHECKS}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
