# Restoring the original CodeMentor (2026-10-09)

## What happened, and what the sources of truth were
- The repository **has no commits before this work** (no history, branches, reflog or stash), so git couldn't recover an earlier version.
- The previous "simplify" pass did **not** delete the original app: the account-based experience under `/app` (dashboard, XP and levels, daily challenge, Practice Arena, opt-in leaderboard, achievements, Skill Map, Mistake Book, revision, adaptive lessons, placement check, playground, AI tutor chat, parent/mentor links, admin console) was all still there. What changed was:
  1. the **landing page** was replaced by a plain course page whose button went to a new public `/learn` site;
  2. a separate, localStorage-only **guest course site** (`/learn`, `/api/guest/*`) bypassed the original app;
  3. backend additions (OpenAI provider, AI budget/quotas, execution safety gate, etc.).
- The **original landing page source** was recovered verbatim from this working session's own saved output of the file (read before it was replaced) and restored, with only the call-to-action and FAQ facts updated.

## Preserved before restoring
- Branch `backup/pre-restore-2026-10-09` — a commit of the entire working tree as it was (secrets in `.env*`, local data in `.data/` and build output excluded by `.gitignore`).
- A full tarball (including `.env.local` and the local database) in the session scratchpad: `codementor-snapshot-2026-10-09.tgz`.
- No `reset --hard`, `clean`, force-push or production change was made. Work continues on branch `restore/original-experience` (uncommitted).

## Restored
- Original landing page (hero "Learn C++. Your way.", live loop widget, how-it-works loop, competitive strip, features, FAQ, final CTA) and the original app as **the** experience.
- Original navigation and visual identity (the app sidebar, colours, gradients, typography). The Playground moved up the nav and is featured on the landing page.

## Changed so it's frictionless (not simpler)
- **No sign-up wall:** "Start learning" creates a guest student account in one click (no username, email or password), skips the onboarding questions and opens lesson 1 — or the placement check ("I already know some C++" on `/start`). Progress, XP, achievements and AI quotas live **on the server**, so a reload keeps them and editing browser storage can't fake them. Guests can claim the account later (Settings → *Keep your progress*); guest accounts can't be signed into with a password; guests can delete their account without one.
- Signed-out visitors to `/app/*` go to `/start`; admin and parent areas still require sign-in.

## Built on top (kept from the previous pass, re-homed into the original app)
- **22 step-by-step lessons** (Modules 1–3: foundations, decisions, loops) now live at `/app/learn/<lesson>` inside the original app: friendly explanations, interactive visuals and step-through traces, a "predict the output, then reveal" example you can open in the Playground, a quick check, and a coding exercise judged by the real compiler. Every solution, starter and example is verified with g++ by `tests/course-content.test.ts`.
- **Gamification for lessons:** a judged pass earns XP (25 with ≤1 hint, 20 with 2, 15 with 3–4, 5 after the worked solution; first pass only), +50 for finishing a module, a celebration, and new achievements (First Steps, Foundations Built, Decision Maker, Loop Master, No Hints Needed). The dashboard shows the next lesson; Learn shows module progress; Python, JavaScript and DSA are listed honestly as "coming later".
- **Playground:** load and remix any lesson example, plain-language explanations of compiler/runtime errors, and the mentor (explain this error / ask a question).
- **AI mentor panel** on every lesson: progressive hints, explain concept, explain error, review my code, ask — curated without AI, AI-personalised when enabled; OpenAI + Claude + curated + auto; budget, quotas, concurrency (see `AI-AND-COSTS.md`).
- Production safety: execution gate, gVisor requirement, PGlite refused in production, rate limits that don't lump a campus into one bucket, HSTS.

## Removed (superseded, no lost functionality)
`src/app/learn/*` (public lesson site), `src/app/api/guest/*`, `src/lib/guest-progress.ts` (browser-only progress) and its components. Their content and exercise/mentor UI were moved into the app.

## Files
New: `src/app/start/page.tsx`, `src/components/auth/GuestStart.tsx`, `src/app/api/auth/{guest,claim}/route.ts`, `src/components/app/{ClaimAccount,LessonPath}.tsx`, `src/app/app/learn/[lessonId]/page.tsx`, `src/components/learn/PredictOutput.tsx`, `src/app/api/lessons/{check,solution}/route.ts`, `src/app/api/mentor/route.ts`, `src/server/services/lesson-path.ts`, `drizzle/0003_guest_accounts_and_lesson_path.sql`, `scripts/cleanup-guests.ts`, `.env.example`, `deploy/vps/*`, `docs/{RESTORATION,DEPLOYMENT-HOSTINGER,SANDBOX,AI-AND-COSTS,ARCHITECTURE,TESTING-REPORT,LAUNCH-CHECKLIST}.md`, `README.md`.

Modified: `src/app/page.tsx` (original restored), `src/proxy.ts`, `src/server/auth/{auth,current}.ts`, `src/server/db/{schema,client}.ts`, `src/server/config.ts`, `src/server/ai/index.ts`, `src/server/services/{progression,achievements,ai-quota,code-runs,privacy}.ts`, `src/server/learning/feedback.ts`, `src/server/guest/identity.ts`, `src/app/app/{layout,page}.tsx`, `src/app/app/{learn,playground,settings}/page.tsx`, `src/components/app/{AppNav,Playground,SettingsPanel}.tsx`, `src/components/learn/{ExercisePanel,HelpPanel,LessonFooter,LessonState,SiteHeader}.tsx`, `src/app/privacy/page.tsx`, `src/app/api/auth/{login,signup}/route.ts`, `src/app/api/me/[action]/route.ts`, `src/content/index.ts`, `next.config.ts`, `package.json`, `scripts/migrate.ts`, `e2e/journey.spec.ts`, `tests/guest.test.ts`.

Renamed: `services/guest.ts` → `services/lesson-exercises.ts`, `services/guest-tutor.ts` → `services/mentor.ts`.
