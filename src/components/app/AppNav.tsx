"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { BookOpenCheck, Code2, Dumbbell, FileCode2, Home, LogOut, Map, Medal, NotebookPen, RotateCcw, Search, Settings, Swords, Trophy } from "lucide-react";
import { api } from "@/lib/api";

// Each section has its own colour (same hues as topics), so the nav reads at a glance.
const ITEMS = [
  { href: "/app", label: "Home", icon: Home, exact: true, hue: "text-accent" },
  { href: "/app/learn", label: "Learn", icon: BookOpenCheck, hue: "text-concept" },
  { href: "/app/python", label: "Python", icon: FileCode2, hue: "text-accent" },
  { href: "/app/playground", label: "Playground", icon: Code2, hue: "text-teal" },
  { href: "/app/arena", label: "Arena", icon: Swords, hue: "text-pink" },
  { href: "/app/practice", label: "Practice", icon: Dumbbell, hue: "text-teal" },
  { href: "/app/revise", label: "Revise", icon: RotateCcw, hue: "text-sky" },
  { href: "/app/leaderboard", label: "Leaderboard", icon: Medal, hue: "text-clay" },
  { href: "/app/skills", label: "My progress", icon: Map, hue: "text-success" },
  { href: "/app/mistakes", label: "My mistakes", icon: NotebookPen, hue: "text-hint" },
  { href: "/app/achievements", label: "Achievements", icon: Trophy, hue: "text-clay" },
  { href: "/app/search", label: "Search", icon: Search, hue: "text-ink-2" },
];

export function AppNav({ revisionDue, openMistakes, isGuest = false }: { revisionDue: number; openMistakes: number; isGuest?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const counts: Record<string, number> = { "/app/revise": revisionDue, "/app/mistakes": openMistakes };
  const active = (href: string, exact?: boolean) => (exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));

  async function logout() {
    if (isGuest && !window.confirm("You're learning as a guest. If you leave, this guest progress can't be recovered.\n\nTo keep it, add a username in Settings first.\n\nLeave anyway?")) return;
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
            "relative flex shrink-0 items-center gap-2.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors lg:rounded-xl",
            active(href, exact) ? "bg-ink text-bg lg:before:absolute lg:before:-left-3 lg:before:top-1/2 lg:before:h-5 lg:before:w-1 lg:before:-translate-y-1/2 lg:before:rounded-r-full lg:before:bg-brand" : "text-ink-2 hover:bg-sunken hover:text-ink",
          )}
        >
          <Icon size={18} className={active(href, exact) ? undefined : hue} aria-hidden />
          <span>{label}</span>
          {counts[href] ? <span className="ml-auto rounded-full bg-brand px-2 font-mono text-xs font-bold text-on-brand" aria-label={`${counts[href]} pending`}>{counts[href]}</span> : null}
        </Link>
      ))}
      <div className="hidden lg:mt-4 lg:block lg:border-t lg:border-line lg:pt-4" />
      <Link href="/app/settings" aria-current={active("/app/settings") ? "page" : undefined} className={clsx("flex shrink-0 items-center gap-2.5 rounded-full px-3.5 py-2 text-sm font-semibold lg:rounded-xl", active("/app/settings") ? "bg-ink text-bg" : "text-ink-2 hover:bg-sunken hover:text-ink")}>
        <Settings size={18} aria-hidden /> Settings
      </Link>
      <button type="button" onClick={logout} className="flex shrink-0 cursor-pointer items-center gap-2.5 rounded-full px-3.5 py-2 text-left text-sm font-semibold text-ink-2 hover:bg-sunken hover:text-ink lg:rounded-xl">
        <LogOut size={18} aria-hidden /> {isGuest ? "Leave guest session" : "Sign out"}
      </button>
    </nav>
  );
}
