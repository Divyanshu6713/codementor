"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui";

export function LeaderboardToggle({ joined }: { joined: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <Button variant={joined ? "secondary" : "primary"} disabled={busy} onClick={async () => {
      setBusy(true);
      await api("/api/me/leaderboard", { body: { show: !joined } }).catch(() => undefined);
      router.refresh();
      setBusy(false);
    }}>
      {joined ? "Leave the leaderboard" : "Join the leaderboard"}
    </Button>
  );
}
