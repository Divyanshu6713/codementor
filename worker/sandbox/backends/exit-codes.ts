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
    136: "Arithmetic error (for example division by zero).",
    139: "Invalid memory access (for example reading outside an array).",
  };
  return known[code] ?? `The program exited with code ${code}. A program should end with return 0.`;
}
