# Architecture

```
                  ┌──────────────────────── Next.js 16 app (Node) ────────────────────────┐
 Browser ─HTTPS─▶ │ pages: / (landing) · /start · /app/* (dashboard, Learn, lessons,       │
                  │        Playground, Arena, Practice, Revise, Achievements…) · /admin    │
                  │ API:   /api/auth/{guest,claim,login,signup} · /api/lessons/* ·         │
                  │        /api/mentor · /api/code/run · /api/learning-session/* · …       │
                  │ server: learning engine · judge · lesson path + XP · mentor · AI layer │
                  └──────┬───────────────────────────┬───────────────────────────┬─────────┘
                         │ SQL (Drizzle)             │ HTTP + token              │ HTTPS (optional)
                  PostgreSQL (prod)           sandbox worker (separate     Anthropic / OpenAI
                  PGlite (dev/tests)          process, Docker+gVisor)      (budget-metered)
```

## Components
- **Content as code** (`src/content`): the adaptive engine's concepts, skills, misconceptions, questions, lessons and traces, plus the step-by-step course (`src/content/course`, 22 lessons). Synced into the DB with content hashes on start-up (idempotent).
- **Learning engine** (`src/server/learning`, `services/sessions.ts`): placement check, adaptive lessons/practice/revision, mastery, misconceptions, spaced revision.
- **Lesson path** (`services/lesson-path.ts`, `services/lesson-exercises.ts`): per-student progress in `course_progress`; a pass is recorded only when the judge accepts.
- **Judge** (`server/execution/judge.ts`): deterministic output comparison; hidden tests stay server-side.
- **Gamification** (`services/progression.ts`, `achievements.ts`, `arena.ts`): XP recomputed from stored records (never granted by the client), levels, personal bests, daily challenge, opt-in weekly leaderboard, achievements.
- **AI layer** (`server/ai`): provider selection (curated / claude / openai / auto), shared prompts, metering (budget + ledger + concurrency), guardrails. **Mentor** (`services/mentor.ts`) builds curated answers and evidence for the AI. Quotas in `services/ai-quota.ts`.
- **Accounts** (`server/auth`): guest accounts (one click, no password) and named accounts (username + bcrypt password), httpOnly session cookies (hash stored), roles STUDENT / PARENT / ADMIN / CONTENT_EDITOR.
- **Sandbox worker** (`worker/sandbox`): see `SANDBOX.md`.

## Data and persistence
| Data | Where | Durable? |
|---|---|---|
| Accounts, progress, XP inputs, achievements, revision, mistakes, AI spend ledger, AI quota counters | PostgreSQL (`DATABASE_URL`) | yes — back it up |
| Same, in development | PGlite in `.data/pglite` | local only; refused in production by default |
| Lesson-exercise code drafts | browser localStorage (`cm-draft:<user>:<lesson>`) | convenience only |
| Theme / text size | browser localStorage | convenience only |

Migrations are SQL files in `drizzle/`, applied in order by `npm run db:migrate` or automatically on first DB use (`AUTO_MIGRATE`, default on). They only add tables/columns; no migration drops or resets data. Schema changes: edit `src/server/db/schema.ts`, then `npm run db:generate`.

### PostgreSQL in production
1. Create a database and a user that owns only it (see `deploy/vps/docker-compose.postgres.yml`).
2. Set `DATABASE_URL` (and `DATABASE_SSL=require` when the database is on another machine).
3. `npm run db:migrate` (or rely on `AUTO_MIGRATE=true`). Re-running is safe.
4. Nightly `pg_dump` (`deploy/vps/backup-postgres.sh`) + VPS snapshots; test a restore before launch.
5. Moving a dev/test PGlite database into PostgreSQL isn't automated — pilot data should start in PostgreSQL.
