"use client";

import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { ButtonLink, Callout } from "@/components/ui";
import { useProgress } from "@/lib/guest-progress";

/** G. Continue — the next step, without locking anything. */
export function LessonFooter({ lessonId, next, prev }: { lessonId: string; next: { id: string; title: string } | null; prev: { id: string; title: string } | null }) {
  const progress = useProgress();
  const completed = Boolean(progress.lessons[lessonId]?.completedAt);
  return (
    <div className="space-y-4">
      {completed
        ? <Callout tone="success" icon={<CheckCircle2 size={18} />} title="Lesson complete">Saved in this browser. You can come back and practise again any time.</Callout>
        : <p className="text-sm text-ink-2">This lesson is complete when your exercise passes <strong>Check answer</strong>. You can move on now and come back later — nothing is locked.</p>}
      <div className="flex flex-wrap justify-between gap-3">
        {prev ? <ButtonLink href={`/learn/${prev.id}`} variant="ghost" className="whitespace-normal"><ArrowLeft size={16} aria-hidden /> {prev.title}</ButtonLink> : <span />}
        {next
          ? <ButtonLink href={`/learn/${next.id}`} variant={completed ? "primary" : "secondary"} className="whitespace-normal">Next: {next.title} <ArrowRight size={16} aria-hidden /></ButtonLink>
          : <ButtonLink href="/learn" variant={completed ? "primary" : "secondary"}>Back to the course map <ArrowRight size={16} aria-hidden /></ButtonLink>}
      </div>
    </div>
  );
}
