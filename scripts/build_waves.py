#!/usr/bin/env python3
"""
build_waves.py — Traveler Task 그래프를 Wave 단위 실행 계획으로 자동 배치한다.

입력:
  - TASKS/TASK_MANIFEST.csv                      (Task ID·Category·Screen·Depends On 정본, scripts/audit_tasks.py 산출물)
  - TASKS/TASK-*.md                               (Expected Files 파일 충돌 검사용)
  - design-reference/SCREEN_ROUTE_CONTRACT.json   (Screen별 Route — Preview Checkpoint 문구용)

출력:
  - TASKS/TASK_DAG.md      (Depends On 그래프 + 순환 의존성 검사 결과, 사람이 읽는 문서)
  - TASKS/WAVE_PLAN.md     (.claude/commands/run-wave.md 가 읽는 WAVE_PLAN 정본)
  - TASKS/WAVE_STATE.json  (Wave별 초기 상태 — 전체 Wave 목록의 기계 판독 스냅샷. run-wave.md가
                             소유·갱신하는 TASKS/WAVE_STATE.md(단일 Active Wave 포인터, Markdown)와는
                             별개 파일이며 이 스크립트는 그 파일을 건드리지 않는다.)
  - TASKS/TASK_MANIFEST.csv 에 wave_id 열 추가(기존 열 보존, 마지막 열로 추가)

주의: TASKS/TASK_MANIFEST.csv는 scripts/audit_tasks.py가 소유·재생성하는 파일이다.
audit_tasks.py를 이 스크립트 이후에 다시 실행하면 wave_id 열이 사라진다 — 그 경우
build_waves.py를 다시 실행해 wave_id 열을 복원해야 한다.

Wave 배치 규칙:
  1. Depends On 그래프의 순환 의존성을 검사한다(발견 시 출력 파일을 만들지 않고 exit 1).
  2. 선행 Task가 뒤 Wave에 배치되지 않도록, 전체 순서를 위상 정렬로만 만들고
     그 순서를 그대로 앞에서부터 나눠 Wave를 구성한다(사후 재배치를 하지 않는다 —
     "최대 3회 자동 수정" 같은 재시도 로직을 두지 않는다).
  3. Wave당 기본 4~7개 Task를 배치한다(Wave 그룹 경계·파일 충돌 회피로 이보다 작아질 수 있음).
  4. Page Owner(PAGE_OWNER Category)는 자신이 의존하는 모든 Component/Data/DB/Infra Task보다
     뒤에 와야 하므로, 위상 정렬 특성상 항상 해당 Screen 그룹의 마지막 Task로 배치된다.
  5. 같은 Wave 안에서 Expected Files가 겹치는 Task가 생기면 그 지점에서 Wave를 새로 시작한다.
  6. 한 Wave 안의 task_ids 배열은 실행해야 할 순서 그대로(Depends On 순서)로 기록한다 —
     run-wave.md는 이 순서대로 한 번에 하나씩 실행한다.
  7. 자동 재시도·자동 수정 로직을 두지 않는다. 실패 시 사유를 출력하고 exit 1로 끝난다.
  8. 자동 Git Branch 생성·PR 생성·Merge 기능을 포함하지 않는다(이 스크립트는 git을 전혀 다루지 않는다).

Wave 그룹 순서(고정 10개, Wave ID 자체는 W00~W10으로 고정하지 않는다):
  1. Scaffold, 문서, Harness 확인
  2. Airbnb 스타일 공통 UI, 정적 데이터, Layout
  3. Supabase Auth, 6개 Table, 기본 RLS
  4. SCR-001 메인 Component와 Page Owner
  5. SCR-002 대표 소개 Component와 Page Owner
  6. SCR-003 여행 입력·외부 이동·동행글 입력 Component와 Page Owner
  7. SCR-004 동행 목록·상세·신청 Component와 Page Owner
  8. SCR-005 계정·내 활동·간단 관리자 Component와 Page Owner
  9. Unit·Playwright·접근성·CI
  10. Vercel Preview와 Release 확인

표준 라이브러리만 사용한다(외부 의존성 없음). 이 스크립트는 TASKS/00_TASK_LIST.md나
TASKS/TASK-*.md의 내용을 수정하지 않는다(Expected Files는 읽기만 한다).
"""

from __future__ import annotations

import csv
import heapq
import json
import re
import sys
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

TASKS_DIR = REPO_ROOT / "TASKS"
MANIFEST_CSV_PATH = TASKS_DIR / "TASK_MANIFEST.csv"
SCREEN_ROUTE_CONTRACT_PATH = REPO_ROOT / "design-reference" / "SCREEN_ROUTE_CONTRACT.json"

TASK_DAG_PATH = TASKS_DIR / "TASK_DAG.md"
WAVE_PLAN_PATH = TASKS_DIR / "WAVE_PLAN.md"
WAVE_STATE_JSON_PATH = TASKS_DIR / "WAVE_STATE.json"

WAVE_STATE_SCHEMA_VERSION = "traveler-wave-state-v1"
MIN_WAVE_SIZE = 4
MAX_WAVE_SIZE = 7

GROUP_TITLES: dict[int, str] = {
    1: "Scaffold, 문서, Harness 확인",
    2: "Airbnb 스타일 공통 UI, 정적 데이터, Layout",
    3: "Supabase Auth, 6개 Table, 기본 RLS",
    4: "SCR-001 메인 Component와 Page Owner",
    5: "SCR-002 대표 소개 Component와 Page Owner",
    6: "SCR-003 여행 입력·외부 이동·동행글 입력 Component와 Page Owner",
    7: "SCR-004 동행 목록·상세·신청 Component와 Page Owner",
    8: "SCR-005 계정·내 활동·간단 관리자 Component와 Page Owner",
    9: "Unit·Playwright·접근성·CI",
    10: "Vercel Preview와 Release 확인",
}

# Wave 그룹 4~8은 해당 Screen의 Page Owner Task가 포함된 마지막 Wave에서 Preview Checkpoint가 발생한다.
SCREEN_GROUP_TO_SCREEN_ID = {4: "SCR-001", 5: "SCR-002", 6: "SCR-003", 7: "SCR-004", 8: "SCR-005"}
FINAL_CHECKPOINT_GROUP = 10

EXPECTED_FILES_SECTION_RE = re.compile(r"## Expected Files\n(.*?)\n## ", re.DOTALL)
FILE_TOKEN_RE = re.compile(r"`([^`]+)`")


# --------------------------------------------------------------------------
# Data model
# --------------------------------------------------------------------------

@dataclass
class Wave:
    wave_id: str
    group: int
    task_ids: list[str]
    checkpoint: str
    checkpoint_required: bool


@dataclass
class BuildError(Exception):
    message: str
    details: list[str] = field(default_factory=list)


# --------------------------------------------------------------------------
# Loading
# --------------------------------------------------------------------------

def read_text(path: Path) -> str | None:
    if not path.exists():
        return None
    return path.read_text(encoding="utf-8")


def load_manifest_rows() -> list[dict]:
    text = read_text(MANIFEST_CSV_PATH)
    if text is None:
        raise BuildError(f"{MANIFEST_CSV_PATH.relative_to(REPO_ROOT)} 가 없습니다. "
                          f"먼저 scripts/audit_tasks.py를 실행해 생성하세요.")
    rows = list(csv.DictReader(text.splitlines()))
    if not rows:
        raise BuildError(f"{MANIFEST_CSV_PATH.relative_to(REPO_ROOT)} 에 Task 행이 없습니다.")
    for r in rows:
        r["depends_on"] = [d for d in r.get("depends_on", "").split(";") if d]
    return rows


def load_screen_routes() -> dict[str, str]:
    text = read_text(SCREEN_ROUTE_CONTRACT_PATH)
    if text is None:
        return {}
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        return {}
    return {s.get("screen_id"): s.get("route", "") for s in data.get("screens", [])}


def load_expected_files() -> dict[str, set[str]]:
    result: dict[str, set[str]] = {}
    if not TASKS_DIR.exists():
        return result
    for p in TASKS_DIR.glob("TASK-*.md"):
        tid = p.stem[len("TASK-"):]
        text = p.read_text(encoding="utf-8")
        m = EXPECTED_FILES_SECTION_RE.search(text + "\n## ")
        files: set[str] = set()
        if m:
            for token in FILE_TOKEN_RE.findall(m.group(1)):
                token = token.strip()
                if "/" in token:
                    files.add(token)
        result[tid] = files
    return result


# --------------------------------------------------------------------------
# Classification (Wave 그룹 1~10)
# --------------------------------------------------------------------------

def classify_group(row: dict) -> int:
    tid, cat, screen = row["task_id"], row["category"], row["screen"]

    if cat == "INFRA":
        return 3 if tid == "INFRA-AUTH" else 1
    if cat in ("SHARED", "DATA"):
        return 2
    if cat == "DB":
        return 3
    if cat in ("COMPONENT", "PAGE_OWNER"):
        m = re.match(r"SCR-00(\d)", screen or "")
        if not m or not (1 <= int(m.group(1)) <= 5):
            raise BuildError(f"{tid}: COMPONENT/PAGE_OWNER Task인데 Screen이 SCR-001~005 형식이 아닙니다"
                              f" (screen={screen!r}).")
        return 3 + int(m.group(1))
    if cat in ("UNIT_TEST", "INTEGRATION_TEST", "E2E_TEST", "MANUAL_CHECK"):
        return 9
    if cat == "CI_DEPLOY":
        return 9 if tid == "CI-LINT-TYPECHECK-TEST" else 10
    if cat == "RELEASE_CHECK":
        return 10

    raise BuildError(f"{tid}: Wave 그룹으로 분류할 수 없는 Category입니다 (category={cat!r}). "
                      f"scripts/build_waves.py의 classify_group()에 규칙을 추가해야 합니다.")


# --------------------------------------------------------------------------
# Cycle detection (DFS) — 규칙 1
# --------------------------------------------------------------------------

def detect_cycles(rows: list[dict]) -> list[str]:
    ids = {r["task_id"] for r in rows}
    graph = {r["task_id"]: [d for d in r["depends_on"] if d in ids] for r in rows}
    WHITE, GRAY, BLACK = 0, 1, 2
    color = {tid: WHITE for tid in graph}
    cycles: list[str] = []

    def dfs(node: str, path: list[str]) -> None:
        color[node] = GRAY
        path.append(node)
        for dep in graph.get(node, []):
            if color.get(dep) == GRAY:
                start = path.index(dep)
                cycles.append(" -> ".join(path[start:] + [dep]))
            elif color.get(dep) == WHITE:
                dfs(dep, path)
        path.pop()
        color[node] = BLACK

    for tid in sorted(graph):
        if color[tid] == WHITE:
            dfs(tid, [])
    return cycles


def detect_dangling_dependencies(rows: list[dict]) -> list[str]:
    ids = {r["task_id"] for r in rows}
    dangling = []
    for r in rows:
        for dep in r["depends_on"]:
            if dep not in ids:
                dangling.append(f"{r['task_id']} -> {dep} (존재하지 않는 Task ID)")
    return dangling


# --------------------------------------------------------------------------
# Topological order — 규칙 2("선행 Task가 뒤 Wave에 배치되면 실패")를 구조적으로 보장한다.
# --------------------------------------------------------------------------

def topological_order(rows: list[dict]) -> list[str]:
    ids = [r["task_id"] for r in rows]
    id_set = set(ids)
    depends_on = {r["task_id"]: [d for d in r["depends_on"] if d in id_set] for r in rows}
    group_of = {r["task_id"]: classify_group(r) for r in rows}

    dependents: dict[str, list[str]] = {tid: [] for tid in ids}
    indegree = {tid: len(depends_on[tid]) for tid in ids}
    for tid, deps in depends_on.items():
        for d in deps:
            dependents[d].append(tid)

    heap = [(group_of[tid], tid) for tid in ids if indegree[tid] == 0]
    heapq.heapify(heap)

    order: list[str] = []
    while heap:
        _, tid = heapq.heappop(heap)
        order.append(tid)
        for nxt in dependents[tid]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                heapq.heappush(heap, (group_of[nxt], nxt))

    if len(order) != len(ids):
        # detect_cycles()가 이미 앞서 걸러내므로 정상 흐름에서는 도달하지 않는다.
        remaining = sorted(set(ids) - set(order))
        raise BuildError("위상 정렬을 완료하지 못했습니다(순환 의존성 재확인 필요).", remaining)

    return order


# --------------------------------------------------------------------------
# Wave chunking — 규칙 3·5
# --------------------------------------------------------------------------

def chunk_into_waves(order: list[str], rows_by_id: dict[str, dict],
                      expected_files: dict[str, set[str]]) -> list[tuple[int, list[str]]]:
    """(group, task_ids) 튜플 목록을 반환한다. 그룹 경계, 최대 크기, 파일 충돌 시 새 Wave를 시작한다."""
    chunks: list[tuple[int, list[str]]] = []
    current_group: int | None = None
    current_tasks: list[str] = []
    current_files: set[str] = set()

    def flush() -> None:
        if current_tasks:
            chunks.append((current_group, list(current_tasks)))

    for tid in order:
        g = classify_group(rows_by_id[tid])
        files = expected_files.get(tid, set())
        conflict = bool(current_files & files)
        group_changed = current_group is not None and g != current_group
        size_full = len(current_tasks) >= MAX_WAVE_SIZE

        if group_changed or size_full or conflict:
            flush()
            current_group = g
            current_tasks = []
            current_files = set()
        elif current_group is None:
            current_group = g

        current_tasks.append(tid)
        current_files |= files

    flush()
    return chunks


def verify_no_reordering(waves: list[Wave], rows_by_id: dict[str, dict]) -> list[str]:
    """규칙 2 사후 검증: 모든 Depends On 간선에 대해 선행 Task가 같은 Wave에서 더 앞이거나,
    더 앞선 Wave에 있어야 한다. 위반 시 문자열 목록을 반환한다(빈 목록이면 OK)."""
    wave_index_of: dict[str, int] = {}
    position_in_wave: dict[str, int] = {}
    for wi, w in enumerate(waves):
        for pos, tid in enumerate(w.task_ids):
            wave_index_of[tid] = wi
            position_in_wave[tid] = pos

    violations: list[str] = []
    for tid, row in rows_by_id.items():
        for dep in row["depends_on"]:
            if dep not in wave_index_of or tid not in wave_index_of:
                continue
            dep_wave, task_wave = wave_index_of[dep], wave_index_of[tid]
            if dep_wave > task_wave:
                violations.append(f"{dep}(Wave {dep_wave + 1}) 이(가) 이를 의존하는 {tid}(Wave {task_wave + 1})"
                                   f" 보다 뒤 Wave에 배치됨")
            elif dep_wave == task_wave and position_in_wave[dep] > position_in_wave[tid]:
                violations.append(f"{dep} 이(가) 같은 Wave({dep_wave + 1}) 안에서 이를 의존하는 {tid} 보다 뒤에 배치됨")
    return violations


# --------------------------------------------------------------------------
# Wave assembly (ID·Preview Checkpoint 부여)
# --------------------------------------------------------------------------

def assign_waves(chunks: list[tuple[int, list[str]]], rows_by_id: dict[str, dict],
                  screen_routes: dict[str, str]) -> list[Wave]:
    waves: list[Wave] = []
    # 각 Screen 그룹(4~8)에서 PAGE_OWNER Task를 포함하는 마지막 chunk 인덱스를 찾는다.
    page_owner_chunk_index: dict[int, int] = {}
    for idx, (group, task_ids) in enumerate(chunks):
        for tid in task_ids:
            if rows_by_id[tid]["category"] == "PAGE_OWNER":
                page_owner_chunk_index[group] = idx

    last_group10_index = max((idx for idx, (g, _) in enumerate(chunks) if g == FINAL_CHECKPOINT_GROUP), default=None)

    for idx, (group, task_ids) in enumerate(chunks):
        wave_id = f"W{idx + 1:02d}"
        checkpoint = "없음"
        checkpoint_required = False

        screen_id = SCREEN_GROUP_TO_SCREEN_ID.get(group)
        if screen_id and page_owner_chunk_index.get(group) == idx:
            route = screen_routes.get(screen_id, "")
            checkpoint = f"{screen_id}(`{route}`) Preview 확인"
            checkpoint_required = True
        elif group == FINAL_CHECKPOINT_GROUP and idx == last_group10_index:
            checkpoint = "FINAL — 전체 Release 확인(`/release-check` RELEASE_READY)"
            checkpoint_required = True

        waves.append(Wave(wave_id=wave_id, group=group, task_ids=task_ids,
                           checkpoint=checkpoint, checkpoint_required=checkpoint_required))
    return waves


# --------------------------------------------------------------------------
# Output writers
# --------------------------------------------------------------------------

def write_task_dag(rows: list[dict], rows_by_id: dict[str, dict], cycles: list[str],
                    dangling: list[str]) -> None:
    lines: list[str] = []
    lines.append("# Traveler Task Dependency Graph (TASK_DAG)")
    lines.append("")
    lines.append("- **생성:** `scripts/build_waves.py`")
    lines.append(f"- **Task 총수:** {len(rows)}")
    lines.append(f"- **순환 의존성:** {len(cycles)}건")
    lines.append(f"- **끊어진 의존성 참조(Depends On 대상 미존재):** {len(dangling)}건")
    lines.append("")
    lines.append("이 문서는 `TASKS/TASK_MANIFEST.csv`의 `depends_on` 열을 그대로 반영한 것이며, "
                  "이 스크립트가 직접 만든 값이 아니다(정본은 `TASKS/00_TASK_LIST.md`).")
    lines.append("")
    lines.append("---")
    lines.append("")

    if cycles:
        lines.append("## 순환 의존성")
        lines.append("")
        for c in cycles:
            lines.append(f"- {c}")
        lines.append("")

    if dangling:
        lines.append("## 끊어진 의존성 참조")
        lines.append("")
        for d in dangling:
            lines.append(f"- {d}")
        lines.append("")

    lines.append("## Task별 Depends On")
    lines.append("")
    lines.append("| Task ID | Category | Screen | Depends On |")
    lines.append("|---|---|---|---|")
    for r in rows:
        deps = ", ".join(r["depends_on"]) if r["depends_on"] else "없음"
        lines.append(f"| {r['task_id']} | {r['category']} | {r['screen'] or '—'} | {deps} |")
    lines.append("")

    TASK_DAG_PATH.write_text("\n".join(lines), encoding="utf-8")


def write_wave_plan(waves: list[Wave], generated_at: str) -> None:
    lines: list[str] = []
    lines.append("# Traveler Wave Plan (WAVE_PLAN)")
    lines.append("")
    lines.append("- **Document ID:** WAVE-PLAN-001")
    lines.append("- **schema_version:** traveler-wave-plan-v1")
    lines.append("- **생성:** `scripts/build_waves.py` (자동 생성 — 사람이 직접 편집하지 않는다. "
                  "Task 그래프가 바뀌면 스크립트를 다시 실행해 재생성한다.)")
    lines.append(f"- **generated_at:** {generated_at}")
    lines.append("")
    lines.append("`.claude/commands/run-wave.md`가 참조하는 WAVE_PLAN(`TASKS/WAVES.md`) 정본이다. "
                  "Wave ID는 W00~W10으로 사전에 고정하지 않았으며, 아래 표의 실제 값이 정본이다.")
    lines.append("")
    lines.append("## Wave 그룹 순서")
    lines.append("")
    for g in range(1, 11):
        lines.append(f"{g}. {GROUP_TITLES[g]}")
    lines.append("")
    lines.append("## Wave 목록")
    lines.append("")
    lines.append("| Wave ID | Wave 그룹 | Task IDs (Depends On 순서) | Preview Checkpoint |")
    lines.append("|---|---|---|---|")
    for w in waves:
        lines.append(f"| {w.wave_id} | {w.group}. {GROUP_TITLES[w.group]} | {', '.join(w.task_ids)} | {w.checkpoint} |")
    lines.append("")

    TASK_DAG_LINK = TASK_DAG_PATH.name
    lines.append(f"Depends On 원본 그래프와 순환 의존성 검사 결과는 `TASKS/{TASK_DAG_LINK}`를 참고한다.")
    lines.append("")

    WAVE_PLAN_PATH.write_text("\n".join(lines), encoding="utf-8")


def write_wave_state_json(waves: list[Wave], generated_at: str) -> None:
    data = {
        "schema_version": WAVE_STATE_SCHEMA_VERSION,
        "generated_at": generated_at,
        "waves": [
            {
                "wave_id": w.wave_id,
                "title": f"{w.group}. {GROUP_TITLES[w.group]}",
                "task_ids": w.task_ids,
                "status": "pending",
                "checkpoint_required": w.checkpoint_required,
                "checkpoint_result": None,
            }
            for w in waves
        ],
    }
    WAVE_STATE_JSON_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_manifest_wave_id(rows: list[dict], wave_id_of: dict[str, str]) -> None:
    text = read_text(MANIFEST_CSV_PATH)
    reader = csv.DictReader(text.splitlines())
    fieldnames = list(reader.fieldnames or [])
    if "wave_id" not in fieldnames:
        fieldnames.append("wave_id")
    out_rows = []
    for row in reader:
        row["wave_id"] = wave_id_of.get(row["task_id"], "")
        out_rows.append(row)
    with MANIFEST_CSV_PATH.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(out_rows)


# --------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------

def main() -> int:
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8")
        except AttributeError:
            pass

    try:
        rows = load_manifest_rows()
    except BuildError as e:
        print(f"ERROR: {e.message}")
        for d in e.details:
            print(f"  - {d}")
        return 1

    rows_by_id = {r["task_id"]: r for r in rows}

    dangling = detect_dangling_dependencies(rows)
    if dangling:
        print("ERROR: 끊어진 의존성 참조가 있어 Wave를 배치할 수 없습니다.")
        for d in dangling:
            print(f"  - {d}")
        return 1

    cycles = detect_cycles(rows)
    if cycles:
        print("ERROR: 순환 의존성이 발견되어 Wave를 배치할 수 없습니다.")
        for c in cycles:
            print(f"  - {c}")
        print(f"순환 의존성 수: {len(cycles)}")
        return 1

    try:
        for r in rows:
            classify_group(r)  # 분류 불가 Task를 조기에 명확히 보고한다.
        order = topological_order(rows)
    except BuildError as e:
        print(f"ERROR: {e.message}")
        for d in e.details:
            print(f"  - {d}")
        return 1

    expected_files = load_expected_files()
    screen_routes = load_screen_routes()

    chunks = chunk_into_waves(order, rows_by_id, expected_files)
    waves = assign_waves(chunks, rows_by_id, screen_routes)

    violations = verify_no_reordering(waves, rows_by_id)
    if violations:
        print("ERROR: Wave 배치 후 검증에서 '선행 Task가 뒤 Wave에 배치됨' 위반이 발견되었습니다"
              "(스크립트 내부 로직 오류 — 출력 파일을 만들지 않았습니다).")
        for v in violations:
            print(f"  - {v}")
        return 1

    generated_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
    write_task_dag(rows, rows_by_id, cycles, dangling)
    write_wave_plan(waves, generated_at)
    write_wave_state_json(waves, generated_at)
    wave_id_of = {tid: w.wave_id for w in waves for tid in w.task_ids}
    write_manifest_wave_id(rows, wave_id_of)

    # --- 종료 보고 ---
    print("=" * 60)
    print("Traveler Wave Build")
    print("=" * 60)
    print(f"순환 의존성 수: {len(cycles)}")
    print("")
    print("Wave별 Task 수:")
    for w in waves:
        flag = "  [Preview Checkpoint]" if w.checkpoint_required else ""
        print(f"  {w.wave_id} (그룹 {w.group}. {GROUP_TITLES[w.group]}): {len(w.task_ids)}개{flag}")
        if not (MIN_WAVE_SIZE <= len(w.task_ids) <= MAX_WAVE_SIZE):
            print(f"    ※ 기본 범위({MIN_WAVE_SIZE}~{MAX_WAVE_SIZE}개)를 벗어남"
                  f"(그룹 경계 또는 파일 충돌 회피로 인한 예외)")
    print("")
    print("Page Owner 위치:")
    for w in waves:
        for tid in w.task_ids:
            if rows_by_id[tid]["category"] == "PAGE_OWNER":
                print(f"  {tid} -> {w.wave_id} ({w.checkpoint})")
    print("=" * 60)
    print(f"Reports written: {TASK_DAG_PATH.relative_to(REPO_ROOT)}, {WAVE_PLAN_PATH.relative_to(REPO_ROOT)}, "
          f"{WAVE_STATE_JSON_PATH.relative_to(REPO_ROOT)}, {MANIFEST_CSV_PATH.relative_to(REPO_ROOT)}(wave_id 열 추가)")
    print("BUILD_WAVES_PASS")
    print(f"Wave 총수: {len(waves)}, Task 총수: {len(rows)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
