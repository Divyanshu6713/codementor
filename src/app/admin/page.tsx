import type { Metadata } from "next";
import { requirePageUser } from "@/server/auth/current";
import { aiUsage, contentFlags, executionHealth, questionStats } from "@/server/services/admin";
import { aiStatus } from "@/server/ai";
import { budgetStatus } from "@/server/ai/metering";
import { executionStatus } from "@/server/execution/providers";
import { CONCEPTS } from "@/content";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Badge, Card, PageHeader } from "@/components/ui";
import { GenerateQuestionsForm, LogoutButton, QuestionToggle } from "@/components/app/SimpleForms";

export const metadata: Metadata = { title: "Curriculum console" };

export default async function AdminPage() {
  await requirePageUser(["ADMIN", "CONTENT_EDITOR"]);
  const [stats, flags, usage, exec, execHealth, budget] = await Promise.all([questionStats(), contentFlags(), aiUsage(), executionStatus(), executionHealth(), budgetStatus()]);
  const ai = aiStatus();
  const flagged = stats.filter((s) => s.calibrationFlag);
  const pending = stats.filter((s) => s.status === "pending_review");

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-line bg-surface px-4 py-3 sm:px-8">
        <Logo href="/admin" />
        <div className="flex items-center gap-1"><ThemeToggle /><LogoutButton /></div>
      </header>
      <main id="main" className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <PageHeader title="Curriculum console" subtitle="Content quality, calibration and system health. Internal only." />
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-4"><p className="text-xs text-ink-3">Code execution</p><p className="mt-1 font-semibold">{exec.available ? exec.provider : "Not available"}</p><p className="mt-1 text-xs text-ink-2">{exec.isolation ?? exec.message}</p></Card>
          <Card className="p-4">
            <p className="text-xs text-ink-3">AI provider (setting: {ai.setting})</p>
            <p className="mt-1 font-semibold">{ai.provider === "curated" ? "Curated content only" : `${ai.provider === "claude" ? "Claude" : "OpenAI"} (${ai.model})`}</p>
            {ai.reason && <p className="mt-1 text-xs text-hint">{ai.reason}</p>}
            <p className="mt-2 text-xs text-ink-2">This month: {budget.spentUsd === null ? "spend unavailable" : `$${budget.spentUsd.toFixed(2)}`} of ${budget.monthlyBudgetUsd.toFixed(2)} budget{budget.reservedUsd > 0 ? ` (+$${budget.reservedUsd.toFixed(2)} in flight)` : ""}</p>
          </Card>
          <Card className="p-4"><p className="text-xs text-ink-3">Judge verdicts</p><p className="mt-1 text-sm">{execHealth.map((v) => `${v.verdict}: ${v.n}`).join(" · ") || "none yet"}</p></Card>
        </div>

        <Card className="p-6" as="section" aria-labelledby="gen">
          <h2 id="gen" className="mb-3 font-semibold">Generate questions with AI</h2>
          <p className="mb-3 text-sm text-ink-2">Every generated question goes through: schema check → sandbox policy → reference solution compiled and run on all of its own tests → starter code must compile but not solve it. Passing questions wait for human approval below; nothing reaches students before that.</p>
          <GenerateQuestionsForm concepts={CONCEPTS.filter((c) => c.skills.length && c.status === "active").map((c) => ({ id: c.id, title: c.title }))} aiAvailable={ai.conversational && exec.available} />
        </Card>

        {pending.length > 0 && (
          <Card className="p-6" as="section" aria-labelledby="pending">
            <h2 id="pending" className="mb-3 font-semibold">Awaiting review ({pending.length})</h2>
            <ul className="space-y-2">{pending.map((q) => <li key={q.id} className="flex items-center justify-between gap-3 text-sm"><span>{q.id} · {q.concept}</span><QuestionToggle questionId={q.id} status={q.status} /></li>)}</ul>
          </Card>
        )}

        <Card className="p-6" as="section" aria-labelledby="flags">
          <h2 id="flags" className="mb-3 font-semibold">Flags</h2>
          {flagged.length === 0 && flags.length === 0 && <p className="text-sm text-ink-2">No flags. Calibration needs at least 8 learner outcomes per question.</p>}
          <ul className="space-y-2 text-sm">
            {flagged.map((q) => <li key={q.id}><Badge tone="hint">calibration</Badge> <span className="font-mono">{q.id}</span> — {q.calibrationFlag}</li>)}
            {flags.map((f) => <li key={f.id}><Badge tone="danger">{f.kind}</Badge> <span className="font-mono">{f.questionId ?? "(generated)"}</span> — <span className="text-ink-2">{JSON.stringify(f.details).slice(0, 180)}</span></li>)}
          </ul>
        </Card>

        <Card className="overflow-x-auto p-0" as="section" aria-labelledby="qs">
          <h2 id="qs" className="px-6 pt-5 font-semibold">Questions ({stats.length})</h2>
          <table className="mt-3 w-full text-sm">
            <thead className="bg-sunken text-left text-xs text-ink-2">
              <tr><th className="px-4 py-2">Question</th><th className="px-2 py-2">Type</th><th className="px-2 py-2">Difficulty</th><th className="px-2 py-2">v</th><th className="px-2 py-2">Validation</th><th className="px-2 py-2">Outcomes</th><th className="px-2 py-2">1st try</th><th className="px-2 py-2">Independent</th><th className="px-2 py-2">Hinted</th><th className="px-2 py-2">Status</th></tr>
            </thead>
            <tbody>
              {stats.map((q) => (
                <tr key={q.id} className="border-t border-line align-top">
                  <td className="px-4 py-2"><span className="font-mono text-xs">{q.id}</span><p className="max-w-xs truncate text-xs text-ink-3" title={q.prompt}>{q.concept} · {q.prompt}</p></td>
                  <td className="px-2 py-2 text-xs">{q.type}</td>
                  <td className="px-2 py-2 text-xs">{q.difficultyLabel}</td>
                  <td className="px-2 py-2 text-xs">{q.currentVersion}</td>
                  <td className="px-2 py-2"><Badge tone={q.validation === "failed" ? "danger" : q.validation === "validated" ? "success" : "neutral"}>{q.validation.replace("_", " ")}</Badge></td>
                  <td className="px-2 py-2 font-mono text-xs">{q.n}</td>
                  <td className="px-2 py-2 font-mono text-xs">{q.n ? `${Math.round(q.firstTry * 100)}%` : "—"}</td>
                  <td className="px-2 py-2 font-mono text-xs">{q.n ? `${Math.round(q.independent * 100)}%` : "—"}</td>
                  <td className="px-2 py-2 font-mono text-xs">{q.n ? `${Math.round(q.hinted * 100)}%` : "—"}</td>
                  <td className="px-2 py-2"><QuestionToggle questionId={q.id} status={q.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="p-6" as="section" aria-labelledby="ai">
          <h2 id="ai" className="mb-3 font-semibold">AI usage (metadata only)</h2>
          {usage.length ? (
            <table className="w-full text-sm"><thead className="text-left text-xs text-ink-3"><tr><th>Purpose</th><th>Provider</th><th>Status</th><th>Calls</th><th>Tokens in/out</th><th>Avg latency</th></tr></thead>
              <tbody>{usage.map((u, i) => <tr key={i} className="border-t border-line"><td className="py-1">{u.purpose}</td><td>{u.provider}</td><td>{u.status}</td><td>{u.calls}</td><td className="font-mono text-xs">{u.inputTokens}/{u.outputTokens}</td><td>{u.avgLatency} ms</td></tr>)}</tbody></table>
          ) : <p className="text-sm text-ink-2">No AI calls recorded.</p>}
        </Card>
      </main>
    </div>
  );
}
