import type { Metadata } from "next";
import { requirePageUser } from "@/server/auth/current";
import { getProfile } from "@/server/services/students";
import { linkedParents } from "@/server/services/parents";
import { PageHeader } from "@/components/ui";
import { SettingsPanel } from "@/components/app/SettingsPanel";
import { ClaimAccount } from "@/components/app/ClaimAccount";
import { AccountSecurity } from "@/components/auth/AccountSecurity";
import { hasRecoveryCode } from "@/server/auth/recovery";
import { Callout, Card } from "@/components/ui";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ claimed?: string }> }) {
  const user = await requirePageUser(["STUDENT"]);
  const justClaimed = (await searchParams).claimed === "1" && !user.isGuest;
  const [profile, parents, hasCode] = await Promise.all([getProfile(user.id), linkedParents(user.id), user.isGuest ? false : hasRecoveryCode(user.id)]);
  return (
    <div className="max-w-3xl">
      <PageHeader title="Settings" subtitle={user.isGuest ? "You're learning as a guest." : `Signed in as ${user.username}.`} />
      {justClaimed && (
        <Callout tone="success" title="Your progress is saved" className="mb-6">It now belongs to <strong>{user.username}</strong>. Sign in with that username and your password on any device.</Callout>
      )}
      {user.isGuest && (
        <Card className="mb-6 space-y-3 p-6" as="section" aria-labelledby="keep">
          <h2 id="keep" className="font-semibold">Keep your progress</h2>
          <p className="text-sm text-ink-2">Right now your XP and progress are tied to this browser&apos;s guest session — clearing cookies or switching devices loses them. Add a username and password to keep them for good. Optional, no email needed.</p>
          <ClaimAccount displayName={user.displayName} />
        </Card>
      )}
      {!user.isGuest && <div className="mb-6"><AccountSecurity hasRecoveryCode={hasCode} /></div>}
      <SettingsPanel isGuest={user.isGuest} prefs={{ askConfidence: profile?.askConfidence ?? true, tutorRetentionDays: profile?.tutorRetentionDays ?? 0 }} parents={parents.map((p) => ({ id: p.id, displayName: p.displayName }))} />
    </div>
  );
}
