# CodeMentor — initial audit (2026-10-08)

Baseline before the V1 "guest learning" work. Everything below was checked against the repository
and by running the existing checks, not assumed.

## Baseline checks

| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ passes |
| `npx vitest run` | ✅ 84 tests / 7 files pass (includes real g++ sandbox tests on the Windows dev backend) |
| `npx eslint src tests worker scripts` | ❌ 2 errors (`<a>` used for internal links in `error.tsx`, `SettingsPanel.tsx`), 1 warning |
| `next build` | not run before (never verified) |
| Playwright e2e | `@playwright/test` installed but no config, no specs, no browsers downloaded |
| `npm run content:validate` | script referenced in `package.json` but `scripts/validate-content.ts` does not exist |
| Docker / WSL on this machine | not installed → the production (`docker`) sandbox backend **cannot be exercised here** |

## What exists and works

- **Next.js 16 + TypeScript + Drizzle**; PGlite (embedded Postgres in `.data/`) by default, real Postgres via `DATABASE_URL`. Migrations in `drizzle/`.
- **Account-based adaptive learning engine** (`/app/*`): sign-up/login (bcrypt, httpOnly session cookie), onboarding, adaptive placement check, mastery model, misconceptions, mistake book, spaced revision, practice arena, XP/levels, opt-in leaderboard, parent/mentor links, admin "curriculum console".
- **Curated content as code** (`src/content`): 11 active concepts in the graph, but full lessons exist for only **two** (`for-loops`, `comparison-ops`). A diagnostic question bank spans basics → strings. Content is hash-versioned into the DB.
- **Monaco editor** (`components/editor/CodeEditor.tsx`) loaded from jsDelivr, with an automatic plain-textarea fallback.
- **Sandbox worker** (`worker/sandbox`): separate process, bearer token, request validation, concurrency + bounded queue, source policy (header allow-list, banned OS identifiers, no `#define`/quoted includes), compile once / run per test, scratch dir cleanup. Backends:
  - `windows-job` (dev): job object (memory, CPU, wall time, 1 process), low-integrity token, empty env. **No network isolation** → refuses to start in production.
  - `docker` (intended production): per-run container, `--network none`, read-only FS, cap-drop ALL, no-new-privileges, uid 65534, pids/memory/CPU limits. **Never executed** (no Docker here).
- **Deterministic judge** (`server/execution/judge.ts`): token/line comparison, hidden tests stay server-side.
- **AI layer** (`server/ai`): provider interface, Claude provider (structured outputs + zod), curated provider, guardrails (no solution leaks, no invented execution claims), usage metadata recorded without content.
- Security basics: CSP + security headers, same-origin check on mutations, per-process token-bucket rate limits, structured logger with redaction.

## Needs simplification (for the V1 brief)

- Learning is **gated behind sign-up** (`proxy.ts` redirects `/app/*` to `/login`); the landing page is a long promotional page whose CTA is "Sign up".
- The account app is feature-heavy (XP, leaderboard, arena, achievements, parent links) — the opposite of "simple".
- Only C++ loops/comparisons have real lessons; the V1 roadmap (7 modules) is mostly absent.

## Broken / incomplete

- Lint errors (above); `content:validate` script missing; no README / deployment docs / `.env.example`; no e2e tests; `next build` never verified.
- No OpenAI provider; `AI_PROVIDER=auto` silently uses Claude whenever `ANTHROPIC_API_KEY` exists.
- No AI request quota per student, no global budget, no AI concurrency limit.
- Docker backend unverified; no image/Dockerfile for the runner; no gVisor option.

## Security risks found

1. **Raw student source code is stored** for every playground run (`code_submissions`) — unnecessary for the guest flow.
2. `clientIp()` trusts the first `X-Forwarded-For` entry unconditionally (spoofable unless a trusted proxy overwrites it).
3. `readJson()` has no request-size cap of its own.
4. No AI spend limit → a paid key could be drained.
5. Production sandbox isolation unproven; a Docker worker needs the Docker socket (root-equivalent) and must not share a host with app secrets.
6. `npm audit`: 2 low-severity advisories in `dompurify` via the local `monaco-editor` package (the runtime editor is loaded from the CDN at 0.55.1, which the advisory range does not include).

## Must be retained

Sandbox worker + policy + windows-job backend and their tests; judge; content model, traces and visuals; Claude integration and guardrails; account app, admin console (still requires an ADMIN session); security headers.
