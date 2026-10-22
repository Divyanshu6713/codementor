import Link from "next/link";

/** Lime tile with dark curly braces and a blinking-cursor dot — the same in light and dark mode. */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <rect width="32" height="32" rx="10" fill="var(--brand)" />
      <path d="M12.2 9.5c-2 0-2.9 1-2.9 2.8v1.4c0 1.1-.5 1.7-1.6 1.9v.8c1.1.2 1.6.8 1.6 1.9v1.4c0 1.8.9 2.8 2.9 2.8" fill="none" stroke="#0e0e10" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M19.8 9.5c2 0 2.9 1 2.9 2.8v1.4c0 1.1.5 1.7 1.6 1.9v.8c-1.1.2-1.6.8-1.6 1.9v1.4c0 1.8-.9 2.8-2.9 2.8" fill="none" stroke="#0e0e10" strokeWidth="2.2" strokeLinecap="round" />
      <rect x="14.6" y="14.2" width="2.8" height="3.6" rx="0.8" fill="#0e0e10" />
    </svg>
  );
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5" aria-label="CodeMentor home">
      <LogoMark />
      <span className="font-display text-[18px] font-bold tracking-[-0.04em]">
        code<span className="text-accent">mentor</span><span className="text-accent" aria-hidden>_</span>
      </span>
    </Link>
  );
}
