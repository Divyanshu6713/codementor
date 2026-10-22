# AI mentor: providers, configuration and cost controls

The AI is optional. With `AI_PROVIDER=curated` (the default) every lesson, hint, error explanation,
exercise check and challenge works with reviewed, built-in content. Correctness is always decided by
the compiler and test judge — never by AI.

## Providers
| `AI_PROVIDER` | Behaviour |
|---|---|
| `curated` | No external AI. Default. |
| `claude` | Anthropic only (`ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, default `claude-opus-5-5`). If not fully configured → curated. |
| `openai` | OpenAI only (`OPENAI_API_KEY`, `OPENAI_MODEL` — **no default**, plus prices). If not fully configured → curated. |
| `auto` | First fully configured provider in `AI_AUTO_ORDER` (default `claude,openai`). Remove one from the list to disable it. |

The app **never silently switches from one paid provider to the other**: if the chosen provider fails or is over budget, the student gets curated help with a short notice. The admin console (`/admin`) shows the active provider, why AI is off if it is, and month-to-date spend vs budget.

Implementation: `src/server/ai/llm-provider.ts` builds every prompt once; `claude.ts` (Anthropic SDK, structured outputs, server-side refusal fallback) and `openai.ts` (official OpenAI SDK, Responses API with structured outputs, `store: false`) only send requests. Both: one SDK retry for transient errors, one retry for output that fails schema validation, timeout `AI_TIMEOUT_MS`, output cap `AI_MAX_OUTPUT_TOKENS`.

**Model choice:** the default Claude model is the most capable one; for a high-volume student mentor you may prefer a cheaper model (e.g. `ANTHROPIC_MODEL=claude-haiku-5-5`, $0.10/$0.50 per million input/output tokens vs $4/$20 for `claude-opus-5-5`, Anthropic list prices checked 2026-10-08). That's your call — test answer quality first. For OpenAI, set the model you have verified in your account and its current prices.

## Cost controls (all server-side)
1. **Monthly budget** (`AI_MONTHLY_BUDGET_USD`, default $20) — before every paid call, *recorded spend this month + spend reserved by in-flight calls + this call's worst case* must fit, or the call isn't sent. Worst case = generous input estimate + full output cap, ×2 for a possible retry. Every model response's real token usage (retries included) is priced and written to the `ai_spend` ledger. No known price → the provider counts as not configured (fails closed). `0` disables paid AI.
2. **Per-student daily requests** (`AI_DAILY_REQUEST_LIMIT`, default 10) — mentor panel, playground questions and adaptive-session chat. Keyed to the student's **server-side account** (guest or named), so clearing browser storage doesn't reset it. Refunded if the AI call fails.
3. **Automatic engine calls** (`AI_AUTO_DAILY_LIMIT`, default 40 per student) — hint phrasing and mistake explanations inside adaptive sessions; beyond it, curated text silently.
4. **Per network** (`AI_IP_DAILY_LIMIT`, default 300) — backstop against someone creating many guest accounts; deliberately generous so a hostel or lab behind one IP isn't blocked; only applied when `TRUST_PROXY=true` (otherwise the address could be forged).
5. **Global** (`AI_GLOBAL_DAILY_LIMIT`, default 3000 requests/day).
6. **Guest creation** — per network and global hourly caps (`GUEST_CREATIONS_PER_HOUR`).
7. **Concurrency** — `AI_MAX_CONCURRENT` in flight, `AI_MAX_QUEUED` waiting, rest refused as busy.
8. **Input limits** — request bodies size-checked; code + question trimmed to `AI_MAX_INPUT_CHARS`.

Daily quotas reset at local midnight for `AI_QUOTA_TZ_OFFSET_MINUTES` (default 330 = IST). Quota keys are HMAC hashes (`GUEST_SECRET`), not raw ids or IPs.

**Known limitation:** budget reservations are per web process. With N processes the cap can be exceeded by at most N × `AI_MAX_CONCURRENT` worst-case calls (cents, not dollars, at the defaults). Run one web process for the pilot.

## Safety of AI output
- The AI sees only real evidence: for hints (level 3+), error explanations and reviews, the server compiles and judges the code first; hidden test inputs are never sent.
- Student code and questions are fenced as untrusted data; the prompt forbids following instructions inside them or revealing the reference solution.
- Answers are rejected (curated help shown instead) if they contain the reference solution, claim the code compiled/passed when the judge didn't say so, or run too long.
- Hint levels: 1 guiding question · 2 relevant concept · 3 likely problem area · 4 approach · worked solution only on an explicit, confirmed request (and a pass after it earns less XP).

## Verification status
- Logic (selection, budget, ledger, retries, quotas, fallbacks, guardrails): automated tests with fake backends — ✅.
- Request/response contract for both SDKs against local fake servers — ✅.
- **Real Anthropic / OpenAI calls: not verified** (no API keys were available). Before enabling AI, run one request per mode with a real key on a staging copy and check `/admin` shows the spend.
