"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Keyboard } from "lucide-react";

const Monaco = dynamic(() => import("@monaco-editor/react").then((m) => m.Editor), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center bg-code-bg text-sm text-code-dim">Loading editor…</div>,
});

/**
 * Monaco (C++ highlighting) with a plain-textarea fallback: used automatically if Monaco can't load
 * in time (offline / slow connection), or chosen by the student ("Simple editor").
 */
export function CodeEditor({ value, onChange, height = 340, label = "Code editor", readOnly = false }: {
  value: string; onChange: (v: string) => void; height?: number; label?: string; readOnly?: boolean;
}) {
  const [simple, setSimple] = useState(false);
  const [mounted, setMounted] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    // Monaco is awkward on phones (tiny touch targets, no proper soft-keyboard support), so small
    // screens start in the simple editor. The student can still switch.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- screen size is only known in the browser
    if (window.matchMedia?.("(max-width: 640px)").matches) setSimple(true);
    const t = setTimeout(() => {
      if (!mountedRef.current) setSimple(true);
    }, 12_000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="overflow-hidden rounded-xl border border-code-line bg-code-bg">
      <div className="flex items-center justify-between border-b border-code-line px-3 py-1.5 text-xs text-code-dim">
        <span className="font-mono">main.cpp</span>
        <div className="flex items-center gap-3">
          {!simple && mounted && <span className="hidden items-center gap-1 sm:flex" title="Tab inserts spaces in the editor. Press Ctrl+M to make Tab move focus instead."><Keyboard size={13} aria-hidden /> Ctrl+M: Tab moves focus</span>}
          <button type="button" className="rounded px-1.5 py-0.5 font-semibold hover:bg-code-line hover:text-code-ink" onClick={() => setSimple((s) => !s)}>
            {simple ? "Full editor" : "Simple editor"}
          </button>
        </div>
      </div>
      <div style={{ height }}>
        {simple ? (
          <textarea
            aria-label={label}
            value={value}
            readOnly={readOnly}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              // Tab indents in the simple editor; Escape then Tab leaves it (keyboard users aren't trapped).
              if (e.key === "Tab" && !e.shiftKey && !(e.currentTarget.dataset.escaped === "1")) {
                e.preventDefault();
                const el = e.currentTarget;
                const start = el.selectionStart;
                const next = `${value.slice(0, start)}    ${value.slice(el.selectionEnd)}`;
                onChange(next);
                requestAnimationFrame(() => el.setSelectionRange(start + 4, start + 4));
              }
              e.currentTarget.dataset.escaped = e.key === "Escape" ? "1" : "0";
            }}
            spellCheck={false}
            className="h-full w-full resize-none bg-code-bg p-3 font-mono text-[13.5px] leading-6 text-code-ink outline-none"
          />
        ) : (
          <Monaco
            height="100%"
            defaultLanguage="cpp"
            value={value}
            // Code panels are warm-dark in both app themes; the editor uses the same palette.
            theme="cmk-night"
            beforeMount={(monaco) => {
              monaco.editor.defineTheme("cmk-night", {
                base: "vs-dark", inherit: true,
                rules: [
                  { token: "comment", foreground: "8796b8", fontStyle: "italic" },
                  { token: "keyword", foreground: "7cb7ff" },
                  { token: "string", foreground: "ffcb6b" },
                  { token: "number", foreground: "f78c6c" },
                  { token: "keyword.directive", foreground: "c792ea" },
                ],
                colors: {
                  "editor.background": "#0f1a33", "editor.foreground": "#e6edf9", "editorLineNumber.foreground": "#56658a",
                  "editorLineNumber.activeForeground": "#e6edf9", "editor.lineHighlightBackground": "#17244a", "editorCursor.foreground": "#6ee7b7",
                  "editor.selectionBackground": "#2e62ff66", "editorIndentGuide.background1": "#1f2c4d",
                },
              });
            }}
            onChange={(v) => onChange(v ?? "")}
            onMount={(editor) => {
              mountedRef.current = true;
              setMounted(true);
              editor.getModel()?.updateOptions({ tabSize: 4, insertSpaces: true });
            }}
            options={{
              readOnly,
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "var(--font-code), ui-monospace, monospace",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              wordWrap: "on",
              accessibilitySupport: "auto",
              ariaLabel: label,
              padding: { top: 10 },
              renderLineHighlight: "line",
              quickSuggestions: false,
              suggestOnTriggerCharacters: false,
            }}
          />
        )}
      </div>
    </div>
  );
}
