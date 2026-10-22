import type { PyModuleDef } from "../types";

const r = String.raw;

/** Module 40 — Scientific computing (specialist path). */
export const M40: PyModuleDef = {
  id: "py-scientific",
  number: 40,
  level: 5,
  title: "Scientific Computing",
  summary: "Floating-point accuracy and tolerances; exact arithmetic with fractions and decimal; numerical methods (bisection, Newton's method, numerical integration); simulation (Euler's method, Monte Carlo, random walks); reproducibility with seeds; units; NumPy, SciPy and matplotlib concepts.",
  track: "specialist",
  optionalNote: "For science and engineering students and researchers. Methods are written in plain Python so you see how they work; NumPy/SciPy versions (much faster on big arrays) are shown for your own computer.",
  prereqs: ["py-security"],
  lessons: [
    {
      id: "py-sci-numerics",
      title: "Numbers, tolerances and numerical methods",
      minutes: 19,
      difficulty: 4,
      objectives: [
        "Explain floating-point error and compare floats with tolerances",
        "Choose fractions or decimal when exactness matters",
        "Solve equations with bisection and Newton's method, and integrate numerically",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "Why does `0.1 + 0.2 == 0.3` give False?",
        options: [
          { text: "Python has a bug", why: "Every language using IEEE-754 doubles behaves the same." },
          { text: "0.1 and 0.2 can't be stored exactly in binary, so the sum is very slightly off", why: "Correct." },
          { text: "== doesn't work on floats", why: "It works — it just compares exact bits." },
        ],
        answer: 1,
        hint: "1/10 in binary is a repeating fraction.",
        explain: "Binary floating point approximates most decimals. Compare with a tolerance: math.isclose(a, b).",
      },
      why: "Scientific results are only as good as their numbers. Knowing where rounding error comes from, how to compare with tolerances, and how classic numerical methods converge (or fail) lets you trust — and explain — what your programs compute.",
      concept: [
        {
          title: "Floating point",
          body: `Python floats are 64-bit IEEE-754 numbers: about **15–17 significant digits**, with tiny rounding errors in most operations.

- Compare with \`math.isclose(a, b, rel_tol=1e-9, abs_tol=0.0)\` — use \`abs_tol\` when comparing to 0.
- Subtracting nearly equal numbers loses precision (**cancellation**).
- Summing many floats: errors pile up in a \`total += x\` loop; \`math.fsum\` gives a correctly rounded sum. (Since Python 3.12 the built-in \`sum()\` uses compensated summation for floats too; older versions don't.)
- \`fractions.Fraction\` is exact for rationals; \`decimal.Decimal\` gives exact decimal arithmetic (money) with chosen precision.`,
        },
        {
          title: "Root finding",
          body: `To solve f(x) = 0:

- **Bisection**: start with [a, b] where f changes sign; halve the interval each step. Always converges (if f is continuous), slowly — one binary digit per step.
- **Newton's method**: x ← x − f(x)/f′(x). Very fast near a root (digits roughly double each step) but can diverge from a bad start or where f′ ≈ 0.

Stop when the change (or |f(x)|) is below a tolerance, and always cap the number of iterations.`,
        },
        {
          title: "Numerical integration",
          body: `The **trapezoid rule** approximates ∫ f(x) dx over [a, b] with n strips of width h: \`h · (f(a)/2 + f(x₁) + … + f(xₙ₋₁) + f(b)/2)\`. Error shrinks like h²; **Simpson's rule** (even n) like h⁴. Check results by doubling n and seeing how much the answer changes.`,
        },
      ],
      example: {
        title: "√2 three ways, and an integral",
        code: r`import math
from fractions import Fraction
from decimal import Decimal, getcontext

print(0.1 + 0.2 == 0.3, math.isclose(0.1 + 0.2, 0.3))
total = 0.0
for _ in range(10):
    total += 0.1
print(total, math.fsum([0.1] * 10))
print(Fraction(1, 10) + Fraction(2, 10) == Fraction(3, 10), Decimal("0.1") + Decimal("0.2"))

def bisection(f, a, b, tol=1e-10, max_iter=200):
    steps = 0
    while b - a > tol and steps < max_iter:
        mid = (a + b) / 2
        if f(a) * f(mid) <= 0:
            b = mid
        else:
            a = mid
        steps += 1
    return (a + b) / 2, steps

def newton(f, df, x, tol=1e-12, max_iter=50):
    for step in range(1, max_iter + 1):
        new = x - f(x) / df(x)
        if abs(new - x) < tol:
            return new, step
        x = new
    raise RuntimeError("did not converge")

f = lambda x: x * x - 2
root_b, steps_b = bisection(f, 1, 2)
root_n, steps_n = newton(f, lambda x: 2 * x, 1.0)
print(f"bisection {root_b:.10f} in {steps_b} steps; newton {root_n:.10f} in {steps_n} steps")
getcontext().prec = 30
print("decimal sqrt:", Decimal(2).sqrt())

def trapezoid(f, a, b, n):
    h = (b - a) / n
    return h * (f(a) / 2 + sum(f(a + i * h) for i in range(1, n)) + f(b) / 2)

for n in (4, 16, 64):
    approx = trapezoid(math.sin, 0, math.pi, n)
    print(f"n={n:>2}: {approx:.6f} (error {abs(approx - 2):.1e})")`,
        output: "False True\n0.9999999999999999 1.0\nTrue 0.3\nbisection 1.4142135624 in 34 steps; newton 1.4142135624 in 6 steps\ndecimal sqrt: 1.41421356237309504880168872421\nn= 4: 1.896119 (error 1.0e-01)\nn=16: 1.993570 (error 6.4e-03)\nn=64: 1.999598 (error 4.0e-04)\n",
        lines: [
          [5, "Exact comparison fails; a relative tolerance says 'equal enough'."],
          [8, "Each += rounds a little; after ten additions the total is just below 1. fsum gives the correctly rounded 1.0."],
          [10, "Fraction and Decimal are exact for these values."],
          [12, "Bisection: keep the half-interval where the sign changes."],
          [16, "f(a) and f(mid) have opposite signs → the root is in [a, mid]."],
          [25, "Newton's method follows the tangent line to the axis."],
          [26, "Stop when the step is tiny — and cap iterations in case it never settles."],
          [34, "Bisection needs ~34 halvings for 1e-10; Newton needs a handful of steps."],
          [40, "The trapezoid rule: strips under the curve."],
          [44, "∫₀^π sin x dx = 2; 4× more strips makes the error about 16× smaller (h²)."],
        ],
      },
      mistakes: [
        { title: "Comparing floats with ==", body: "Use math.isclose with a tolerance suited to the problem's scale." },
        { title: "Loops without an iteration cap", body: "A method that doesn't converge (bad starting point, f′ = 0) will loop forever. Always cap and report failure." },
        { title: "Floats for money", body: "₹0.10 can't be stored exactly. Use Decimal or integer paise." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`import math
from fractions import Fraction
x = Fraction(1, 3) + Fraction(1, 6)
print(x, float(x), math.isclose(0.1 * 3, 0.3), 0.1 * 3 == 0.3)`,
          answer: "1/2 0.5 True False\n",
          hint: "1/3 + 1/6 = 1/2 exactly.",
          explain: "Fractions stay exact (1/2); 0.1 * 3 is 0.30000000000000004, so == fails but isclose succeeds.",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Compare two floats with a relative tolerance.",
          code: r`import math
measured = 9.80665 * 1.0000000001
print(math.___(measured, 9.80665))`,
          blanks: [["isclose"]],
          output: "True\n",
          hint: "Is it close?",
          explain: "`math.isclose` uses rel_tol=1e-9 by default, so a 1e-10 relative difference counts as equal.",
        },
        {
          id: "b1", kind: "bug", difficulty: 4,
          prompt: "Newton's method on f(x) = x³ − 2x + 2 starting at 0 bounces between 0 and 1 forever. The loop should give up after 50 steps, but it wastes 100,000. Which line sets the wrong cap?",
          code: r`def newton(f, df, x, tol=1e-12):
    steps = 0
    while True:
        new = x - f(x) / df(x)
        steps += 1
        if abs(new - x) < tol:
            return new
        x = new
        if steps >= 100_000:
            return f"gave up after {steps} steps"
f = lambda x: x ** 3 - 2 * x + 2
df = lambda x: 3 * x ** 2 - 2
print(newton(f, df, 0.0))`,
          line: 9,
          fix: r`def newton(f, df, x, tol=1e-12):
    steps = 0
    while True:
        new = x - f(x) / df(x)
        steps += 1
        if abs(new - x) < tol:
            return new
        x = new
        if steps >= 50:
            return f"gave up after {steps} steps"
f = lambda x: x ** 3 - 2 * x + 2
df = lambda x: 3 * x ** 2 - 2
print(newton(f, df, 0.0))`,
          output: "gave up after 50 steps\n",
          hint: "A million wasted iterations isn't a useful cap.",
          explain: "From x = 0 the iterates cycle 0 → 1 → 0 …; a small cap (50) detects non-convergence quickly. Try a different start point (e.g. −2) to find the real root.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "Which root-finding method is guaranteed to converge for a continuous function with a sign change on [a, b]?",
          options: [
            { text: "Bisection", why: "Correct." },
            { text: "Newton's method", why: "Fast, but can diverge or cycle." },
            { text: "Guessing randomly", why: "No guarantee." },
          ],
          answer: 0,
          hint: "Slow and steady.",
          explain: "Bisection always keeps a bracket containing the root and halves it each step.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Solve with bisection", difficulty: 3,
          prompt: `Find where a projectile launched at 20 m/s and 45° hits the ground, by solving height(x) = 0 for x > 0 with **bisection** on [1, 100] to a tolerance of 1e-6 (cap 100 iterations). height(x) = x·tan θ − g x² / (2 v² cos² θ), g = 9.81. Read v and θ (degrees) per line until \`end\`; print \`v=<v> angle=<θ>: range <x> m (<steps> steps)\` with x to 3 decimals. If height(1) and height(100) have the same sign, print \`v=<v> angle=<θ>: no bracket\`.`,
          starter: r`import math

def height(x, v, theta_deg):
    t = math.radians(theta_deg)
    return x * math.tan(t) - 9.81 * x ** 2 / (2 * v ** 2 * math.cos(t) ** 2)
`,
          tests: [
            { label: "Launches", input: "20 45\n15 30\n40 60\nend\n", output: "v=20 angle=45: range 40.775 m (27 steps)\nv=15 angle=30: range 19.863 m (27 steps)\nv=40 angle=60: no bracket" },
          ],
          hints: [
            "Check the sign of height at 1 and 100 first.",
            "Bisection loop: while b − a > 1e-6 and steps < 100.",
            "Keep the half where the sign changes.",
            "Compare with the formula v² sin(2θ)/g to check your answer.",
          ],
          solution: r`import math

def height(x, v, theta_deg):
    t = math.radians(theta_deg)
    return x * math.tan(t) - 9.81 * x ** 2 / (2 * v ** 2 * math.cos(t) ** 2)

def bisection(f, a, b, tol=1e-6, max_iter=100):
    if f(a) * f(b) > 0:
        return None
    steps = 0
    while b - a > tol and steps < max_iter:
        mid = (a + b) / 2
        if f(a) * f(mid) <= 0:
            b = mid
        else:
            a = mid
        steps += 1
    return (a + b) / 2, steps

while (line := input()) != "end":
    v, theta = map(float, line.split())
    result = bisection(lambda x: height(x, v, theta), 1, 100)
    label = f"v={v:g} angle={theta:g}"
    if result is None:
        print(f"{label}: no bracket")
    else:
        x, steps = result
        print(f"{label}: range {x:.3f} m ({steps} steps)")`,
          notes: "The 40 m/s launch lands beyond 100 m, so there's no sign change in the bracket — the method correctly refuses rather than inventing an answer. Widening the bracket would fix it.",
        },
        {
          id: "stretch", kind: "task", title: "Integrate and check convergence", difficulty: 4,
          prompt: `Implement the trapezoid rule and Simpson's rule (n even). For the function given by name (\`exp\`: e^x on [0, 1]; \`bell\`: e^(−x²) on [0, 2]; \`inv\`: 1/x on [1, e]), compute both with n = 2, 4, 8, 16 and print \`n=<n> trap=<t> simpson=<s>\` (8 decimals). Then print the exact value where known (\`exp\`: e − 1, \`inv\`: 1, \`bell\`: (√π/2)·erf(2)) as \`exact=<v>\` and \`simpson error at n=16: <e>\` in scientific notation with 1 decimal (\`.1e\`).`,
          starter: r`import math

FUNCS = {
    "exp": (math.exp, 0.0, 1.0, math.e - 1),
    "bell": (lambda x: math.exp(-x * x), 0.0, 2.0, math.sqrt(math.pi) / 2 * math.erf(2)),
    "inv": (lambda x: 1 / x, 1.0, math.e, 1.0),
}
`,
          tests: [
            { label: "exp", input: "exp\n", output: "n=2 trap=1.75393109 simpson=1.71886115\nn=4 trap=1.72722190 simpson=1.71831884\nn=8 trap=1.72051859 simpson=1.71828415\nn=16 trap=1.71884113 simpson=1.71828197\nexact=1.71828183\nsimpson error at n=16: 1.5e-07" },
            { label: "inv", input: "inv\n", output: "n=2 trap=1.04971775 simpson=1.00788994\nn=4 trap=1.01303903 simpson=1.00081279\nn=8 trap=1.00330707 simpson=1.00006308\nn=16 trap=1.00082995 simpson=1.00000424\nexact=1.00000000\nsimpson error at n=16: 4.2e-06", hidden: true },
          ],
          hints: [
            "Trapezoid: h·(f(a)/2 + Σ inner f + f(b)/2).",
            "Simpson: h/3·(f(a) + 4·Σ odd f + 2·Σ even inner f + f(b)).",
            "Loop over n in (2, 4, 8, 16).",
            "abs(simpson − exact) for the error.",
          ],
          solution: r`import math

FUNCS = {
    "exp": (math.exp, 0.0, 1.0, math.e - 1),
    "bell": (lambda x: math.exp(-x * x), 0.0, 2.0, math.sqrt(math.pi) / 2 * math.erf(2)),
    "inv": (lambda x: 1 / x, 1.0, math.e, 1.0),
}

def trapezoid(f, a, b, n):
    h = (b - a) / n
    return h * (f(a) / 2 + sum(f(a + i * h) for i in range(1, n)) + f(b) / 2)

def simpson(f, a, b, n):
    h = (b - a) / n
    odd = sum(f(a + i * h) for i in range(1, n, 2))
    even = sum(f(a + i * h) for i in range(2, n, 2))
    return h / 3 * (f(a) + 4 * odd + 2 * even + f(b))

f, a, b, exact = FUNCS[input().strip()]
for n in (2, 4, 8, 16):
    print(f"n={n} trap={trapezoid(f, a, b, n):.8f} simpson={simpson(f, a, b, n):.8f}")
print(f"exact={exact:.8f}")
print(f"simpson error at n=16: {abs(simpson(f, a, b, 16) - exact):.1e}")`,
          notes: "Simpson's error falls about 16× each time n doubles (h⁴), trapezoid's about 4× (h²). Watching how results change as n grows is how you judge accuracy when no exact answer exists.",
        },
      ],
      realWorld: "Engineers solve for equilibrium temperatures and loads with root finders; pharmacologists integrate concentration curves to get drug exposure (AUC); SciPy's `brentq`, `newton` and `quad` are battle-tested versions of these methods.",
      reteach: "Bisection is the 'guess a number between 1 and 100' game: each guess halves the range, so you always win, a step at a time. Newton's method is a skier following the slope straight downhill to the bottom — very fast when the slope is smooth, but on a strange hill they can zig-zag forever, so you set a time limit.",
      summary: [
        "Floats are approximations: compare with math.isclose, sum with math.fsum, use Fraction/Decimal for exactness.",
        "Bisection (safe, slow) and Newton (fast, can fail) — always use tolerances and iteration caps.",
        "Trapezoid (error ~h²) and Simpson (~h⁴) integration; check convergence by increasing n.",
      ],
      libraryCode: [{
        title: "SciPy does the heavy lifting",
        code: `import numpy as np
from scipy import integrate, optimize

root = optimize.brentq(lambda x: x**2 - 2, 1, 2)         # robust bracketing root finder
area, err_estimate = integrate.quad(np.sin, 0, np.pi)     # adaptive integration with an error estimate
print(root, area, err_estimate)

x = np.linspace(0, np.pi, 1_000_001)                      # a million points, vectorised
print(np.trapezoid(np.sin(x), x))                         # numpy >= 2.0 (older: np.trapz)`,
        note: "`pip install numpy scipy` on your own computer. NumPy runs these loops in C — hundreds of times faster than pure Python for large arrays.",
      }],
    },

    {
      id: "py-sci-simulation",
      title: "Simulation: differential equations and Monte Carlo",
      minutes: 19,
      difficulty: 4,
      objectives: [
        "Simulate change over time with Euler's method",
        "Estimate quantities with Monte Carlo sampling and report uncertainty",
        "Make simulations reproducible and keep track of units",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "You estimate π by throwing random points at a square. Doubling the number of points roughly…",
        options: [
          { text: "Halves the error", why: "Monte Carlo error shrinks like 1/√N." },
          { text: "Reduces the error by about √2 (1.41×)", why: "Correct." },
          { text: "Makes the answer exact", why: "It stays an estimate." },
        ],
        answer: 1,
        hint: "Error ∝ 1/√N.",
        explain: "To halve the error you need 4× the samples — which is why Monte Carlo reports should include uncertainty.",
      },
      why: "Many systems are too complex to solve on paper: epidemics, populations, orbits, queues at a hospital. Simulation steps the system forward in small time steps or samples many random scenarios. Python is a favourite tool for this — if you control step sizes, randomness and units.",
      concept: [
        {
          title: "Euler's method",
          body: `For a rate of change dy/dt = f(t, y), step forward with a small dt:

\`\`\`text
y_next = y + dt · f(t, y)
t_next = t + dt
\`\`\`

Error per unit time shrinks roughly in proportion to dt. Too large a dt can make results wildly wrong or unstable. Check by halving dt; use better integrators (Runge–Kutta, \`scipy.integrate.solve_ivp\`) for real work.`,
        },
        {
          title: "Monte Carlo",
          body: `Estimate a quantity by random sampling: probability = (successes / trials). The **standard error** of a proportion p from N trials is √(p(1−p)/N); a ~95% interval is p ± 1.96·SE.

**Reproducibility**: create \`rng = random.Random(seed)\` and record the seed, so others can reproduce your exact numbers (and you can debug).`,
        },
        {
          title: "Units and sanity checks",
          body: `Write units in names or comments (\`speed_mps\`, \`temp_c\`), convert at the boundaries, and check invariants: probabilities between 0 and 1, populations never negative, energy roughly conserved. A simulation that violates physics has a bug — or too large a time step.`,
        },
      ],
      example: {
        title: "Newton's cooling and a Monte Carlo estimate",
        code: r`import math, random

def cool(temp_c, room_c=25.0, k_per_min=0.1, minutes=10, dt=1.0):
    t = 0.0
    while t < minutes - 1e-9:
        temp_c += dt * (-k_per_min * (temp_c - room_c))
        t += dt
    return temp_c

exact = 25 + (90 - 25) * math.exp(-0.1 * 10)
for dt in (5.0, 1.0, 0.1, 0.01):
    approx = cool(90.0, dt=dt)
    print(f"dt={dt:<5} tea after 10 min: {approx:.3f} °C (error {abs(approx - exact):.3f})")

def estimate_pi(n, seed):
    rng = random.Random(seed)
    inside = sum(1 for _ in range(n) if rng.random() ** 2 + rng.random() ** 2 <= 1)
    p = inside / n
    se = math.sqrt(p * (1 - p) / n)
    return 4 * p, 4 * 1.96 * se

for n in (1_000, 100_000):
    est, margin = estimate_pi(n, seed=7)
    print(f"N={n:>7}: pi ≈ {est:.4f} ± {margin:.4f}  (contains pi: {abs(est - math.pi) <= margin})")
print("same seed, same answer:", estimate_pi(1000, 7) == estimate_pi(1000, 7))`,
        output: "dt=5.0   tea after 10 min: 41.250 °C (error 7.662)\ndt=1.0   tea after 10 min: 47.664 °C (error 1.248)\ndt=0.1   tea after 10 min: 48.792 °C (error 0.120)\ndt=0.01  tea after 10 min: 48.900 °C (error 0.012)\nN=   1000: pi ≈ 3.1520 ± 0.1013  (contains pi: True)\nN= 100000: pi ≈ 3.1422 ± 0.0102  (contains pi: True)\nsame seed, same answer: True\n",
        lines: [
          [3, "Units live in the parameter names: °C, per minute."],
          [6, "Euler step: new = old + dt × rate of change."],
          [10, "The exact solution exists here, so we can measure the error."],
          [11, "Smaller steps → smaller error (roughly in proportion to dt)."],
          [16, "A private, seeded generator makes the run reproducible."],
          [17, "A point lands inside the quarter circle with probability π/4."],
          [19, "Standard error of a proportion; 1.96·SE gives a ~95% margin."],
          [24, "100× more samples shrinks the margin about 10× (1/√N)."],
        ],
      },
      mistakes: [
        { title: "Time steps that are too large", body: "Euler with a big dt can overshoot, oscillate or explode. Halve dt until results stop changing meaningfully." },
        { title: "Reporting a single Monte Carlo number", body: "Without an uncertainty, nobody can tell 3.1 from 3.2. Report a margin or confidence interval and N." },
        { title: "Unseeded randomness", body: "Results you can't reproduce can't be debugged or verified. Record the seed (and library versions)." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`y, dt = 100.0, 0.5
for _ in range(4):
    y += dt * (-0.2 * y)
print(round(y, 3))`,
          answer: "65.61\n",
          hint: "Each step multiplies y by (1 − 0.1).",
          explain: "dt × 0.2 = 0.1, so y becomes 100 × 0.9⁴ = 65.61.",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Create an independent, seeded random generator.",
          code: r`import random
rng = random.___(42)
first = [rng.randint(1, 6) for _ in range(3)]
rng2 = random.Random(42)
print(first == [rng2.randint(1, 6) for _ in range(3)])`,
          blanks: [["Random"]],
          output: "True\n",
          hint: "The class behind the module-level functions.",
          explain: "`random.Random(seed)` gives its own reproducible stream, unaffected by other code using random.",
        },
        {
          id: "b1", kind: "bug", difficulty: 4,
          prompt: "A population model mixes units: the growth rate is per YEAR, but the loop steps in MONTHS, so the population grows 12× too fast. Which line should convert the rate?",
          code: r`population = 1000.0
rate_per_year = 0.12
months = 12
for _ in range(months):
    population += population * rate_per_year
print(round(population))`,
          line: 5,
          fix: r`population = 1000.0
rate_per_year = 0.12
months = 12
for _ in range(months):
    population += population * rate_per_year / 12
print(round(population))`,
          output: "1127\n",
          hint: "One step is 1/12 of a year.",
          explain: "Per-month growth is rate_per_year / 12; compounding monthly for a year gives ≈ 1127, not ≈ 3896.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "Your Euler simulation gives 52.1 with dt = 0.1 and 48.7 with dt = 0.05. What should you do?",
          options: [
            { text: "Report 52.1 — it was first", why: "The results haven't converged." },
            { text: "Keep halving dt (or use a better integrator) until the result stabilises", why: "Correct." },
            { text: "Average them and report 50.4", why: "Still not converged." },
          ],
          answer: 1,
          hint: "Convergence check.",
          explain: "A big change when halving dt means the step is too large; refine until changes are within your tolerance.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "SIR epidemic model", difficulty: 3,
          prompt: `Simulate an SIR epidemic with Euler steps of dt = 0.1 days: dS/dt = −β S I / N, dI/dt = β S I / N − γ I, dR/dt = γ I. Input: \`N I0 beta gamma days\`. Start with S = N − I0, I = I0, R = 0. Print \`day d: S=… I=… R=…\` (rounded to integers) at every whole day that is a multiple of 10 (including day 0) up to \`days\`, then \`peak infected ≈ P on day D\` (P rounded; D = the whole day, rounded down, when I was largest) and \`check: S+I+R = N\` (total rounded to an integer).`,
          starter: r`N, I0, beta, gamma, days = input().split()
`,
          tests: [
            { label: "City", input: "10000 10 0.3 0.1 60\n", output: "day 0: S=9990 I=10 R=0\nday 10: S=9897 I=72 R=31\nday 20: S=9284 I=472 R=244\nday 30: S=6617 I=2012 R=1371\nday 40: S=2925 I=2994 R=4081\nday 50: S=1349 I=2001 R=6649\nday 60: S=867 I=1011 R=8122\npeak infected ≈ 3020 on day 38\ncheck: S+I+R = 10000" },
          ],
          hints: [
            "Use integer step counts: steps = round(days / dt); day = step * dt.",
            "Compute all three rates from the current values before updating any of them.",
            "Print when step % 100 == 0 (every 10 days with dt = 0.1).",
            "Track the maximum I and the day it happened.",
          ],
          solution: r`N, I0, beta, gamma, days = input().split()
N, I0, beta, gamma, days = float(N), float(I0), float(beta), float(gamma), int(days)
S, I, R = N - I0, I0, 0.0
dt = 0.1
steps_per_day = round(1 / dt)
peak, peak_day = I, 0
for step in range(days * steps_per_day + 1):
    day = step / steps_per_day
    if step % (10 * steps_per_day) == 0:
        print(f"day {int(day)}: S={S:.0f} I={I:.0f} R={R:.0f}")
    if I > peak:
        peak, peak_day = I, int(day)
    infections = beta * S * I / N
    recoveries = gamma * I
    S, I, R = S - dt * infections, I + dt * (infections - recoveries), R + dt * recoveries
print(f"peak infected ≈ {peak:.0f} on day {peak_day}")
print(f"check: S+I+R = {S + I + R:.0f}")`,
          notes: "R0 = β/γ = 3 here. The conservation check (S + I + R stays N) is a cheap guard against update-order bugs. Real epidemic models add age groups, contact patterns and uncertainty in β and γ — and are validated against data.",
        },
        {
          id: "stretch", kind: "task", title: "Monte Carlo risk estimate", difficulty: 4,
          prompt: `A project has three tasks with uncertain durations (days), each uniformly distributed between a min and max: lines \`name min max\` until \`end\`; the first line of input is \`seed trials deadline\`. Using \`rng = random.Random(seed)\`, simulate \`trials\` projects (for each trial, draw the tasks in input order with \`rng.uniform(min, max)\` and add them). Print \`mean total X days\` (1 decimal), \`P(late) = p ± m\` where p is the fraction of trials over the deadline and m = 1.96·√(p(1−p)/trials) (both 3 decimals), and \`90th percentile Y days\` (1 decimal, using \`statistics.quantiles(totals, n=10)[-1]\`).`,
          starter: r`import math, random, statistics
`,
          tests: [
            { label: "Project", input: "11 20000 30\ndesign 5 9\nbuild 10 18\ntest 4 8\nend\n", output: "mean total 27.0 days\nP(late) = 0.161 ± 0.005\n90th percentile 30.8 days" },
          ],
          hints: [
            "Read the first line, then the tasks.",
            "For each trial: `sum(rng.uniform(lo, hi) for _, lo, hi in tasks)`.",
            "p = sum(t > deadline for t in totals) / trials.",
            "statistics.quantiles(totals, n=10)[-1] is the 90th percentile.",
          ],
          solution: r`import math, random, statistics

seed, trials, deadline = input().split()
rng = random.Random(int(seed))
trials, deadline = int(trials), float(deadline)
tasks = []
while (line := input()) != "end":
    name, lo, hi = line.split()
    tasks.append((name, float(lo), float(hi)))

totals = [sum(rng.uniform(lo, hi) for _, lo, hi in tasks) for _ in range(trials)]
p = sum(t > deadline for t in totals) / trials
margin = 1.96 * math.sqrt(p * (1 - p) / trials)
print(f"mean total {statistics.mean(totals):.1f} days")
print(f"P(late) = {p:.3f} ± {margin:.3f}")
print(f"90th percentile {statistics.quantiles(totals, n=10)[-1]:.1f} days")`,
          notes: "The mean says the project 'should' take 27 days, but the simulation shows a real chance of missing a 30-day deadline — the kind of insight a single estimate hides. The assumption that durations are independent and uniform is itself something to question.",
        },
      ],
      realWorld: "Epidemiologists ran SIR-style models during COVID-19; weather and climate models step physical equations forward in time; banks and project managers use Monte Carlo to price risk and estimate deadlines.",
      reteach: "Euler's method is walking in fog: you can only see the direction you're facing right now, so you take a small step that way and look again. Small steps keep you on the path; big steps can walk you off a cliff. Monte Carlo is asking 'what usually happens?' by rolling the dice thousands of times and counting — and the more rolls, the more confident (but never certain) you are.",
      summary: [
        "Euler: y += dt·f(t, y); check convergence by halving dt; use RK/solve_ivp for real work.",
        "Monte Carlo: estimate by sampling, report N and uncertainty (SE ∝ 1/√N).",
        "Seed a private generator for reproducibility; keep units explicit; check invariants.",
      ],
      libraryCode: [{
        title: "solve_ivp and vectorised Monte Carlo",
        code: `import numpy as np
from scipy.integrate import solve_ivp
import matplotlib.pyplot as plt

def sir(t, y, beta=0.3, gamma=0.1, n=10_000):
    s, i, r = y
    return [-beta * s * i / n, beta * s * i / n - gamma * i, gamma * i]

sol = solve_ivp(sir, (0, 160), [9990, 10, 0], dense_output=True, rtol=1e-8)
t = np.linspace(0, 160, 400)
plt.plot(t, sol.sol(t).T, label=["S", "I", "R"]); plt.legend(); plt.xlabel("days"); plt.savefig("sir.png")

rng = np.random.default_rng(7)
pts = rng.random((1_000_000, 2))
print(4 * np.mean((pts ** 2).sum(axis=1) <= 1))      # a million samples in a blink`,
        note: "`pip install numpy scipy matplotlib` on your own computer. solve_ivp chooses step sizes automatically to meet the tolerance.",
      }],
    },
  ],
  exam: [
    {
      id: "e1", kind: "mcq", difficulty: 3,
      prompt: "Which is the best way to store ₹19.99 for an invoice total in Python?",
      options: [
        { text: "float 19.99", why: "Binary floats can't represent it exactly." },
        { text: "Decimal(\"19.99\") or integer paise (1999)", why: "Correct." },
        { text: "The string \"19.99\" and convert to float for maths", why: "Same float problem." },
      ],
      answer: 1,
      hint: "Exact decimal arithmetic.",
      explain: "Decimal (from a string) or integer paise avoid rounding errors in money.",
    },
    {
      id: "e2", kind: "predict", difficulty: 3,
      code: r`import math
total = 0.0
for _ in range(10):
    total += 0.1
print(total == 1.0, math.fsum([0.1] * 10) == 1.0)`,
      answer: "False True\n",
      hint: "Each += rounds; fsum tracks the lost bits.",
      explain: "The += loop gives 0.9999999999999999; math.fsum gives the correctly rounded 1.0. (Since Python 3.12 the built-in sum() also compensates, but a manual loop doesn't.)",
    },
    {
      id: "e3", kind: "fill", difficulty: 3,
      prompt: "Exact rational arithmetic.",
      code: r`from fractions import ___
print(Fraction(1, 3) * 3 == 1)`,
      blanks: [["Fraction"]],
      output: "True\n",
      hint: "A class for p/q numbers.",
      explain: "`Fraction(1, 3) * 3` is exactly 1.",
    },
  ],
  project: {
    id: "project", kind: "project", title: "Mini-project: projectile with air resistance", difficulty: 4,
    prompt: `Simulate a cricket ball hit at speed v (m/s) and angle θ (degrees), with gravity g = 9.81 and quadratic air drag: acceleration = −k·|v|·v (vector), k given (per metre). Use Euler steps of dt = 0.001 s from height 1.0 m until the ball's height drops below 0. Input lines \`v angle k\` until \`end\`. For each, print \`v=… angle=… k=…: range R m, max height H m, flight T s\` (R and H with 1 decimal, T with 2 decimals; R and T linearly interpolated to the exact landing moment between the last two steps). For k = 0 also print \`  no-drag check: formula range F m\` using the exact formula for launch height 1 m: R = v cos θ · (v sin θ + √((v sin θ)² + 2 g h)) / g.`,
    starter: r`import math
`,
    tests: [
      { label: "Shots", input: "30 40 0\n30 40 0.005\n30 25 0.005\nend\n", output: "v=30 angle=40 k=0: range 91.5 m, max height 20.0 m, flight 3.98 s\n  no-drag check: formula range 91.5 m\nv=30 angle=40 k=0.005: range 69.4 m, max height 17.2 m, flight 3.69 s\nv=30 angle=25 k=0.005: range 58.8 m, max height 8.3 m, flight 2.53 s" },
    ],
    hints: [
      "State: x, y, vx, vy. Each step: speed = hypot(vx, vy); ax = −k·speed·vx; ay = −g − k·speed·vy.",
      "Update positions with the old velocities, then velocities (simple Euler).",
      "When y becomes negative, interpolate: frac = y_prev / (y_prev − y_new).",
      "Track the maximum y.",
    ],
    solution: r`import math

G, DT = 9.81, 0.001

def simulate(v, angle, k, h0=1.0):
    t = math.radians(angle)
    x, y, vx, vy, time = 0.0, h0, v * math.cos(t), v * math.sin(t), 0.0
    top = y
    while True:
        speed = math.hypot(vx, vy)
        ax, ay = -k * speed * vx, -G - k * speed * vy
        nx, ny = x + DT * vx, y + DT * vy
        vx, vy = vx + DT * ax, vy + DT * ay
        if ny < 0:
            frac = y / (y - ny)
            return x + frac * (nx - x), top, time + frac * DT
        x, y, time = nx, ny, time + DT
        top = max(top, y)

while (line := input()) != "end":
    v, angle, k = map(float, line.split())
    rng, top, flight = simulate(v, angle, k)
    print(f"v={v:g} angle={angle:g} k={k:g}: range {rng:.1f} m, max height {top:.1f} m, flight {flight:.2f} s")
    if k == 0:
        t = math.radians(angle)
        vy = v * math.sin(t)
        exact = v * math.cos(t) * (vy + math.sqrt(vy * vy + 2 * G * 1.0)) / G
        print(f"  no-drag check: formula range {exact:.1f} m")`,
    notes: "The no-drag run matching the formula is your evidence that the integrator works; then drag shortens the range noticeably and lowers the best angle below 45°. Before trusting the drag numbers for real cricket you'd need a measured k (it depends on the ball, seam and air), spin (Magnus force), wind, and a better integrator or smaller dt.",
  },
};
