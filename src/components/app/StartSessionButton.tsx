"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { Button, Callout } from "@/components/ui";

type Body =
  | { mode: "recommended"; length?: string; useAlternative?: boolean }
  | { mode: "diagnostic" }
  | { mode: "lesson"; lessonId: string; length?: string }
  | { mode: "practice"; conceptId?: string; skills?: string[]; length?: string }
  | { mode: "revision"; skills: string[]; length?: string }
  | { mode: "mistake"; mistakeId: string }
  | { mode: "problem"; questionId: string };

export function StartSessionButton({ body, label, variant = "primary", size = "lg", className }: {
  body: Body; label: string; variant?: "primary" | "secondary" | "hint" | "inverse"; size?: "md" | "lg" | "sm"; className?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className={className}>
      <Button
        variant={variant}
        size={size}
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError(null);
          try {
            const res = await api<{ url: string }>("/api/learning-session", { body });
            router.push(res.url);
          } catch (err) {
            setError((err as Error).message);
            setBusy(false);
          }
        }}
      >
        {busy ? "Preparing…" : label} {!busy && <ArrowRight size={18} aria-hidden />}
      </Button>
      {error && <Callout tone="danger" className="mt-3">{error}</Callout>}
    </div>
  );
}
