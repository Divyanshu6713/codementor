# CodeMentor — launch status

Last updated: 2026-10-28 (Milestone 3). **Verdict: ready for private testing on the VPS; NO-GO for students until the server checks in §8 pass.**
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

**Milestone 3 (2026-10-28):** 127 lessons, 0 planned topics; every lesson has three judged problems
(exercise + intermediate + challenge = 381, all compiler-verified); question banks for every concept;
60 Arena problems; "Complete the code" mode; 14 dry-run traces and 8 interactive diagrams; account
recovery; C++20 in the sandbox. See [IMPLEMENTATION_PROGRESS.md](IMPLEMENTATION_PROGRESS.md).

Honest limits of the content:
- Topics the sandbox cannot run (threads, CMake, Git, multi-file builds, `std::filesystem`) show the
  real code as reading material and are practised through deterministic simulations.
- C++23 features are described, not executed.
- Lesson wording has not had a human review yet; correctness is compiler-verified.

## 3. Sandbox header policy changes

Added `<memory>`, `<stdexcept>`, `<exception>`, `<optional>`, `<string_view>`, `<cassert>` — library-only,
no OS access. `<fstream>`, `<thread>`, `<filesystem>`, processes, `#define`, quoted includes stay blocked
(policy tests in `tests/sandbox.test.ts`). **The sandbox worker must be restarted on deploy.**

## 4. Features

| Feature | Status |
|---|---|
| 127 C++ lessons, all open without locks; prev/next across all 17 modules | working, tested (unit + browser) |
| Three judged problems per lesson (beginner / intermediate / challenge) with XP by help used | working, tested |
| "Complete the code" (1–3 blanked lines, judged by the real tests, 10 XP) | working, tested (unit) |
| Editor, Run with stdin, Check, hidden tests, reveal one failing hidden case | working |
| Dry-run visualiser: 14 traces (arrays, call stacks), each checked against g++ | working |
| Interactive diagrams: 8 (loops, comparisons, pointers/memory, complexity, stack vs queue) | working |
| Adaptive practice banks for every concept; Practice Arena (60 problems); Daily Challenge | working |
| Account recovery: recovery codes, reset links (admin / linked parent), change password | working, tested (unit + browser + production build on PostgreSQL) |
| AI mentor (Claude/OpenAI) | optional; curated fallback works; **real provider calls NOT VERIFIED** |
| VPS launch kit (install, update/rollback, backups, restore test, alerts) | scripts written; backup/restore/health run against PostgreSQL 16; **systemd/Caddy/gVisor parts need the real VPS** |

## 5. Security

- Student code never runs in the web process (separate token-authenticated worker, source policy,
  per-test time/memory/output limits, concurrency + queue limits). Production backend: Docker + gVisor —
  **NOT VERIFIED on a real server**.
- Dependencies: `npm audit --omit=dev` → **0 vulnerabilities** after `npm audit fix`
  (next 16.4.0 → 16.4.3, zod 4.6.5 → 4.6.7) and an `overrides` entry pinning dompurify 3.4.17
  (Monaco pins a vulnerable 3.4.8).
- AI keys server-side; quotas and monthly budget; code fenced as untrusted data.

## 6. Tests executed (2026-10-28, Linux, real g++, local sandbox backend)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | pass |
| `npx eslint src tests worker scripts e2e` | pass |
| `npx vitest run` | **2077 passed, 0 failed** (18 files) — every lesson example, exercise and practice problem compiled and judged; 14 traces; question banks; account recovery |
| `next build` (standalone) | pass; production server started against PostgreSQL 16: health ok, signup → recovery code → `/forgot` reset → login |
| `npx playwright test` | 17 / 17 passed |

Not executed here: `tests/sandbox-docker.test.ts` with gVisor (needs the VPS), real AI calls, load tests.

## 7. Deployment

**New migration `0005_account_recovery`** (adds `users.recovery_code_hash` and `password_resets`;
additive, safe to roll back the code). Use `deploy/vps/install.sh` for a fresh VPS and
`deploy/vps/update.sh` for updates (backs up first, rolls back automatically on a failed health check).
Restart the sandbox worker too (C++20 flags). See [DEPLOYMENT-HOSTINGER.md](DEPLOYMENT-HOSTINGER.md)
and [LAUNCH-CHECKLIST.md](LAUNCH-CHECKLIST.md).

## 8. Launch blockers

1. Production sandbox (Docker + gVisor) not yet verified on the target VPS (LAUNCH-CHECKLIST §2).
2. HTTPS, firewall, off-site backups, a tested restore and alerts — scripted, but must be run and
   checked on the VPS.
3. Real AI provider calls unverified (blocker only if AI is enabled at launch).
4. Python course: one lesson's expected output depends on the Python version (separate task).
