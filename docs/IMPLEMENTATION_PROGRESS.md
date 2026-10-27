# C++ platform — implementation progress

Tracks the CodeMentor master prompts. **CodeMentor's C++ platform is not complete** — see "Remaining".
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

## Remaining (not done)

### Content
- **Three graded practice problems per lesson** (beginner / intermediate / challenge): today one
  exercise + one quiz question per lesson. Needs a `practice: Exercise[]` field, judge/API support for a
  practice id, progress per practice item, and UI.
- Planned topics still listed per module (e.g. operators in depth, ternary, merge/quick sort,
  Dijkstra, knapsack/LIS, threads, CMake, Git, more projects).
- C++20/23 lessons need the sandbox to compile those lessons with a newer `-std`.

### Learning features
- "Complete the code" mode for course lessons.
- Link lesson concepts to adaptive mastery (revision suggestions per concept).
- More visualisations (pointer/memory diagrams, grid walker, tree/graph animations).
- Real-provider verification of the AI mentor (needs API keys on staging).

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
