"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { ButtonLink, Callout } from "@/components/ui";
import { useLesson } from "./LessonState";

/** Continue — the next step, without locking anything. */
export function LessonFooter({ next, prev }: { next: { id: string; title: string } | null; prev: { id: string; title: string } | null }) {
  const { passed } = useLesson();
  return (
    <div className="space-y-4">
      {passed
        ? <Callout tone="success" icon={<CheckCircle2 size={18} />} title="Lesson complete">Come back and practise again any time.</Callout>
        : <p className="text-sm text-ink-2">This lesson is complete when your exercise passes <strong>Check answer</strong>. You can move on now and come back later — nothing is locked.</p>}
      {!next && <p className="text-sm text-ink-2">That&apos;s the last lesson of the C++ course — congratulations on getting here! Keep your skills sharp in the <Link href="/app/arena" className="font-semibold text-accent hover:underline">Arena</Link> or the <Link href="/app/playground" className="font-semibold text-accent hover:underline">Playground</Link>.</p>}
      <div className="flex flex-wrap justify-between gap-3">
        {prev ? <ButtonLink href={`/app/learn/${prev.id}`} variant="ghost" className="h-auto! min-h-11 max-w-full py-2 text-left whitespace-normal!"><ArrowLeft size={16} aria-hidden /> {prev.title}</ButtonLink> : <span />}
        {next
          ? <ButtonLink href={`/app/learn/${next.id}`} variant={passed ? "primary" : "secondary"} className="h-auto! min-h-11 max-w-full py-2 text-left whitespace-normal!">Next: {next.title} <ArrowRight size={16} aria-hidden /></ButtonLink>
          : <ButtonLink href="/app/learn" variant={passed ? "primary" : "secondary"}>Back to Learn <ArrowRight size={16} aria-hidden /></ButtonLink>}
      </div>
    </div>
  );
}
