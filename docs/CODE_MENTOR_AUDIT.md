# CodeMentor — C++ platform audit (2026-10-27)

Phase 0 of the "Code Mentor master development prompt". This audit covers the C++ learning path;
the earlier whole-product audit is in [AUDIT.md](AUDIT.md).

## Architecture (as found)

| Area | Where | Notes |
|---|---|---|
| Web app | Next.js 16 App Router, TypeScript, Tailwind v4 tokens (`src/app/globals.css`) | Proxy in `src/proxy.ts`; `npm run dev` starts web (3400) + sandbox worker (3410). |
| Data | Drizzle ORM — PGlite in dev, Postgres in production | Schema in `src/server/db`; migrations via `npm run db:migrate`. |
| Accounts | Guest accounts (server-side, no registration) + optional named accounts | Progress, XP and AI quotas are keyed to the server-side student, guest or named. |
| Code execution | Separate sandbox worker `worker/sandbox` | Token-authenticated; Docker/gVisor backend for production, Windows job-object backend for local dev. Student code never runs in the web process. |
| Judge | `src/server/execution/judge.ts` | Sample + hidden tests, `tokens`/`lines` comparison, hidden cases revealed only after a wrong check. |
| C++ course | `src/content/course/*` (content as code) | `CourseLesson` = goals, concept sections (optional visual/trace), mistakes, worked example, quick check, exercise (tests, 4 hints, server-only solution), explain-again, summary. |
| Course progress | `course_progress` table, `src/server/services/lesson-path.ts` | Keyed by (student, lessonId). Module-completion XP computed live in `progression.ts`; two achievements reference module ids. |
| Adaptive engine | `src/content/*`, `src/server/services/sessions.ts` | Placement check, mastery per concept, practice/revise/mistakes, dry-run steps. |
| AI mentor | `/api/mentor`, `src/server/services/mentor.ts`, `src/server/ai/*` | Curated by default; Claude/OpenAI optional with quotas and a monthly budget — see [AI_MENTOR_DESIGN.md](AI_MENTOR_DESIGN.md). |
| Other paths | Python Mastery (`/app/python`), Arena, daily challenge, opt-in leaderboard, playground | Out of scope for this work and left unchanged. |
| Deployment | [DEPLOYMENT-HOSTINGER.md](DEPLOYMENT-HOSTINGER.md) | Unchanged by this work: no new services, env vars or migrations. |

## What works

- 22 C++ lessons (modules: programming foundations, decisions, loops), each verified with real g++:
  the reference solution passes every test, the starter code does not, and the worked example prints
  exactly what the lesson claims (`tests/course-content.test.ts`).
- Linear prev/next navigation, server-side progress per lesson, XP on pass, reduced XP after
  viewing the solution, progressive hints 1–4 with the worked solution behind an explicit request.
- Guest learning without registration.
- Baseline suite before changes: **1250 passed, 1 failed, 7 skipped** (Docker-only tests skipped on
  Windows). The single failure was a worked-example output check in the course-content suite; it
  passed on every later run, so it looks like a transient sandbox timing issue rather than wrong content.

## Root cause: "the course stops after loops / later lessons look locked"

There was **no progress lock and no navigation bug**. Modules 4–7 (functions, arrays & strings,
pointers, DSA intro) were declared with `lessons: []` and only a list of planned titles. So:

1. `neighbours()` correctly had no "next" after `loop-patterns`, because there was nothing after it.
2. The lesson path showed those modules with a **lock icon** and "coming later", which reads as
   "locked" even though no gate exists.
3. The last lesson's footer just said "Back to Learn", with no explanation.

The fix is content, plus making the UI honest:

- Written and compiler-verified: **Module 6 Functions & recursion (6 lessons)** and **Module 7 Arrays
  & strings (7 lessons)**.
- Restructured the catalogue into the 17-module roadmap without renaming any lesson id.
- Unwritten modules now show "being written … nothing here is locked" with a pen icon, not a lock.
  Partly written modules list what's still to come.
- The last published lesson says so and points to the Arena/Playground.
- Regression tests: navigation continues past Loops; every lesson links to the next in roadmap
  order with no dead ends; the module ids used by XP and achievements still exist; key lesson ids
  (progress keys) still exist.

## Content inventory (after this phase)

See the generated [CPP_CURRICULUM_MANIFEST.md](CPP_CURRICULUM_MANIFEST.md). Summary: 35 published
lessons across 7 of 17 modules; 10 modules (pointers → projects) are planned topics only.

## Compatibility decisions

- **Lesson ids unchanged** → stored `course_progress` rows remain valid. No migration.
- **Module ids kept** for `foundations`, `logic`, `loops`, `functions`, `arrays-strings`, `pointers`
  (used by module XP bonuses and the `MODULE_FOUNDATIONS` / `MODULE_LOGIC` achievements).
- The old Module 1 was split into M1 Introduction, M2 Variables/IO, M3 Operators by changing
  `moduleId` on 4 lessons. Module bonuses are computed live, so this can only **add** a bonus for a
  student who already finished those lessons; nothing already earned is removed. Achievements
  already granted are stored and unaffected.
- The unused `dsa-intro` module (never had lessons) was replaced by the Searching & sorting, Data
  structures and Algorithms modules.
- One source of truth: the catalogue in `src/content/course`. The manifest is generated from it and
  a test fails if the committed manifest is stale.

## Strategy

Write modules in teaching order, each lesson compiler-verified before it's listed. Never publish
title-only lessons: unwritten topics stay visible as "planned" in the roadmap. Reuse the existing
lesson shape, judge, hints, mentor and DryRun visualiser rather than adding parallel systems.

## Risks

| Risk | Mitigation |
|---|---|
| Scope: ~120 planned topics remain | Phased delivery; progress tracked in [IMPLEMENTATION_PROGRESS.md](IMPLEMENTATION_PROGRESS.md); manifest shows exact status. |
| Hand-written traces drifting from C++ | Every trace is now compiled with g++ and its final output compared (new test). |
| Lessons needing C++20/23 | `standard` field on lessons; the sandbox compiles C++17, so such lessons need a sandbox flag change first. |
| Content tests need g++ | They're skipped where no compiler is available; CI on Linux should use the Docker backend. |
| Each lesson currently has one coding exercise + one quick check | The master prompt asks for ≥3 progressively harder practice items per lesson — tracked as remaining work. |
