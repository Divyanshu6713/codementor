"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/app/python", label: "Dashboard", exact: true },
  { href: "/app/python/roadmap", label: "Roadmap" },
  { href: "/app/python/workspace", label: "Workspace" },
  { href: "/app/python/practice", label: "Practice" },
  { href: "/app/python/revise", label: "Revise" },
  { href: "/app/python/challenges", label: "Challenges" },
  { href: "/app/python/projects", label: "Projects" },
  { href: "/app/python/interview", label: "Interview" },
  { href: "/app/python/reference", label: "Quick reference" },
  { href: "/app/python/compare", label: "Python vs C++" },
];

/** Section navigation inside Python Mastery (scrolls sideways on small screens). */
export function PyNav({ due }: { due: number }) {
  const pathname = usePathname();
  const active = (href: string, exact?: boolean) => (exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));
  return (
    <nav aria-label="Python Mastery" className="-mx-4 mb-6 overflow-x-auto px-4 sm:-mx-0 sm:px-0">
      <ul className="flex min-w-max gap-1 rounded-2xl border border-line bg-surface p-1 shadow-card">
        {TABS.map((t) => {
          const on = active(t.href, t.exact) || (t.href === "/app/python/roadmap" && (pathname.startsWith("/app/python/learn") || pathname.startsWith("/app/python/module")));
          return (
            <li key={t.href}>
              <Link href={t.href} aria-current={on ? "page" : undefined}
                className={clsx("flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold transition-colors", on ? "bg-accent-soft text-accent-ink" : "text-ink-2 hover:bg-sunken hover:text-ink")}>
                {t.label}
                {t.href === "/app/python/revise" && due > 0 && <span className="rounded-full bg-hint px-1.5 text-xs text-white" aria-label={`${due} due`}>{due}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
