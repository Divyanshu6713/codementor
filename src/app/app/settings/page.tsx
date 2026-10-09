import type { Metadata } from "next";
import { requirePageUser } from "@/server/auth/current";
import { getProfile } from "@/server/services/students";
import { linkedParents } from "@/server/services/parents";
import { PageHeader } from "@/components/ui";
import { SettingsPanel } from "@/components/app/SettingsPanel";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requirePageUser(["STUDENT"]);
  const [profile, parents] = await Promise.all([getProfile(user.id), linkedParents(user.id)]);
  return (
    <div className="max-w-3xl">
      <PageHeader title="Settings" subtitle={`Signed in as ${user.username}.`} />
      <SettingsPanel prefs={{ askConfidence: profile?.askConfidence ?? true, tutorRetentionDays: profile?.tutorRetentionDays ?? 0 }} parents={parents.map((p) => ({ id: p.id, displayName: p.displayName }))} />
    </div>
  );
}
