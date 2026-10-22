import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

/** Minimal header for the public (no sign-in) pages. */
export function SiteHeader({ wide = false }: { wide?: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-bg/90 backdrop-blur">
      <div className={`mx-auto flex items-center justify-between gap-3 px-4 py-3 sm:px-6 ${wide ? "max-w-[1440px]" : "max-w-5xl"}`}>
        <Logo />
        <nav aria-label="Site" className="flex items-center gap-1">
          <Link href="/start" className="rounded-lg px-3 py-2 text-sm font-semibold text-ink-2 hover:bg-sunken hover:text-ink">Start learning</Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line py-8 text-sm text-ink-3">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 sm:px-6">
        <p>CodeMentor · an independent C++ learning project · not an official service of any institution</p>
        <nav aria-label="Footer" className="flex gap-4">
          <Link href="/privacy" className="hover:text-ink">Privacy</Link>
          <Link href="/login" className="hover:text-ink">Account sign-in</Link>
        </nav>
      </div>
    </footer>
  );
}
