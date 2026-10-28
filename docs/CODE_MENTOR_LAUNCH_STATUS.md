# CodeMentor — launch status

Last updated: 2026-10-27 (Milestone 2). **Verdict: NO-GO for public launch** — see §8.
Lesson-level detail: [CPP_CURRICULUM_MANIFEST.md](CPP_CURRICULUM_MANIFEST.md) (generated from the code).
Earlier audit: [CODE_MENTOR_AUDIT.md](CODE_MENTOR_AUDIT.md).

## 1. Root cause of the locked lessons (verified, fixed in Milestone 1)

The list "12. 2D Arrays & Matrices — needs Arrays, Nested Loops … 18. Recursion — needs Functions" is
**"The full path"** on `/app/learn`, built from the adaptive engine's concept graph in
`src/content/curriculum.ts` — not from the step-by-step lesson path.

Lifecycle traced: `CONCEPTS` → `syncContent` (DB `concepts` table) → `skillMap()`
(`src/server/services/learner.ts`) → `src/app/app/learn/page.tsx`. The seven concepts were
`status: "planned"` with `skills: []`, their tracks were `planned`, and the page rendered any planned
concept as `<Lock/> coming later` **with no link**. No route guard, progress gate or API check was
involved: the rows had no destination, and five of the seven topics had no lesson content at all.
`/app/skills` showed the same lock badge per track. "needs: …" was advice that read like a requirement.

Fix: real lessons for every topic; each concept now lists its `courseLessons` (validated ids); rows
show Open/Continue with real `done/total`; "Best after: …" replaces "needs: …"; the recommender links the
course lesson instead of saying "hasn't been built yet". Progress records are never used to unlock.

## 2. Milestone 2 — complete curriculum

All 17 areas now have published, compiler-verified lessons (68 total). New in Milestone 2:

| Module | Lessons |
|---|---|
| 10 Modern C++ | auto & lambdas · templates · optional / string_view / enum class (+ C++20/23 overview) |
| 13 Data structures | linked lists · trees & BST · hash tables & heaps · graphs (BFS/DFS) |
| 14 Algorithms | prefix sums / two pointers / sliding window · greedy · backtracking · dynamic programming · bits & number theory |
| 15 Files, exceptions, debugging | streams & parsing · exceptions · debugging & testing |
| 16 Advanced C++ | RAII & ownership · copy/move & rule of five · undefined behaviour |
| 17 Projects | grade manager · bank system · library capstone |

Also: a knowledge-check question was written for the 12 older lessons that had none; the validator
now **refuses to publish** a lesson without a quick check (3+ options, each with feedback), at least two
common mistakes, four hints, a sample test, and hidden tests for any exercise that reads input.

Honest limits of the content:
- Each lesson has **one** coding exercise + **one** quiz question. The spec's "three practice problems
  (beginner/intermediate/challenge)" per lesson is **not met** yet.
- Topics the sandbox cannot run are kept as *planned* (threads, CMake, Git, `std::filesystem`, multi-file
  builds). File streams are taught in text; runnable examples use string streams (same interface).
- The sandbox compiles C++20 (since 2026-10-28). C++23 features are described, not executed.
- Remaining planned topics per module are listed in the manifest.

## 3. Sandbox header policy changes

Added `<memory>`, `<stdexcept>`, `<exception>`, `<optional>`, `<string_view>`, `<cassert>` — library-only,
no OS access. `<fstream>`, `<thread>`, `<filesystem>`, processes, `#define`, quoted includes stay blocked
(policy tests in `tests/sandbox.test.ts`). **The sandbox worker must be restarted on deploy.**

## 4. Features

| Feature | Status |
|---|---|
| All C++ lessons open without locks; prev/next across all 17 modules | working, tested (unit + browser) |
| Editor (Monaco + plain-text fallback), Run with stdin, Reset, Check | working (existing) |
| Verdicts: accepted / wrong answer / compile error / runtime error / time limit / memory limit / output limit | working (existing judge) |
| Hidden tests; reveal one failing hidden case on request | working (existing) |
| Knowledge check per lesson with per-option feedback | working, all 68 lessons |
| Dry-run visualiser (4 traces incl. recursion call stack), checked against g++ | working |
| Progressive hints 1–4 + worked solution on explicit request (reduced XP) | working (existing) |
| AI mentor (Claude/OpenAI) | optional; curated fallback works; **real provider calls NOT VERIFIED** |
| Guest learning; per-lesson server progress; Continue | working |
| 3 practice problems per lesson | **not implemented** |
| Modes: Predict output (quick checks), Fix the bug (e.g. scope, debugging lessons), Coding challenge, Guided project (Module 17) | present |
| Mode: Complete the code (course) | **not implemented** for course lessons |

## 5. Security

- Student code never runs in the web process (separate token-authenticated worker, source policy,
  per-test time/memory/output limits, concurrency + queue limits). Production backend: Docker + gVisor —
  **NOT VERIFIED on a real server**.
- Dependencies: `npm audit --omit=dev` → **0 vulnerabilities** after `npm audit fix`
  (next 16.4.0 → 16.4.3, zod 4.6.5 → 4.6.7) and an `overrides` entry pinning dompurify 3.4.17
  (Monaco pins a vulnerable 3.4.8).
- AI keys server-side; quotas and monthly budget; code fenced as untrusted data.

## 6. Tests executed

Full gate run after Milestone 2 (Windows dev machine, real g++, sandbox windows-job backend):

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | pass |
| `npx eslint src tests worker scripts e2e` | pass |
| `npx vitest run` | 1400 passed, 1 failed, 7 skipped (Docker-only). The failure is the Python lesson `py-objects-references` (Python 3.15 changed an error message) — not C++ |
| Course content (in vitest) | every lesson: solution passes all tests, starter does not, example output exact; 4 traces match g++ |
| `npm run build` | pass (Next 16.4.3) |
| `npx playwright test` | 16 / 16 passed — incl. 5 course-access tests (guest + signed-in, full path, direct URLs, first lesson of all 17 modules, prev/next, not-found page) and the Monaco editor test after the dompurify override |
| `npm audit --omit=dev` | 0 vulnerabilities |

Not executed here: `tests/sandbox-docker.test.ts` (needs Docker + gVisor), real AI calls, load tests.

## 7. Deployment

No new environment variables. **No database migration**: lesson ids and module ids are unchanged; new
concept rows are upserted by the existing content sync. Steps: deploy the commit, `npm ci`, `npm run build`,
restart web **and sandbox worker**. Rollback: redeploy the previous commit (no data to undo).
See [DEPLOYMENT-HOSTINGER.md](DEPLOYMENT-HOSTINGER.md) and [LAUNCH-CHECKLIST.md](LAUNCH-CHECKLIST.md).

## 8. Launch blockers

1. Production sandbox (Docker + gVisor) not verified on the target VPS (LAUNCH-CHECKLIST §2).
2. HTTPS, firewall, backups + a tested restore, monitoring — not verifiable from this machine.
3. Spec gap: one exercise per lesson instead of three graded practice problems.
4. Real AI provider calls unverified (blocker only if AI is enabled at launch).
5. Python course: one lesson's expected output depends on the Python version (separate task).
