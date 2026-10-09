"use client";

import { ArrowRight, RotateCw } from "lucide-react";
import { ButtonLink } from "@/components/ui";
import { hasProgress, recommendedLesson, useProgress } from "@/lib/guest-progress";

/** "Start Learning", plus "Continue Learning" when this browser has saved progress. */
export function StartButtons({ order, titles, firstLessonId }: { order: string[]; titles: Record<string, string>; firstLessonId: string }) {
  const progress = useProgress();
  const resume = hasProgress(progress) ? recommendedLesson(order, progress) : null;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <ButtonLink href={`/learn/${firstLessonId}`} size="lg">Start Learning <ArrowRight size={18} aria-hidden /></ButtonLink>
      {resume && (
        <ButtonLink href={`/learn/${resume}`} size="lg" variant="secondary">
          <RotateCw size={17} aria-hidden /> Continue Learning<span className="hidden font-normal text-ink-2 sm:inline">: {titles[resume]}</span>
        </ButtonLink>
      )}
    </div>
  );
}
