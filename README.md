# CodeMentor

An interactive C++ learning playground with an AI mentor: step-by-step lessons, adaptive practice,
a coding playground, challenges, XP and achievements — with code checked by a real compiler.
Students start in one click (no sign-up).

## Run locally (Windows dev machine with MSYS2 g++)
```bash
npm install
npm run setup     # creates .env.local with local secrets
npm run dev       # web on http://localhost:3400 + sandbox worker on :3410
```
AI is off (curated mode) until you configure it — see `.env.example` and `docs/AI-AND-COSTS.md`.

## Checks
```bash
npx tsc --noEmit
npm run lint
npm test              # unit + integration (real g++ where available)
npm run test:e2e      # Playwright in Edge against the dev server
npm run build
```

## Docs
- `docs/RESTORATION.md` — what was restored, kept and changed
- `docs/ARCHITECTURE.md` — components, data, PostgreSQL
- `docs/DEPLOYMENT-HOSTINGER.md` — Hostinger VPS and managed hosting
- `docs/SANDBOX.md` — safe code execution
- `docs/AI-AND-COSTS.md` — providers, budget and quotas
- `docs/TESTING-REPORT.md`, `docs/LAUNCH-CHECKLIST.md`

CodeMentor is an independent project and is not an official service of any institution.
