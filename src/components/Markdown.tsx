import type { ReactNode } from "react";
import { CodeBlock } from "./CodeBlock";

/**
 * Safe markdown subset for lesson text and AI replies: paragraphs, **bold**, *italic*, `code`,
 * ```cpp blocks, "- " and "1. " lists, "> " quotes and | tables |. Output is React elements only —
 * HTML in the input is shown as text, never rendered.
 */
function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g;
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(re)) {
    const at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    const t = m[0];
    const key = `${keyBase}-${i++}`;
    if (t.startsWith("`")) out.push(<code key={key} className="rounded-md bg-sunken px-1.5 py-0.5 font-mono text-[0.9em] text-ink">{t.slice(1, -1)}</code>);
    else if (t.startsWith("**")) out.push(<strong key={key} className="font-semibold text-ink">{t.slice(2, -2)}</strong>);
    else out.push(<em key={key}>{t.slice(1, -1)}</em>);
    last = at + t.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

type Block =
  | { k: "p"; text: string }
  | { k: "code"; text: string }
  | { k: "ul" | "ol"; items: string[] }
  | { k: "quote"; text: string }
  | { k: "table"; rows: string[][] };

function parse(src: string): Block[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    if (line.trim().startsWith("```")) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) body.push(lines[i++]);
      i++;
      blocks.push({ k: "code", text: body.join("\n") });
      continue;
    }
    if (/^\s*\|/.test(line)) {
      const rows: string[][] = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) {
        // `\|` is a literal pipe inside a cell (e.g. the `||` operator).
        const cells = lines[i].trim().replace(/^\||\|$/g, "").split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, "|"));
        if (!cells.every((c) => /^:?-{2,}:?$/.test(c))) rows.push(cells);
        i++;
      }
      blocks.push({ k: "table", rows });
      continue;
    }
    if (/^\s*[-*] /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*] /.test(lines[i])) items.push(lines[i++].replace(/^\s*[-*] /, ""));
      blocks.push({ k: "ul", items });
      continue;
    }
    if (/^\s*\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\. /.test(lines[i])) items.push(lines[i++].replace(/^\s*\d+\. /, ""));
      blocks.push({ k: "ol", items });
      continue;
    }
    if (line.startsWith(">")) {
      const body: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) body.push(lines[i++].replace(/^>\s?/, ""));
      blocks.push({ k: "quote", text: body.join(" ") });
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(\s*[-*] |\s*\d+\. |>|\s*\||\s*```)/.test(lines[i])) para.push(lines[i++]);
    blocks.push({ k: "p", text: para.join(" ") });
  }
  return blocks;
}

export function Markdown({ text, className }: { text: string; className?: string }) {
  const blocks = parse(text);
  return (
    <div className={className ?? "space-y-3 leading-relaxed text-ink-2"}>
      {blocks.map((b, i) => {
        const key = `b${i}`;
        switch (b.k) {
          case "p": return <p key={key}>{inline(b.text, key)}</p>;
          case "code": return <CodeBlock key={key} code={b.text} />;
          case "ul": return <ul key={key} className="ml-5 list-disc space-y-1.5 marker:text-ink-3">{b.items.map((it, j) => <li key={j}>{inline(it, `${key}-${j}`)}</li>)}</ul>;
          case "ol": return <ol key={key} className="ml-5 list-decimal space-y-1.5 marker:font-semibold marker:text-ink-3">{b.items.map((it, j) => <li key={j}>{inline(it, `${key}-${j}`)}</li>)}</ol>;
          case "quote": return <blockquote key={key} className="rounded-r-lg border-l-4 border-concept bg-concept-soft/60 px-4 py-2 text-ink">{inline(b.text, key)}</blockquote>;
          case "table": {
            const [head, ...rows] = b.rows;
            return (
              <div key={key} className="overflow-x-auto rounded-xl border border-line">
                <table className="w-full text-sm">
                  <thead className="bg-sunken text-left text-ink"><tr>{head.map((c, j) => <th key={j} scope="col" className="px-3 py-2 font-semibold">{inline(c, `${key}-h${j}`)}</th>)}</tr></thead>
                  <tbody>{rows.map((r, ri) => <tr key={ri} className="border-t border-line">{r.map((c, j) => <td key={j} className="px-3 py-2">{inline(c, `${key}-${ri}-${j}`)}</td>)}</tr>)}</tbody>
                </table>
              </div>
            );
          }
        }
      })}
    </div>
  );
}
