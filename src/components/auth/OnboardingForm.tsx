"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";
import { api } from "@/lib/api";
import { Button, Callout, Field, inputClass } from "@/components/ui";

const EXPERIENCE = [
  { value: "none", label: "I've never programmed", note: "Fine — we start from first principles." },
  { value: "a_little", label: "A little", note: "A school class, a tutorial, or a little Python/Java." },
  { value: "some", label: "Some", note: "I've written programs with variables and if-statements." },
  { value: "comfortable", label: "Comfortable", note: "I know loops, functions and arrays in some language." },
] as const;

const GOALS = [
  { value: "learn_from_scratch", label: "Learn C++ from scratch" },
  { value: "school_college", label: "Board exams / college coursework" },
  { value: "prepare_dsa", label: "Build up to DSA" },
  { value: "placements", label: "Placements & coding interviews" },
  { value: "competitive", label: "Competitive programming" },
  { value: "problem_solving", label: "Sharper problem solving" },
  { value: "revise_cpp", label: "Revise C++ I already know" },
] as const;

const CONFIDENCE = [
  { value: 1, label: "Not confident yet" },
  { value: 2, label: "Somewhat confident" },
  { value: 3, label: "Confident" },
] as const;

function Choice<T extends string | number>({ name, options, value, onChange, columns = 2 }: {
  name: string; options: readonly { value: T; label: string; note?: string }[]; value: T | null; onChange: (v: T) => void; columns?: number;
}) {
  return (
    <div className={clsx("grid gap-2", columns === 2 ? "sm:grid-cols-2" : columns === 3 ? "sm:grid-cols-3" : "")} role="radiogroup">
      {options.map((o) => (
        <label key={String(o.value)} className={clsx("flex cursor-pointer flex-col rounded-xl border p-3 transition-colors", value === o.value ? "border-accent bg-accent-soft" : "border-line-strong bg-surface hover:bg-sunken")}>
          <input type="radio" name={name} className="sr-only" checked={value === o.value} onChange={() => onChange(o.value)} />
          <span className={clsx("text-sm font-semibold", value === o.value && "text-accent-ink")}>{o.label}</span>
          {o.note && <span className="mt-0.5 text-xs text-ink-2">{o.note}</span>}
        </label>
      ))}
    </div>
  );
}

export function OnboardingForm({ initialName }: { initialName: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [grade, setGrade] = useState("");
  const [experience, setExperience] = useState<(typeof EXPERIENCE)[number]["value"] | null>(null);
  const [usedCpp, setUsedCpp] = useState<"yes" | "no" | null>(null);
  const [confidence, setConfidence] = useState<1 | 2 | 3 | null>(null);
  const [goal, setGoal] = useState<(typeof GOALS)[number]["value"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const ready = name.trim() && experience && usedCpp && confidence && goal;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready) return setError("Please answer each question — they decide where you start.");
    setBusy(true);
    setError(null);
    try {
      const res = await api<{ redirect: string }>("/api/onboarding", {
        body: { displayName: name, grade: grade || null, experience, usedCpp: usedCpp === "yes", confidence, goal },
      });
      router.push(res.redirect);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="What should we call you?" htmlFor="name">
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} className={inputClass} required />
        </Field>
        <Field label="Where are you studying?" htmlFor="grade" hint="Optional — helps us pick examples and pace.">
          <select id="grade" value={grade} onChange={(e) => setGrade(e.target.value)} className={inputClass}>
            <option value="">Prefer not to say</option>
            <option value="11">Class 11</option>
            <option value="12">Class 12</option>
            <option value="college-1">College · 1st year</option>
            <option value="college-2">College · 2nd year</option>
            <option value="college-3">College · 3rd year</option>
            <option value="college-4">College · 4th year</option>
            <option value="graduate">Graduate / working</option>
            <option value="other">Other</option>
          </select>
        </Field>
      </div>
      <section aria-labelledby="q-exp">
        <h2 id="q-exp" className="mb-3 font-semibold">How much have you programmed before?</h2>
        <Choice name="experience" options={EXPERIENCE} value={experience} onChange={setExperience} />
      </section>
      <section aria-labelledby="q-cpp" className="grid gap-6 sm:grid-cols-2">
        <div>
          <h2 id="q-cpp" className="mb-3 font-semibold">Have you used C++ before?</h2>
          <Choice name="usedCpp" options={[{ value: "yes" as const, label: "Yes" }, { value: "no" as const, label: "Not yet" }]} value={usedCpp} onChange={setUsedCpp} />
        </div>
        <div>
          <h2 className="mb-3 font-semibold">How confident do you feel about coding?</h2>
          <Choice name="confidence" options={CONFIDENCE} value={confidence} onChange={setConfidence} columns={1} />
        </div>
      </section>
      <section aria-labelledby="q-goal">
        <h2 id="q-goal" className="mb-3 font-semibold">What&apos;s your main goal?</h2>
        <Choice name="goal" options={GOALS} value={goal} onChange={setGoal} />
      </section>
      {error && <Callout tone="danger">{error}</Callout>}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
        <p className="text-sm text-ink-2">Next: a short adaptive check (about 5–10 questions) to find your starting point.</p>
        <Button type="submit" size="lg" disabled={busy || !ready}>{busy ? "Saving…" : "Continue"}</Button>
      </div>
    </form>
  );
}
