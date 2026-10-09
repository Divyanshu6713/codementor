import Link from "next/link";

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <defs>
        <linearGradient id="cm-logo" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--hero-from)" />
          <stop offset="0.6" stopColor="var(--hero-via)" />
          <stop offset="1" stopColor="var(--hero-to)" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#cm-logo)" />
      <path d="M12.2 9.5c-2 0-2.9 1-2.9 2.8v1.4c0 1.1-.5 1.7-1.6 1.9v.8c1.1.2 1.6.8 1.6 1.9v1.4c0 1.8.9 2.8 2.9 2.8" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <path d="M19.8 9.5c2 0 2.9 1 2.9 2.8v1.4c0 1.1.5 1.7 1.6 1.9v.8c-1.1.2-1.6.8-1.6 1.9v1.4c0 1.8-.9 2.8-2.9 2.8" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="16" r="2.4" fill="#ffd166" />
    </svg>
  );
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 font-bold tracking-tight" aria-label="CodeMentor home">
      <LogoMark />
      <span className="text-[17px] tracking-[-0.02em]">Code<span className="text-accent">Mentor</span></span>
    </Link>
  );
}
