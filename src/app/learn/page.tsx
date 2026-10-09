import type { Metadata } from "next";
import { RoadmapOverview } from "@/components/learn/RoadmapOverview";
import { SiteFooter, SiteHeader } from "@/components/learn/SiteHeader";
import { StorageNotice } from "@/components/learn/StorageNotice";
import { roadmap } from "@/content/course";

export const metadata: Metadata = { title: "Course map" };

export default function LearnPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-extrabold tracking-tight">C++ course map</h1>
        <p className="mt-2 text-ink-2">Go in order, or jump to any lesson — nothing is locked.</p>
        <StorageNotice className="mb-6 mt-2 text-xs text-ink-3" />
        <RoadmapOverview roadmap={roadmap()} />
      </main>
      <SiteFooter />
    </div>
  );
}
