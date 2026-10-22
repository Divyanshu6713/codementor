# Testing report — 2026-10-09

Machine: Windows 11, Node 22, MSYS2 g++ 16.2, Microsoft Edge (Playwright channel). No Docker, no WSL, no AI API keys.

## Results
| Check | Command | Result |
|---|---|---|
| TypeScript | `npx tsc --noEmit` | ✅ 0 errors |
| ESLint | `npx eslint src tests worker scripts e2e` | ✅ 0 problems |
| Unit + integration | `npx vitest run` | ✅ **211 passed**, 7 skipped, 0 failed (13 files) |
| Browser end-to-end | `npm run test:e2e` (Edge, dev server + real dev sandbox) | ✅ **11 passed**, 0 failed |
| Production build | `npm run build` | ✅ |
| Standalone build (how Hostinger builds) | `NEXT_STANDALONE=true npm run build`, then `node .next/standalone/server.js` with `NODE_ENV=production` | ✅ starts, migrations found, health OK, guest start OK, HSTS/CSP headers present |
| Production safety gate | same standalone server pointed at the dev (windows-job) worker with `EXECUTION_PUBLIC_ENABLED=true` | ✅ execution refused ("development-only sandbox"); lesson page shows "Running code isn't available right now" |
| Content | `npm run content:validate` | ✅ 22 lessons + engine question bank |
| Dependencies | `npm audit --omit=dev` | ⚠️ 2 low (dompurify via the local `monaco-editor` package; the browser loads Monaco 0.55.1 from the CDN, outside the affected range) |

### What the 211 tests cover (highlights)
- **Real compiler (g++ via the dev sandbox):** all 22 lesson solutions pass all their tests; no starter already passes; every worked example prints exactly what the lesson claims (69 checks). Compile errors, infinite loops, waiting on input, memory and output floods, runtime crashes, malformed input, file-write and process-spawn attempts (sandbox.test.ts). Hidden tests never reach the browser; exactly one failing hidden case is revealed only on request.
- **Sandbox worker over HTTP:** token auth, validation, 8 simultaneous requests → bounded acceptance, the rest `503 busy`, still healthy.
- **Guest accounts:** one-click creation, can't log in with a password, claim keeps progress, can't claim twice.
- **XP & gamification:** first pass only; 25/20/15/5 by help used; module bonus + achievements; totals via `progression`.
- **AI controls (fake backends):** provider selection never switches providers; OpenAI needs model + prices; unknown Claude model fails closed; budget refused *before* the call; spend recorded per response including retries and failures; reservations stop concurrent overshoot; concurrency → busy; quotas per student / network / global are atomic, roll back and refund; quota day = IST midnight.
- **Mentor:** curated answers with no AI; honest "can't run" message; AI used within quota; curated fallback on quota/budget/provider failure (with refund); answers that leak the solution or claim untested success are rejected.
- **Provider contracts (local fake servers):** Claude request shape (model, max tokens, structured output, `fallbacks: "default"` + beta header), OpenAI request shape (model, `store: false`, output cap, structured output); invalid output retried once; bad key → clear error, no retry; server error → stops after one SDK retry.
- **Production gate:** off until enabled; never with a dev-only sandbox; not gated in development.

### End-to-end (Edge)
1. Landing → **Start learning** (no sign-up) → lesson 1 → reveal example output → compile error explained → run → **check passes** → +25 XP + "First Steps" → reload keeps it → dashboard shows XP and next lesson → continue.
2. Wrong answer → feedback → reveal one hidden test. 3. Infinite loop stopped and explained.
4. Hints 1→4, worked solution only after confirming, pass after it = +5 XP. 5. Explain-error without AI.
6. Playground: open a lesson example, run, break it, explanation + mentor. 7. Claim guest account → sign out → sign in → progress intact.
8. Network failure → clear message, no false success. 9. Monaco loads. 10. Mobile (390 px): no sideways scroll, editor usable.
11. `/admin` and admin APIs refuse visitors (401) and guest students (403).

## Not verified (needs the real environment)
| Item | Why | How to verify |
|---|---|---|
| Docker + gVisor sandbox | no Docker on this machine (7 tests skipped) | `SANDBOX_DOCKER_RUNTIME=runsc npx vitest run tests/sandbox-docker.test.ts` on the VPS — must run, not skip |
| Real Anthropic / OpenAI calls | no API keys | one request per mentor mode on staging; check `/admin` spend |
| PostgreSQL (vs PGlite) | tests use PGlite (same SQL dialect) | `npm run db:migrate` + e2e against the VPS database |
| Hostinger managed build | can't run Hostinger's builder locally | first deploy; read build log |
| Load / capacity | not measured | see launch checklist |
| Slow-network UX | only failure and 2.5 s delay paths tested in the earlier pass | throttled browser on the pilot |
