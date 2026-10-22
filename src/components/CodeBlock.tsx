import clsx from "clsx";
import type { ReactNode } from "react";

const KEYWORDS = new Set([
  "int", "double", "float", "char", "bool", "void", "long", "short", "unsigned", "const", "auto", "string",
  "for", "while", "do", "if", "else", "return", "break", "continue", "switch", "case", "default",
  "true", "false", "using", "namespace", "std", "include", "struct", "class", "public", "private", "new", "nullptr",
]);
const TOKEN = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|#\s*include\s*<[^>]+>|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b)/g;

const PY_KEYWORDS = new Set([
  "False", "None", "True", "and", "as", "assert", "async", "await", "break", "class", "continue", "def", "del", "elif", "else", "except",
  "finally", "for", "from", "global", "if", "import", "in", "is", "lambda", "match", "case", "nonlocal", "not", "or", "pass", "raise",
  "return", "try", "while", "with", "yield",
]);
const PY_BUILTINS = new Set(["print", "input", "len", "range", "int", "float", "str", "bool", "list", "dict", "set", "tuple", "type", "sum", "min", "max", "sorted", "enumerate", "zip", "open", "isinstance", "abs", "round", "map", "filter", "any", "all", "self", "super"]);
const PY_TOKEN = /(#[^\n]*|[rbfRBF]{0,2}"""[\s\S]*?"""|[rbfRBF]{0,2}'''[\s\S]*?'''|[rbfRBF]{0,2}"(?:\\.|[^"\\\n])*"|[rbfRBF]{0,2}'(?:\\.|[^'\\\n])*'|@\w+|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b)/g;

/** Tiny, safe Python highlighter (same colours as the C++ one). */
export function highlightPython(code: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of code.matchAll(PY_TOKEN)) {
    const t = m[0];
    const at = m.index ?? 0;
    if (at > last) out.push(code.slice(last, at));
    let cls: string | null = null;
    if (t.startsWith("#")) cls = "text-code-dim italic";
    else if (/^[rbfRBF]{0,2}["']/.test(t)) cls = "text-[#ffcb6b]";
    else if (t.startsWith("@")) cls = "text-[#c792ea]";
    else if (/^\d/.test(t)) cls = "text-[#f78c6c]";
    else if (PY_KEYWORDS.has(t)) cls = "text-[#7cb7ff] font-medium";
    else if (PY_BUILTINS.has(t)) cls = "text-[#6ee7b7]";
    out.push(cls ? <span key={i++} className={cls}>{t}</span> : t);
    last = at + t.length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

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

export function CodeBlock({ code, className, highlightLine, label, numbered = true, language = "cpp" }: { code: string; className?: string; highlightLine?: number | null; label?: string; numbered?: boolean; language?: "cpp" | "python" | "text" }) {
  const highlight = language === "python" ? highlightPython : language === "text" ? (l: string) => [l] : highlightCpp;
  const lines = code.replace(/\n$/, "").split("\n");
  return (
    <figure className={clsx("overflow-hidden rounded-xl border border-code-line bg-code-bg text-code-ink", className)}>
      {label && <figcaption className="border-b border-code-line px-4 py-1.5 font-mono text-xs text-code-dim">{label}</figcaption>}
      <pre className="overflow-x-auto py-3 font-mono text-[13.5px] leading-6" tabIndex={0} aria-label={label ?? "Code"}>
        <code>
          {lines.map((line, i) => (
            <div key={i} className={clsx("flex pr-4", highlightLine === i + 1 && "bg-code-hl")} aria-current={highlightLine === i + 1 ? "step" : undefined}>
              {numbered && <span className="w-10 shrink-0 select-none pr-3 text-right text-code-faint" aria-hidden>{i + 1}</span>}
              <span className={clsx("whitespace-pre", !numbered && "pl-4")}>{highlight(line)}{line === "" ? " " : ""}</span>
            </div>
          ))}
        </code>
      </pre>
    </figure>
  );
}
