import clsx from "clsx";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/* ── Buttons ─────────────────────────────────────────────────────────── */

type Variant = "primary" | "brand" | "secondary" | "ghost" | "danger" | "hint" | "inverse";
const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-on-accent hover:brightness-110 shadow-card",
  /** Electric-lime CTA with dark text — identical in light and dark mode. */
  brand: "bg-brand text-on-brand hover:brightness-105 hover:shadow-[0_0_0_4px_color-mix(in_srgb,var(--brand)_30%,transparent)]",
  secondary: "bg-surface text-ink border border-line-strong hover:border-ink hover:bg-sunken",
  ghost: "text-ink-2 hover:bg-sunken hover:text-ink",
  danger: "bg-danger text-on-accent hover:opacity-90",
  hint: "bg-hint-soft text-hint border border-hint/30 hover:bg-hint/15",
  /** For gradient/colour panels: white button with near-black text. */
  inverse: "bg-white text-[#0e0e10] hover:bg-white/90 shadow-card",
};
const SIZES = { sm: "h-9 px-4 text-sm gap-1.5", md: "h-11 px-5 text-sm gap-2", lg: "h-13 px-7 text-base gap-2" };

export function buttonClass(variant: Variant = "primary", size: keyof typeof SIZES = "md", extra?: string) {
  return clsx(
    "inline-flex cursor-pointer select-none items-center justify-center rounded-full font-semibold tracking-[-0.01em] transition-[background-color,color,box-shadow,transform,filter,border-color] duration-200 ease-[var(--ease-calm)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap",
    VARIANTS[variant], SIZES[size], extra,
  );
}

export function Button({ variant = "primary", size = "md", className, ...props }: ComponentProps<"button"> & { variant?: Variant; size?: keyof typeof SIZES }) {
  return <button type="button" className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({ variant = "primary", size = "md", className, ...props }: ComponentProps<typeof Link> & { variant?: Variant; size?: keyof typeof SIZES }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

/* ── Surfaces ────────────────────────────────────────────────────────── */

export function Card({ className, children, as: Tag = "div", interactive, ...rest }: { className?: string; children: ReactNode; as?: "div" | "section" | "article" | "li"; interactive?: boolean } & Record<string, unknown>) {
  return (
    <Tag
      className={clsx(
        "rounded-[var(--radius-card)] border border-line bg-surface shadow-card",
        interactive && "transition-[transform,box-shadow,border-color] duration-300 ease-[var(--ease-calm)] hover:-translate-y-1 hover:border-accent/60 hover:shadow-pop",
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function PageHeader({ title, subtitle, actions, eyebrow }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode; eyebrow?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="mb-2 inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-ink-3"><span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />{eyebrow}</p>}
        <h1 className="text-[1.75rem] font-bold leading-tight sm:text-[2.5rem] sm:leading-[1.1]">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-ink-2">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export type Tone = "neutral" | "accent" | "concept" | "hint" | "danger" | "success" | "clay" | "pink" | "teal" | "sky";
const TONES: Record<Tone, string> = {
  neutral: "bg-sunken text-ink-2",
  accent: "bg-accent-soft text-accent-ink",
  concept: "bg-concept-soft text-concept",
  hint: "bg-hint-soft text-hint",
  danger: "bg-danger-soft text-danger",
  success: "bg-success-soft text-success",
  clay: "bg-clay-soft text-clay",
  pink: "bg-pink-soft text-pink",
  teal: "bg-teal-soft text-teal",
  sky: "bg-sky-soft text-sky",
};

export function Badge({ tone = "neutral", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return <span className={clsx("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", TONES[tone], className)}>{children}</span>;
}

export function Callout({ tone = "neutral", title, children, icon, className }: { tone?: Tone; title?: ReactNode; children?: ReactNode; icon?: ReactNode; className?: string }) {
  const border = { neutral: "border-line", accent: "border-accent/30", concept: "border-concept/30", hint: "border-hint/30", danger: "border-danger/30", success: "border-success/30", clay: "border-clay/30", pink: "border-pink/30", teal: "border-teal/30", sky: "border-sky/30" }[tone];
  return (
    <div className={clsx("flex gap-3 rounded-xl border p-4", TONES[tone], border, className)} role={tone === "danger" ? "alert" : undefined}>
      {icon && <div className="mt-0.5 shrink-0">{icon}</div>}
      <div className="min-w-0 text-sm">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={clsx(title && "mt-1", "text-ink-2 [&_strong]:text-ink")}>{children}</div>}
      </div>
    </div>
  );
}

export function EmptyState({ title, children, action, icon }: { title: string; children?: ReactNode; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-line-strong bg-surface/60 px-6 py-12 text-center">
      {icon && <div className="mb-3 text-ink-3">{icon}</div>}
      <p className="font-semibold">{title}</p>
      {children && <div className="mt-1 max-w-md text-sm text-ink-2">{children}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <span role="status" className="inline-flex items-center gap-2 text-sm text-ink-3">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-line-strong border-t-accent" aria-hidden />
      {label}
    </span>
  );
}

/* ── Mastery ─────────────────────────────────────────────────────────── */

export function masteryColor(m: number | null) {
  if (m === null) return "var(--line-strong)";
  return m < 0.4 ? "var(--m-low)" : m < 0.6 ? "var(--m-mid)" : m < 0.8 ? "var(--m-good)" : "var(--m-high)";
}

export function pct(m: number | null | undefined) {
  return m === null || m === undefined ? "—" : `${Math.round(m * 100)}%`;
}

export function MasteryBar({ value, label, className }: { value: number | null; label?: string; className?: string }) {
  const v = value ?? 0;
  return (
    <div
      className={clsx("h-2 w-full overflow-hidden rounded-full bg-sunken", className)}
      role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value === null ? undefined : Math.round(v * 100)}
      aria-valuetext={value === null ? "Not assessed yet" : `${Math.round(v * 100)} percent`} aria-label={label}
    >
      {value !== null && <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${Math.max(3, v * 100)}%`, background: masteryColor(value) }} />}
    </div>
  );
}

export function ConfidenceDots({ label }: { label: string | null }) {
  if (!label) return null;
  const n = label === "High" ? 3 : label === "Medium" ? 2 : 1;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-ink-3" title={`${label} confidence: how much evidence we have`}>
      <span className="flex gap-0.5" aria-hidden>
        {[1, 2, 3].map((i) => <span key={i} className={clsx("h-1.5 w-1.5 rounded-full", i <= n ? "bg-ink-2" : "bg-line-strong")} />)}
      </span>
      {label} confidence
    </span>
  );
}

export const STATUS_LABEL: Record<string, { label: string; tone: Tone }> = {
  NEW: { label: "Not started", tone: "neutral" },
  LEARNING: { label: "Learning", tone: "concept" },
  PRACTICING: { label: "Practising", tone: "accent" },
  MASTERED: { label: "Mastered", tone: "success" },
  REVISION_DUE: { label: "Review due", tone: "hint" },
  REINFORCING: { label: "Reinforcing", tone: "hint" },
  INFERRED: { label: "Likely known (not tested)", tone: "neutral" },
};

/* ── Forms ───────────────────────────────────────────────────────────── */

export function Field({ label, htmlFor, hint, error, children }: { label: string; htmlFor: string; hint?: string; error?: string | null; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-semibold">{label}</label>
      {children}
      {hint && !error && <p id={`${htmlFor}-hint`} className="text-xs text-ink-3">{hint}</p>}
      {error && <p id={`${htmlFor}-error`} className="text-xs font-medium text-danger">{error}</p>}
    </div>
  );
}

export const inputClass = "h-11 w-full rounded-[0.85rem] border border-line-strong bg-surface px-3.5 text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";
