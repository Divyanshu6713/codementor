/**
 * More dry-run traces: while loops, arrays, searching, sorting, two pointers, prefix sums, DP,
 * Euclid's algorithm, merging and pass-by-reference. Same rules as traces.ts: each trace mirrors one
 * fixed C++ snippet in TypeScript, and every snippet prints enough along the way that the test
 * comparing its real g++ output with the trace's final output also checks the steps in between.
 */
import type { TraceArray, TraceDef, TracePhase, TraceStep } from "./traces";

/** Small helper so each trace reads like the C++ it mirrors. */
class Tracer {
  readonly steps: TraceStep[] = [];
  out = "";
  constructor(private vars: () => Record<string, number | undefined>, private arrays: () => TraceArray[] = () => []) {}
  step(line: number, phase: TracePhase, note: string, extra: Partial<TraceStep> = {}) {
    const arrays = this.arrays().map((a) => ({ ...a, values: [...a.values], marks: a.marks ? { ...a.marks } : undefined }));
    const vars = Object.fromEntries(Object.entries(this.vars()).filter((e): e is [string, number] => e[1] !== undefined));
    this.steps.push({ line, phase, vars, output: this.out, note, ...(arrays.length ? { arrays } : {}), ...extra });
  }
}

function digitSumTrace(): TraceDef {
  const code = `int n = 472, sum = 0;
while (n > 0) {
    sum += n % 10;
    n /= 10;
}
cout << sum;`;
  let n = 472, sum = 0;
  const t = new Tracer(() => ({ n, sum }));
  t.step(1, "declare", "n holds the number; sum starts at 0.");
  for (;;) {
    const ok = n > 0;
    t.step(2, "check", ok ? `${n} > 0 is true: there are digits left.` : "0 > 0 is false: every digit has been used, so the loop ends.", { condition: { text: `${n} > 0`, value: ok } });
    if (!ok) break;
    const digit = n % 10;
    sum += digit;
    t.step(3, "body", `${n} % 10 is ${digit} — the last digit. sum becomes ${sum}.`);
    n = Math.trunc(n / 10);
    t.step(4, "update", `n /= 10 drops the last digit: n is now ${n}.`);
  }
  t.out += String(sum);
  t.step(6, "after", `The loop is over; print sum = ${sum}.`);
  return { id: "digit-sum-while", title: "Adding the digits of 472", code, steps: t.steps };
}

function arrayMaxTrace(): TraceDef {
  const code = `int a[] = {4, 9, 2, 7};
int best = a[0];
for (int i = 1; i < 4; i++) {
    if (a[i] > best) best = a[i];
}
cout << best;`;
  const a = [4, 9, 2, 7];
  let best = a[0];
  let i = 1;
  let inLoop = false;
  const t = new Tracer(() => (inLoop ? { best, i } : { best }), () => [{ name: "a", values: a, marks: inLoop ? { i } : undefined }]);
  t.step(2, "declare", "Start with the first element as the best so far: best = 4.");
  inLoop = true;
  t.step(3, "init", "i starts at 1 — a[0] is already in best.");
  for (;;) {
    const ok = i < 4;
    t.step(3, "check", ok ? `${i} < 4: look at a[${i}].` : "4 < 4 is false: every element has been checked.", { condition: { text: `${i} < 4`, value: ok } });
    if (!ok) break;
    const prev = best;
    const bigger = a[i] > prev;
    if (bigger) best = a[i];
    t.step(4, "compare", bigger ? `a[${i}] = ${a[i]} is bigger than ${prev}, so best becomes ${best}.` : `a[${i}] = ${a[i]} isn't bigger than ${best}; best stays.`, { condition: { text: `${a[i]} > ${prev}`, value: bigger } });
    i++;
    t.step(3, "update", `i++ → ${i}.`);
  }
  inLoop = false;
  t.out += String(best);
  t.step(6, "after", `Print the largest value: ${best}.`);
  return { id: "array-max", title: "Finding the largest element", code, steps: t.steps };
}

function binarySearchTrace(): TraceDef {
  const code = `int a[] = {2, 5, 8, 12, 16, 23, 38, 56};
int target = 38, lo = 0, hi = 7;
while (lo <= hi) {
    int mid = (lo + hi) / 2;
    cout << mid << " ";
    if (a[mid] == target) break;
    if (a[mid] < target) lo = mid + 1;
    else hi = mid - 1;
}
cout << (lo <= hi ? "found" : "missing");`;
  const a = [2, 5, 8, 12, 16, 23, 38, 56];
  const target = 38;
  let lo = 0, hi = 7, mid = -1;
  const marks = (): Record<string, number> => (mid >= 0 ? { lo, mid, hi } : { lo, hi });
  const t = new Tracer(() => (mid >= 0 ? { target, lo, hi, mid } : { target, lo, hi }), () => [{ name: "a", values: a, marks: marks(), focus: mid >= 0 ? [mid] : [] }]);
  t.step(2, "declare", "The answer, if it exists, is somewhere between lo = 0 and hi = 7.");
  for (;;) {
    const ok = lo <= hi;
    t.step(3, "check", ok ? `${lo} <= ${hi}: the range isn't empty yet.` : "The range is empty.", { condition: { text: `${lo} <= ${hi}`, value: ok } });
    if (!ok) break;
    mid = Math.floor((lo + hi) / 2);
    t.step(4, "body", `mid = (${lo} + ${hi}) / 2 = ${mid}. Look at the middle: a[${mid}] = ${a[mid]}.`);
    t.out += `${mid} `;
    t.step(5, "body", `Print ${mid} so we can see the search path.`);
    const found = a[mid] === target;
    t.step(6, "compare", found ? `a[${mid}] = ${a[mid]} is the target — stop.` : `${a[mid]} isn't ${target}.`, { condition: { text: `${a[mid]} == ${target}`, value: found } });
    if (found) break;
    if (a[mid] < target) {
      lo = mid + 1;
      t.step(7, "update", `${a[mid]} < ${target}, so the target is to the right: lo = ${lo}. Half the range is gone.`, { condition: { text: `${a[mid]} < ${target}`, value: true } });
    } else {
      hi = mid - 1;
      t.step(8, "update", `${a[mid]} > ${target}, so the target is to the left: hi = ${hi}.`, { condition: { text: `${a[mid]} < ${target}`, value: false } });
    }
  }
  t.out += lo <= hi ? "found" : "missing";
  t.step(10, "after", `Found after ${t.out.trim().split(" ").length - 1} looks instead of checking all 8 elements.`);
  return { id: "binary-search-38", title: "Binary search for 38", code, steps: t.steps };
}

function bubbleSortTrace(): TraceDef {
  const code = `int a[] = {5, 1, 4, 2};
int n = 4;
for (int pass = 0; pass < n - 1; pass++) {
    for (int j = 0; j < n - 1 - pass; j++) {
        if (a[j] > a[j + 1]) {
            int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;
        }
    }
    for (int k = 0; k < n; k++) cout << a[k] << " ";
    cout << "| ";
}`;
  const a = [5, 1, 4, 2];
  const n = 4;
  let pass = 0, j = 0;
  let focus: number[] = [];
  const t = new Tracer(() => ({ pass, j }), () => [{ name: "a", values: a, marks: { j }, focus }]);
  for (pass = 0; pass < n - 1; pass++) {
    t.step(3, "check", `Pass ${pass}: the largest remaining value will bubble to position ${n - 1 - pass}.`);
    for (j = 0; j < n - 1 - pass; j++) {
      focus = [j, j + 1];
      const swap = a[j] > a[j + 1];
      t.step(5, "compare", swap ? `${a[j]} > ${a[j + 1]}: they're in the wrong order.` : `${a[j]} <= ${a[j + 1]}: already in order.`, { condition: { text: `${a[j]} > ${a[j + 1]}`, value: swap } });
      if (swap) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        t.step(6, "swap", `Swap them: now a[${j}] = ${a[j]} and a[${j + 1}] = ${a[j + 1]}.`);
      }
    }
    focus = [];
    t.out += `${a.join(" ")} | `;
    t.step(9, "after", `End of pass ${pass}: ${a[n - 1 - pass]} is in its final place.`);
  }
  return { id: "bubble-sort-4", title: "Bubble sort, pass by pass", code, steps: t.steps };
}

function twoPointerTrace(): TraceDef {
  const code = `int a[] = {1, 2, 3, 4, 5};
int left = 0, right = 4;
while (left < right) {
    int t = a[left]; a[left] = a[right]; a[right] = t;
    left++;
    right--;
}
for (int i = 0; i < 5; i++) cout << a[i] << " ";`;
  const a = [1, 2, 3, 4, 5];
  let left = 0, right = 4;
  const t = new Tracer(() => ({ left, right }), () => [{ name: "a", values: a, marks: { left, right }, focus: left < right ? [left, right] : [] }]);
  t.step(2, "declare", "One pointer at each end.");
  for (;;) {
    const ok = left < right;
    t.step(3, "check", ok ? `${left} < ${right}: the pointers haven't met yet.` : `${left} < ${right} is false: they met in the middle, so we're done.`, { condition: { text: `${left} < ${right}`, value: ok } });
    if (!ok) break;
    [a[left], a[right]] = [a[right], a[left]];
    t.step(4, "swap", `Swap the two ends: a[${left}] ↔ a[${right}].`);
    left++;
    right--;
    t.step(6, "update", `Move both pointers inwards: left = ${left}, right = ${right}.`);
  }
  t.out = `${a.join(" ")} `;
  t.step(8, "after", "Reversed in place with n / 2 swaps and no second array.");
  return { id: "two-pointer-reverse", title: "Reversing with two pointers", code, steps: t.steps };
}

function prefixSumTrace(): TraceDef {
  const code = `int a[] = {3, 1, 4, 1, 5};
int pre[6] = {0};
for (int i = 0; i < 5; i++) {
    pre[i + 1] = pre[i] + a[i];
}
cout << pre[4] - pre[1];`;
  const a = [3, 1, 4, 1, 5];
  const pre: (number | null)[] = [0, null, null, null, null, null];
  let i = 0;
  let focusPre: number[] = [];
  const t = new Tracer(() => ({ i }), () => [{ name: "a", values: a, marks: { i }, focus: i < 5 ? [i] : [] }, { name: "pre", values: pre, focus: focusPre }]);
  t.step(2, "declare", "pre[k] will hold the sum of the first k elements; pre[0] = 0 (the empty sum).");
  for (i = 0; i < 5; i++) {
    pre[i + 1] = (pre[i] as number) + a[i];
    focusPre = [i + 1];
    t.step(4, "body", `pre[${i + 1}] = pre[${i}] + a[${i}] = ${pre[i]} + ${a[i]} = ${pre[i + 1]}.`);
  }
  focusPre = [1, 4];
  t.out = String((pre[4] as number) - (pre[1] as number));
  t.step(6, "after", `Sum of a[1..3] = pre[4] − pre[1] = ${pre[4]} − ${pre[1]} = ${t.out} — one subtraction, no loop.`);
  return { id: "prefix-sums", title: "Building prefix sums", code, steps: t.steps };
}

function fibDpTrace(): TraceDef {
  const code = `long long dp[8];
dp[0] = 0;
dp[1] = 1;
for (int i = 2; i < 8; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
    cout << dp[i] << " ";
}`;
  const dp: (number | null)[] = Array(8).fill(null);
  let i = 0;
  let focus: number[] = [];
  const t = new Tracer(() => (i ? { i } : {}), () => [{ name: "dp", values: dp, marks: i ? { i } : undefined, focus }]);
  dp[0] = 0;
  t.step(2, "declare", "Base case: dp[0] = 0.");
  dp[1] = 1;
  t.step(3, "declare", "Base case: dp[1] = 1.");
  for (i = 2; i < 8; i++) {
    dp[i] = (dp[i - 1] as number) + (dp[i - 2] as number);
    focus = [i - 2, i - 1, i];
    t.step(5, "body", `dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}. Both were already computed — no recursion.`);
    t.out += `${dp[i]} `;
    t.step(6, "body", `Print ${dp[i]}.`);
  }
  i = 0;
  focus = [7];
  t.step(6, "after", "Each value was computed exactly once: O(n) instead of the exponential recursion.");
  return { id: "fibonacci-dp", title: "Filling a DP table", code, steps: t.steps };
}

function gcdTrace(): TraceDef {
  const code = `int a = 48, b = 18;
while (b != 0) {
    int r = a % b;
    a = b;
    b = r;
    cout << a << "," << b << " ";
}`;
  let a = 48, b = 18, r = 0;
  let inBody = false;
  const t = new Tracer(() => (inBody ? { a, b, r } : { a, b }));
  t.step(1, "declare", "gcd(48, 18): Euclid says gcd(a, b) = gcd(b, a % b).");
  for (;;) {
    const ok = b !== 0;
    inBody = false;
    t.step(2, "check", ok ? `b = ${b} isn't 0 yet.` : `b is 0, so the answer is a = ${a}.`, { condition: { text: `${b} != 0`, value: ok } });
    if (!ok) break;
    inBody = true;
    r = a % b;
    t.step(3, "body", `r = ${a} % ${b} = ${r}.`);
    a = b;
    t.step(4, "update", `a = b → ${a}.`);
    b = r;
    t.step(5, "update", `b = r → ${b}. The numbers shrink quickly.`);
    t.out += `${a},${b} `;
    t.step(6, "body", `Print the new pair ${a},${b}.`);
  }
  return { id: "gcd-48-18", title: "Euclid's algorithm", code, steps: t.steps };
}

function mergeTrace(): TraceDef {
  const code = `int L[] = {1, 4, 9};
int R[] = {2, 3, 10};
int out[6];
int i = 0, j = 0, k = 0;
while (i < 3 && j < 3) {
    if (L[i] <= R[j]) out[k++] = L[i++];
    else out[k++] = R[j++];
}
while (i < 3) out[k++] = L[i++];
while (j < 3) out[k++] = R[j++];
for (int t = 0; t < 6; t++) cout << out[t] << " ";`;
  const L = [1, 4, 9], R = [2, 3, 10];
  const out: (number | null)[] = Array(6).fill(null);
  let i = 0, j = 0, k = 0;
  const t = new Tracer(() => ({ i, j, k }), (): TraceArray[] => [
    { name: "L", values: L, marks: i < 3 ? { i } : undefined, focus: i < 3 ? [i] : [] },
    { name: "R", values: R, marks: j < 3 ? { j } : undefined, focus: j < 3 ? [j] : [] },
    { name: "out", values: out, marks: k < 6 ? { k } : undefined },
  ]);
  t.step(4, "declare", "Both halves are already sorted; i, j and k start at the front.");
  while (i < 3 && j < 3) {
    const left = L[i] <= R[j];
    t.step(6, "compare", left ? `${L[i]} <= ${R[j]}: take ${L[i]} from L.` : `${L[i]} > ${R[j]}: take ${R[j]} from R.`, { condition: { text: `${L[i]} <= ${R[j]}`, value: left } });
    if (left) out[k++] = L[i++];
    else out[k++] = R[j++];
    t.step(left ? 6 : 7, "body", `out[${k - 1}] = ${out[k - 1]}.`);
  }
  if (i < 3 || j < 3) {
    const fromRight = i === 3;
    while (i < 3) out[k++] = L[i++];
    while (j < 3) out[k++] = R[j++];
    t.step(fromRight ? 10 : 9, "after", `${fromRight ? "L" : "R"} ran out — copy the rest of ${fromRight ? "R" : "L"} as it is.`);
  }
  t.out = `${out.join(" ")} `;
  t.step(11, "after", "Merged in one pass: every element was looked at once.");
  return { id: "merge-step", title: "Merging two sorted halves", code, steps: t.steps };
}

function swapByReferenceTrace(): TraceDef {
  const code = `void swapVals(int& x, int& y) {
    int t = x;
    x = y;
    y = t;
}

int main() {
    int a = 3, b = 8;
    swapVals(a, b);
    cout << a << " " << b;
}`;
  let a = 3, b = 8, tmp = 0;
  let inCall = false;
  const t = new Tracer(() => (inCall ? { a, b, t: tmp } : { a, b }));
  const frames = () => (inCall ? ["main()", "swapVals(x is a, y is b)"] : ["main()"]);
  t.step(8, "declare", "main has two variables: a = 3 and b = 8.", { stack: frames() });
  inCall = true;
  t.step(1, "call", "swapVals gets references: x is another name for a, y another name for b. Nothing is copied.", { stack: frames() });
  tmp = a;
  t.step(2, "body", "t = x copies a's value (3) into t.", { stack: frames() });
  a = b;
  t.step(3, "body", "x = y writes 8 into x — which IS a. a changes in main too.", { stack: frames() });
  b = tmp;
  t.step(4, "body", "y = t writes 3 into y — which IS b.", { stack: frames() });
  inCall = false;
  t.step(5, "return", "swapVals ends; t disappears, but a and b keep their new values.", { stack: frames() });
  t.out = `${a} ${b}`;
  t.step(10, "after", "Prints 8 3. With plain int x, int y (copies) it would still print 3 8.", { stack: frames() });
  return { id: "swap-by-reference", title: "Swapping through references", code, steps: t.steps };
}

export const EXTRA_TRACES: TraceDef[] = [
  digitSumTrace(), arrayMaxTrace(), binarySearchTrace(), bubbleSortTrace(), twoPointerTrace(),
  prefixSumTrace(), fibDpTrace(), gcdTrace(), mergeTrace(), swapByReferenceTrace(),
];
