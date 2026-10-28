# C++ platform — implementation progress

Tracks the CodeMentor master prompts. The C++ course is complete (127 lessons); what is left is verification on the real server — see "Remaining".
Exact lesson status: [CPP_CURRICULUM_MANIFEST.md](CPP_CURRICULUM_MANIFEST.md) (generated).
Launch readiness: [CODE_MENTOR_LAUNCH_STATUS.md](CODE_MENTOR_LAUNCH_STATUS.md).

## Phase 1 — audit and restructure ✅
17-module roadmap, Functions (6) and Arrays & strings (7) modules, recursion call-stack trace,
generated manifest, regression tests. Details: [CODE_MENTOR_AUDIT.md](CODE_MENTOR_AUDIT.md).

## Milestone 1 — unlock fix ✅
Root cause: planned concepts on the "full path" rendered as locks with no link. 12 new lessons
(pointers, OOP, STL, complexity, binary search, sorting); concept → lesson mapping; Skill Map and
recommender fixed; `<memory>` allowed in the sandbox; access tests (unit + Playwright, guest and
signed-in).

## Milestone 2 — complete curriculum ✅ (with stated gaps)
- 21 new lessons: Modern C++ (3), Data structures (4), Algorithms (5), Files/exceptions/debugging (3),
  Advanced C++ (3), Projects (3). **All 17 modules have published lessons — 68 in total.**
- Knowledge checks written for the 12 older lessons that lacked one; validator now enforces quick
  checks, ≥2 mistakes, 4 hints, sample tests and hidden tests (for exercises with input).
- Concept "full path" extended with the six new areas; Problem Solving track activated.
- Sandbox headers added: stdexcept, exception, optional, string_view, cassert.
- Security: dependency advisories fixed (0 production vulnerabilities).

## Milestone 3 — everything the audit listed as missing ✅
- **Practice question banks** for every C++ concept (adaptive engine: MCQ, predict output, find the
  error, complete code, reorder, trace, write code, explain), each predict-output answer checked by
  running the code.
- **Three graded problems per lesson**: the lesson exercise (beginner) plus intermediate and challenge
  practice problems — 381 judged exercises, each with a compiled reference solution and hidden tests.
- **All 59 planned lessons written** — 127 lessons, 0 planned topics. Topics the sandbox can't run
  (threads, CMake, Git, multi-file builds, `std::filesystem`) show the real code as reading and are
  practised with deterministic simulations.
- **C++20** in the sandbox (`-std=c++20`, C++20 library headers allowed).
- **Practice Arena**: 60 judged problems (was 11); the Daily Challenge pool grows to 32 from
  2026-10-29 without changing past days.
- **"Complete the code"** mode for 362 of 381 exercises: up to three key lines blanked; answers are
  judged by the real tests; 10 XP; doesn't complete the lesson.
- **Visualisers**: 14 dry-run traces (arrays with index markers, call stacks), plus memory boxes,
  a complexity growth chart and stack vs queue.
- **Account recovery without email**: recovery codes, reset links from admins or linked parents,
  change password; migration 0005.
- **VPS launch kit**: `deploy/vps/install.sh`, release-based `update.sh` with backup and automatic
  rollback, verified backups, restore tests, health alerts, cron.
- **Local sandbox backend for macOS/Linux** development (ulimit + sandbox-exec / unshare).
- UX: phone layout fixes (lesson footer, home cards).

## Remaining (not done)
- Real AI provider verification (needs API keys on staging).
- Running the launch kit on the real VPS (Docker + gVisor sandbox tests, HTTPS, alerts).
- A human review of lesson wording; correctness is compiler-verified but clarity isn't.


## How to verify

```bash
npx tsc --noEmit
```

```bash
npx vitest run tests/course-content.test.ts
```

```bash
npx playwright test e2e/course-access.spec.ts
```

```bash
npm run content:validate
```
