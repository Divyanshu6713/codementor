"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { BookOpenCheck, Code2, Dumbbell, Home, LogOut, Map, Medal, NotebookPen, RotateCcw, Settings, Swords, Trophy } from "lucide-react";
import { api } from "@/lib/api";

// Each section has its own colour (same hues as topics), so the nav reads at a glance.
const ITEMS = [
  { href: "/app", label: "Home", icon: Home, exact: true, hue: "text-accent" },
  { href: "/app/learn", label: "Learn", icon: BookOpenCheck, hue: "text-concept" },
  { href: "/app/arena", label: "Arena", icon: Swords, hue: "text-pink" },
  { href: "/app/practice", label: "Practice", icon: Dumbbell, hue: "text-teal" },
  { href: "/app/revise", label: "Revise", icon: RotateCcw, hue: "text-sky" },
  { href: "/app/leaderboard", label: "Leaderboard", icon: Medal, hue: "text-clay" },
  { href: "/app/skills", label: "My progress", icon: Map, hue: "text-success" },
  { href: "/app/mistakes", label: "My mistakes", icon: NotebookPen, hue: "text-hint" },
  { href: "/app/playground", label: "Playground", icon: Code2, hue: "text-concept" },
  { href: "/app/achievements", label: "Achievements", icon: Trophy, hue: "text-clay" },
];

export function AppNav({ revisionDue, openMistakes }: { revisionDue: number; openMistakes: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const counts: Record<string, number> = { "/app/revise": revisionDue, "/app/mistakes": openMistakes };
  const active = (href: string, exact?: boolean) => (exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));

  async function logout() {
    const res = await api<{ redirect: string }>("/api/auth/logout", { body: {} }).catch(() => ({ redirect: "/" }));
    router.push(res.redirect);
    router.refresh();
  }

  return (
    <nav aria-label="Main" className="flex gap-1 overflow-x-auto px-3 pb-2 lg:flex-col lg:overflow-visible lg:px-3 lg:pb-0">
      {ITEMS.map(({ href, label, icon: Icon, exact, hue }) => (
        <Link
          key={href}
          href={href}
          aria-current={active(href, exact) ? "page" : undefined}
          className={clsx(
            "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
            active(href, exact) ? "bg-accent-soft text-accent-ink" : "text-ink-2 hover:bg-sunken hover:text-ink",
          )}
        >
          <Icon size={18} className={hue} aria-hidden />
          <span>{label}</span>
          {counts[href] ? <span className="ml-auto rounded-full bg-hint-soft px-2 text-xs text-hint" aria-label={`${counts[href]} pending`}>{counts[href]}</span> : null}
        </Link>
      ))}
      <div className="hidden lg:mt-4 lg:block lg:border-t lg:border-line lg:pt-4" />
      <Link href="/app/settings" aria-current={active("/app/settings") ? "page" : undefined} className={clsx("flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold", active("/app/settings") ? "bg-accent-soft text-accent-ink" : "text-ink-2 hover:bg-sunken hover:text-ink")}>
        <Settings size={18} aria-hidden /> Settings
      </Link>
      <button type="button" onClick={logout} className="flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-semibold text-ink-2 hover:bg-sunken hover:text-ink">
        <LogOut size={18} aria-hidden /> Sign out
      </button>
    </nav>
  );
}
