import type { Metadata } from "next";
import { Compass, Gauge, ListChecks } from "lucide-react";
import { requirePageUser } from "@/server/auth/current";
import { getDb } from "@/server/db/client";
import { activeSessionFor } from "@/server/services/sessions";
import { getProfile } from "@/server/services/students";
import { ButtonLink, Card, PageHeader } from "@/components/ui";
import { StartSessionButton } from "@/components/app/StartSessionButton";

export const metadata: Metadata = { title: "Placement check" };

export default async function DiagnosticPage() {
  const user = await requirePageUser(["STUDENT"]);
  const [profile, active] = await Promise.all([getProfile(user.id), getDb().then((db) => activeSessionFor(db, user.id))]);
  const resumable = active?.kind === "diagnostic" ? active : null;
  return (
    <div className="max-w-3xl">
      <PageHeader eyebrow="Step 2 of 2" title="Let's find your starting point" subtitle="A short check that adapts to you. It isn't a test you can fail — it just tells us where your lessons should begin." />
      <Card className="p-6 sm:p-8">
        <ul className="grid gap-5 sm:grid-cols-3">
          {[
            { icon: Gauge, title: "Adapts as you go", text: "Right answers lead to harder questions; a wrong one gets a second chance on the same idea." },
            { icon: ListChecks, title: "About 5–12 questions", text: "Mixed types: predict the output, spot the bug, fill a blank, sometimes write code." },
            { icon: Compass, title: "Builds your Skill Map", text: "Afterwards you'll see what you know, what's new, and what to learn first." },
          ].map(({ icon: Icon, title, text }) => (
            <li key={title}>
              <Icon className="text-accent" size={22} aria-hidden />
              <p className="mt-2 font-semibold">{title}</p>
              <p className="mt-1 text-sm text-ink-2">{text}</p>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-line pt-6">
          {resumable ? <ButtonLink href={`/app/session/${resumable.id}`} size="lg">Resume the check</ButtonLink> : <StartSessionButton body={{ mode: "diagnostic" }} label={profile?.diagnosticCompletedAt ? "Retake the check" : "Start the check"} />}
          {profile?.diagnosticCompletedAt && <ButtonLink href="/app/skills" variant="ghost">See my Skill Map</ButtonLink>}
        </div>
      </Card>
    </div>
  );
}
