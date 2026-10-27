/** Plain-language causes for common abnormal exit codes (Windows NTSTATUS and POSIX signals). */
export function describeExit(code: number): string {
  const known: Record<number, string> = {
    0xc0000005: "Invalid memory access (for example reading outside an array).",
    0xc00000fd: "Stack overflow (for example recursion that never stops).",
    0xc0000094: "Division by zero.",
    0xc0000409: "The program stopped itself because of a detected error (for example an out-of-range access).",
    0xc0000374: "Memory corruption was detected.",
    3: "The program was aborted (for example an uncaught exception).",
    134: "The program was aborted (for example an uncaught exception).",
    132: "The program hit an illegal instruction — usually undefined behaviour, such as dividing by zero.",
    136: "Arithmetic error (for example division by zero).",
    139: "Invalid memory access (for example reading outside an array).",
  };
  return known[code] ?? `The program exited with code ${code}. A program should end with return 0.`;
}

/**
 * Python programs that end with an uncaught exception exit with code 1 and a traceback on stderr;
 * the detail is the traceback's last line ("ZeroDivisionError: division by zero").
 */
export function describePythonExit(code: number, stderr: string): string {
  const last = stderr.trim().split(/\r?\n/).filter((l) => l.trim()).pop() ?? "";
  if (code === 1 && /^[A-Za-z_][\w.]*(Error|Exception|Exit|Interrupt|Warning)\b/.test(last)) return last.slice(0, 300);
  if (code === 1 && /^[A-Za-z_][\w.]*:/.test(last)) return last.slice(0, 300);
  if (code === 0xc00000fd || code === 139) return "Python crashed: stack overflow (recursion far too deep).";
  return `The program stopped with exit code ${code}${code === 1 ? "" : " (sys.exit)"}.`;
}
