/** Same rule as the server's predict-the-output grading: per line, a tab counts as a space, trailing spaces and final blank lines ignored. */
export function normalizeOutputForCompare(s: string): string {
  const lines = s.replace(/\r\n?/g, "\n").replace(/\t/g, " ").split("\n").map((l) => l.replace(/\s+$/, ""));
  while (lines.length && lines[lines.length - 1] === "") lines.pop();
  return lines.join("\n");
}
