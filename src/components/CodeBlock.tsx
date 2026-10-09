import clsx from "clsx";
import type { ReactNode } from "react";

const KEYWORDS = new Set([
  "int", "double", "float", "char", "bool", "void", "long", "short", "unsigned", "const", "auto", "string",
  "for", "while", "do", "if", "else", "return", "break", "continue", "switch", "case", "default",
  "true", "false", "using", "namespace", "std", "include", "struct", "class", "public", "private", "new", "nullptr",
]);
const TOKEN = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|#\s*include\s*<[^>]+>|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b)/g;

/** Tiny, safe C++ highlighter: returns React nodes, never HTML strings. */
export function highlightCpp(code: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of code.matchAll(TOKEN)) {
    const t = m[0];
    const at = m.index ?? 0;
    if (at > last) out.push(code.slice(last, at));
    let cls: string | null = null;
    if (t.startsWith("//") || t.startsWith("/*")) cls = "text-code-dim italic";
    else if (t.startsWith('"') || t.startsWith("'")) cls = "text-[#ffcb6b]";
    else if (t.startsWith("#")) cls = "text-[#c792ea]";
    else if (/^\d/.test(t)) cls = "text-[#f78c6c]";
    else if (KEYWORDS.has(t)) cls = "text-[#7cb7ff] font-medium";
    else if (t === "cout" || t === "cin" || t === "endl" || t === "main") cls = "text-[#6ee7b7]";
    out.push(cls ? <span key={i++} className={cls}>{t}</span> : t);
    last = at + t.length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

export function CodeBlock({ code, className, highlightLine, label, numbered = true }: { code: string; className?: string; highlightLine?: number | null; label?: string; numbered?: boolean }) {
  const lines = code.replace(/\n$/, "").split("\n");
  return (
    <figure className={clsx("overflow-hidden rounded-xl border border-code-line bg-code-bg text-code-ink", className)}>
      {label && <figcaption className="border-b border-code-line px-4 py-1.5 font-mono text-xs text-code-dim">{label}</figcaption>}
      <pre className="overflow-x-auto py-3 font-mono text-[13.5px] leading-6" tabIndex={0} aria-label={label ?? "Code"}>
        <code>
          {lines.map((line, i) => (
            <div key={i} className={clsx("flex pr-4", highlightLine === i + 1 && "bg-code-hl")} aria-current={highlightLine === i + 1 ? "step" : undefined}>
              {numbered && <span className="w-10 shrink-0 select-none pr-3 text-right text-code-faint" aria-hidden>{i + 1}</span>}
              <span className={clsx("whitespace-pre", !numbered && "pl-4")}>{highlightCpp(line)}{line === "" ? " " : ""}</span>
            </div>
          ))}
        </code>
      </pre>
    </figure>
  );
}
