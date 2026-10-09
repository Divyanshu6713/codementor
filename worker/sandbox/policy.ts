/**
 * Source policy — the first line of defence, applied before anything is compiled.
 *
 * Learners only need standard console C++. Everything that reaches the operating system or the
 * filesystem, and every preprocessor feature that can read files at compile time (#embed, quoted
 * #include, #include_next …), is refused with a friendly message. OS-level limits in the backend are
 * the second line of defence; this policy is not relied on alone.
 */

export const ALLOWED_HEADERS = new Set([
  "iostream", "iomanip", "string", "vector", "array", "algorithm", "numeric", "utility", "cmath", "climits",
  "cfloat", "cstdlib", "cstdio", "cstring", "cctype", "cstdint", "map", "set", "unordered_map", "unordered_set",
  "stack", "queue", "deque", "list", "sstream", "functional", "iterator", "limits", "tuple", "bitset",
]);

/** Identifiers that reach the OS, files, processes or the environment. */
const BANNED_IDENTIFIERS = [
  "asm", "__asm", "__asm__", "extern", "__attribute__", "__declspec", "system", "popen", "_popen", "fopen", "freopen",
  "_wfopen", "fopen_s", "tmpfile", "remove", "rename", "getenv", "_getenv", "putenv", "fstream", "ifstream", "ofstream",
  "filebuf", "filesystem", "fork", "vfork", "execl", "execlp", "execle", "execv", "execvp", "execve", "syscall", "dlopen",
  "dlsym", "LoadLibrary", "LoadLibraryA", "LoadLibraryW", "GetProcAddress", "CreateProcess", "CreateProcessA",
  "CreateProcessW", "CreateFile", "CreateFileA", "CreateFileW", "WinExec", "ShellExecute", "ShellExecuteA",
  "ShellExecuteW", "socket", "WSAStartup", "_spawnl", "_spawnv", "_execl", "_execv", "thread", "pthread_create",
];

export type PolicyResult = { ok: true } | { ok: false; message: string; line: number | null };

const MAX_SOURCE_BYTES = 64 * 1024;

/** Replaces comments, string and character literals with spaces (keeping line numbers). */
export function stripLiteralsAndComments(src: string): string {
  let out = "";
  let i = 0;
  const blank = (s: string) => s.replace(/[^\n]/g, " ");
  while (i < src.length) {
    const rest = src.slice(i);
    const raw = /^R"([^()\\\s]{0,16})\(/.exec(rest);
    if (raw) {
      const end = src.indexOf(`)${raw[1]}"`, i + raw[0].length);
      const stop = end < 0 ? src.length : end + raw[1].length + 2;
      out += blank(src.slice(i, stop));
      i = stop;
    } else if (rest.startsWith("//")) {
      const end = src.indexOf("\n", i);
      const stop = end < 0 ? src.length : end;
      out += blank(src.slice(i, stop));
      i = stop;
    } else if (rest.startsWith("/*")) {
      const end = src.indexOf("*/", i + 2);
      const stop = end < 0 ? src.length : end + 2;
      out += blank(src.slice(i, stop));
      i = stop;
    } else if (src[i] === '"' || src[i] === "'") {
      const q = src[i];
      let j = i + 1;
      while (j < src.length && src[j] !== q && src[j] !== "\n") j += src[j] === "\\" ? 2 : 1;
      out += blank(src.slice(i, j + 1));
      i = j + 1;
    } else {
      out += src[i];
      i++;
    }
  }
  return out;
}

const lineOf = (text: string, index: number) => text.slice(0, index).split("\n").length;

export function checkSource(source: string): PolicyResult {
  if (Buffer.byteLength(source, "utf8") > MAX_SOURCE_BYTES) return { ok: false, message: "This program is too long to run here (64 KB limit).", line: null };
  if (/\u0000/.test(source)) return { ok: false, message: "The program contains an invalid character.", line: null };

  // Line splices and alternative tokens can disguise directives; reject the disguises outright.
  if (/\\\r?\n/.test(source)) return { ok: false, message: "Lines ending with a backslash aren't supported here.", line: lineOf(source, source.search(/\\\r?\n/)) };
  if (/\?\?[=/'()!<>-]/.test(source)) return { ok: false, message: "Trigraphs (??=, ??/ …) aren't supported here.", line: lineOf(source, source.search(/\?\?[=/'()!<>-]/)) };

  const code = stripLiteralsAndComments(source);
  if (/%:/.test(code)) return { ok: false, message: "The %: digraph isn't supported here — use # instead.", line: lineOf(code, code.indexOf("%:")) };

  const lines = code.split("\n");
  for (let n = 0; n < lines.length; n++) {
    const line = lines[n].trim();
    if (!line.startsWith("#")) continue;
    const directive = /^#\s*([A-Za-z_]+)/.exec(line)?.[1] ?? "";
    if (directive !== "include") {
      const hint = directive === "define" ? " Use `const int NAME = …;` instead." : "";
      return { ok: false, message: `\`#${directive || ""}\` isn't available in CodeMentor's sandbox.${hint}`, line: n + 1 };
    }
    // Comments were blanked, and <…> header names contain no literals, so the stripped line is enough.
    // A quoted include ("file") was blanked to spaces, so it fails this pattern and is refused.
    const m = /^#\s*include\s*<([A-Za-z0-9_./]+)>\s*$/.exec(line);
    if (!m) return { ok: false, message: "Only standard headers like `#include <iostream>` can be included.", line: n + 1 };
    if (!ALLOWED_HEADERS.has(m[1])) {
      return { ok: false, message: `\`<${m[1]}>\` isn't available in CodeMentor's sandbox. Allowed: ${[...ALLOWED_HEADERS].slice(0, 8).join(", ")} …`, line: n + 1 };
    }
  }

  const ident = /[A-Za-z_][A-Za-z0-9_]*/g;
  const banned = new Set(BANNED_IDENTIFIERS);
  for (let m = ident.exec(code); m; m = ident.exec(code)) {
    if (banned.has(m[0])) {
      return { ok: false, message: `\`${m[0]}\` isn't available in CodeMentor's sandbox — programs here can only use the console.`, line: lineOf(code, m.index) };
    }
  }
  if (!/\bmain\s*\(/.test(code)) return { ok: false, message: "Your program needs an `int main()` function.", line: null };
  return { ok: true };
}
