# AI mentor design (C++ course)

This describes the mentor **as implemented today** and what is still planned. Provider setup,
quotas and cost controls are documented in [AI-AND-COSTS.md](AI-AND-COSTS.md) and are not repeated here.

## Principles

1. **Correctness comes from the compiler and the judge, never from AI.** The mentor explains; it
   doesn't decide whether code is right.
2. **Works without AI.** Every mode has a curated answer built from lesson content
   (`explainAgain`, the 4 hints, mistakes, compiler-error explanations). `AI_PROVIDER=curated` is
   the default.
3. **Evidence first.** For hints from level 3 on, error explanations and reviews, the server
   compiles and judges the student's code first and gives the model only what actually happened.
   Hidden test inputs are never sent to the model.
4. **Learning before answers.** Progressive hints; the worked solution only on an explicit,
   confirmed request, and a pass after viewing it earns less XP.
5. **Untrusted input.** Student code and questions are fenced as data; the prompt forbids following
   instructions inside them. Answers containing the reference solution, or claiming a compile/pass
   the judge didn't report, are rejected and the curated answer is shown instead.

## Modes (`/api/mentor`, `src/server/services/mentor.ts`)

| Mode | Curated answer | AI answer gets |
|---|---|---|
| Explain concept (`concept`) | Lesson's `explainAgain` + summary points | Lesson context |
| Give hint (`hint`, levels 1–4) | The lesson's hint for that level | Judge verdict + the level's intent |
| Explain error (`error`) | Compiler-output explainer (`learning/feedback.ts`) | Trimmed compiler output |
| Review my code (`review`) | Judge feedback items | Verdict, tests passed, first failing **sample** case |
| Ask a question (`ask`) | Lesson's `explainAgain` + a pointer to the hints | Question + code (fenced), lesson context |

### Hint ladder

| Level | Intent | Source |
|---|---|---|
| 1 | Guiding question | `exercise.hints[0]` |
| 2 | Relevant concept | `exercise.hints[1]` |
| 3 | Where to look | `exercise.hints[2]` (+ judged evidence when AI is on) |
| 4 | The approach | `exercise.hints[3]` |
| 5 | Worked solution | `/api/lessons/solution`, explicit confirmation, reduced XP |

Every lesson in the catalogue is validated to have exactly four non-empty hints.

## Adaptive mastery (existing engine)

The adaptive engine (placement check, practice, revise, mistakes) tracks mastery per concept and
chooses the next question from it. Course lessons now carry `concepts` tags so they can be linked
to that mastery model; **that linking is not built yet**.

## Not yet implemented

- Mentor using lesson `concepts` to suggest revision of weak concepts after repeated failures.
- Per-lesson "common mistake" detection beyond compiler errors (e.g. spotting shadowing or `<=` off-by-one).
- Real-provider verification: Claude/OpenAI calls are tested only against fakes (no API keys were available).
