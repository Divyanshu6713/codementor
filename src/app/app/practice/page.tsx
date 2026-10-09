import type { Metadata } from "next";
import { Crosshair } from "lucide-react";
import { requirePageUser } from "@/server/auth/current";
import { getDb } from "@/server/db/client";
import { conceptInfos, skillMap } from "@/server/services/learner";
import { Badge, Card, MasteryBar, PageHeader, pct } from "@/components/ui";
import { StartSessionButton } from "@/components/app/StartSessionButton";

export const metadata: Metadata = { title: "Practice" };

export default async function PracticePage() {
  const user = await requirePageUser(["STUDENT"]);
  const db = await getDb();
  const [map, infos] = await Promise.all([skillMap(db, user.id), conceptInfos(db)]);
  const practiceable = new Set(infos.filter((c) => c.practiceable).map((c) => c.id));
  const concepts = map.flatMap((t) => t.concepts).filter((c) => practiceable.has(c.id));
  const skills = concepts.flatMap((c) => c.skills.map((s) => ({ ...s, concept: c.title })));
  const weakest = skills.filter((s) => s.mastery !== null && s.evidenceCount > 0).sort((a, b) => (a.mastery ?? 0) - (b.mastery ?? 0)).slice(0, 3);
  const misconceptions = concepts.flatMap((c) => c.activeMisconceptions);

  return (
    <div className="space-y-8">
      <PageHeader title="Practice" subtitle="Adaptive question sets: they get harder when you're on a roll and easier when something isn't clicking yet." />

      {(weakest.length > 0 || misconceptions.length > 0) && (
        <Card className="p-6" as="section" aria-labelledby="weak">
          <h2 id="weak" className="flex items-center gap-2 font-semibold"><Crosshair size={17} className="text-hint" aria-hidden /> Practise my weak spots</h2>
          <p className="mt-1 text-sm text-ink-2">
            {weakest.map((s) => `${s.title} (${pct(s.mastery)})`).join(", ")}
            {misconceptions.length ? ` · plus questions that check: ${misconceptions.map((m) => m.title.toLowerCase()).join(", ")}` : ""}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(["quick", "normal"] as const).map((len) => (
              <StartSessionButton key={len} size="md" variant={len === "quick" ? "secondary" : "primary"} body={{ mode: "practice", skills: weakest.map((s) => s.id), length: len }} label={len === "quick" ? "Quick (5)" : "Normal (8)"} />
            ))}
          </div>
        </Card>
      )}

      <section aria-labelledby="topics">
        <h2 id="topics" className="mb-3 font-semibold">By topic</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {concepts.map((c) => (
            <Card key={c.id} className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{c.title}</h3>
                <span className="font-mono text-sm text-ink-2">{pct(c.mastery)}</span>
              </div>
              <MasteryBar value={c.mastery} className="mt-2" label={`${c.title} mastery`} />
              <div className="mt-3 flex flex-wrap gap-1">{c.skills.map((s) => <Badge key={s.id}>{s.title}</Badge>)}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                <StartSessionButton size="sm" variant="secondary" body={{ mode: "practice", conceptId: c.id, length: "quick" }} label="Quick" />
                <StartSessionButton size="sm" body={{ mode: "practice", conceptId: c.id, length: "normal" }} label="Normal" />
                <StartSessionButton size="sm" variant="secondary" body={{ mode: "practice", conceptId: c.id, length: "deep" }} label="Deep" />
              </div>
            </Card>
          ))}
        </div>
        <p className="mt-4 text-sm text-ink-3">Only topics with a practice question bank are listed. More topics are being written.</p>
      </section>
    </div>
  );
}
