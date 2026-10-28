/**
 * The essential student journey, end to end in a real browser against the dev server, with code
 * compiled and run by the real sandbox (Windows dev backend): one-click guest start → lesson →
 * run → compile error → check → XP → reload → dashboard → playground → keep progress (claim).
 * Each test gets a fresh browser context, i.e. a brand-new visitor.
 */
import { expect, test, type Page } from "@playwright/test";
import { COURSE_LESSONS } from "../src/content/course";

const CORRECT = `#include <iostream>
using namespace std;

int main() {
    cout << "Boil water" << endl;
    cout << "Add tea leaves" << endl;
    cout << "Pour into a cup" << endl;
    return 0;
}`;

const SYNTAX_ERROR = `#include <iostream>
using namespace std;

int main() {
    int a = 10;
    cout << b;
    return 0;
}`;

/** Types into the lesson/playground editor via its plain-text mode (Monaco is checked separately). */
async function writeCode(page: Page, code: string, label: RegExp = /Code editor for/) {
  const simple = page.getByRole("button", { name: "Simple editor" }).first();
  if (await simple.isVisible()) await simple.click();
  await page.getByRole("textbox", { name: label }).fill(code);
}

async function startAsGuest(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: /Start learning/ }).first().click();
  await expect(page).toHaveURL(/\/app\/learn\/what-is-programming$/, { timeout: 30_000 });
}

test("journey: start in one click → lesson → run → check → XP → reload → dashboard", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: /Learn C\+\+/ })).toBeVisible();
  await page.screenshot({ path: "test-results/1-landing.png" });
  await startAsGuest(page);

  await expect(page.getByRole("heading", { level: 1, name: "What is programming?" })).toBeVisible();
  await expect(page.getByText("up to 25 XP")).toBeVisible();
  await page.screenshot({ path: "test-results/2-lesson.png" });

  // Predict, then reveal the example output.
  await page.getByRole("button", { name: "Reveal the output" }).click();
  await expect(page.locator("pre", { hasText: "Pour into a cup" }).first()).toBeVisible();

  // Practise: a compile error first, then the right program.
  await writeCode(page, SYNTAX_ERROR);
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.getByText("Compile error — the program didn't run")).toBeVisible();
  await expect(page.getByText(/is used but was never declared/).first()).toBeVisible();

  await writeCode(page, CORRECT);
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.getByText(/Ran successfully/)).toBeVisible();
  await page.getByRole("button", { name: "Check answer" }).click();
  await expect(page.getByText(/Exercise complete — all 1 tests passed/)).toBeVisible();
  await expect(page.getByText("+25 XP", { exact: true })).toBeVisible();
  await expect(page.getByText(/Achievement unlocked: First Steps/)).toBeVisible();
  await page.screenshot({ path: "test-results/3-passed.png" });

  // Progress survives a reload (server-side), and the draft comes back from this browser.
  await page.reload();
  await expect(page.getByText("Completed · +25 XP")).toBeVisible();

  // Dashboard: XP and the next lesson.
  await page.goto("/app");
  await expect(page.getByRole("link", { name: /25 XP/ }).first()).toBeVisible();
  await expect(page.getByText(`Lesson path · 1/${COURSE_LESSONS.length} done`)).toBeVisible();
  await page.getByRole("link", { name: /Continue with “How programs work”/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "How programs work" })).toBeVisible();
});

test("a wrong answer gets feedback, and one hidden test can be revealed on request", async ({ page }) => {
  await startAsGuest(page);
  await page.goto("/app/learn/if-else");
  await writeCode(page, "#include <iostream>\nusing namespace std;\nint main() { int n; cin >> n; if (n % 2 == 1) cout << \"Odd\"; else cout << \"Even\"; }");
  await page.getByRole("button", { name: "Check answer" }).click();
  await expect(page.getByText("4 of 5 tests passed")).toBeVisible();
  await page.getByRole("button", { name: "Show me one failing hidden test" }).click();
  await expect(page.getByText("Hidden test: negative odd")).toBeVisible();
});

test("an infinite loop is stopped and explained", async ({ page }) => {
  await startAsGuest(page);
  await page.goto("/app/learn/why-loops");
  await writeCode(page, "#include <iostream>\nint main() {\n    for (int i = 1; i <= 10; i--) {}\n    return 0;\n}");
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.getByText("The program ran too long and was stopped")).toBeVisible();
});

test("mentor: hints one level at a time, worked solution only on request, less XP after it", async ({ page }) => {
  await startAsGuest(page);
  await page.goto("/app/learn/variables");
  const mentor = page.getByRole("region", { name: "Mentor" });
  await expect(mentor.getByText("Built-in help")).toBeVisible();
  await mentor.getByRole("button", { name: "Give me a hint" }).click();
  await expect(mentor.getByText("Hint 1 of 4")).toBeVisible();
  await expect(mentor.getByRole("button", { name: /Show worked solution/ })).toHaveCount(0);
  for (const n of [2, 3, 4]) {
    await mentor.getByRole("button", { name: new RegExp(`Next hint \\(${n} of 4\\)`) }).click();
    await expect(mentor.getByText(`Hint ${n} of 4`)).toBeVisible();
  }
  page.once("dialog", (d) => d.accept());
  await mentor.getByRole("button", { name: /Show worked solution/ }).click();
  await expect(mentor.getByText("Worked solution", { exact: true })).toBeVisible();
  // Passing after seeing the solution still counts, for less XP.
  await writeCode(page, "#include <iostream>\nusing namespace std;\nint main() { int a, b; cin >> a >> b; int t = a; a = b; b = t; cout << \"a = \" << a << endl << \"b = \" << b << endl; }");
  await page.getByRole("button", { name: "Check answer" }).click();
  await expect(page.getByText("+5 XP", { exact: true })).toBeVisible();
});

test("explain-my-error works without any AI configured", async ({ page }) => {
  await startAsGuest(page);
  await page.goto("/app/learn/variables");
  await writeCode(page, SYNTAX_ERROR);
  const mentor = page.getByRole("region", { name: "Mentor" });
  await mentor.getByRole("button", { name: "Explain error" }).click();
  await expect(mentor.getByText(/is used but was never declared/)).toBeVisible();
});

test("playground: load a lesson example, run it, break it, get an explanation", async ({ page }) => {
  await startAsGuest(page);
  await page.getByRole("link", { name: "Open this example in the Playground and change it" }).click();
  await expect(page.getByRole("heading", { name: "Code Playground" })).toBeVisible();
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.getByText(/Ran successfully/)).toBeVisible();
  await page.getByLabel("Load an example").selectOption("variables");
  await writeCode(page, "#include <iostream>\nint main() {\n    int x = 1\n    return x;\n}", /Playground code/);
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.getByText("A semicolon is missing").first()).toBeVisible();
  const mentor = page.getByRole("region", { name: "Mentor" });
  await mentor.getByRole("button", { name: "Explain this error" }).click();
  await expect(mentor.getByText("About your error")).toBeVisible();
  await page.screenshot({ path: "test-results/4-playground.png" });
});

test("guests can keep their progress with a username and sign back in", async ({ page }) => {
  await startAsGuest(page);
  await writeCode(page, CORRECT);
  await page.getByRole("button", { name: "Check answer" }).click();
  await expect(page.getByText(/Exercise complete/)).toBeVisible();
  await page.goto("/app/settings");
  const username = `e2e_${Date.now()}`;
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").first().fill("e2e-password-123");
  await page.getByRole("button", { name: "Keep my progress" }).click();
  // The recovery code is shown once, and continuing needs a confirmation that it was saved.
  const code = (await page.getByTestId("recovery-code").textContent())!.trim();
  expect(code).toMatch(/^[0-9A-Z]{4}(-[0-9A-Z]{4}){3}$/);
  await expect(page.getByRole("button", { name: "Done" })).toBeDisabled();
  await page.getByLabel("I've saved my recovery code.").check();
  await page.getByRole("button", { name: "Done" }).click();
  await expect(page.getByText("Your progress is saved")).toBeVisible();
  await expect(page.getByText(`Signed in as ${username}.`)).toBeVisible();
  await page.getByRole("button", { name: "Sign out" }).click();
  // Let the sign-out redirect finish first, or it can land after (and override) the next goto.
  await page.waitForURL((url) => !url.pathname.startsWith("/app"));
  await page.goto("/login");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill("e2e-password-123");
  await page.getByRole("button", { name: /Sign in/ }).click();
  await expect(page).toHaveURL(/\/app/);
  await page.goto("/app/learn/what-is-programming");
  await expect(page.getByText("Completed · +25 XP")).toBeVisible();

  // Forgot the password: the recovery code sets a new one and hands out a fresh code.
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/app"));
  await page.goto("/login");
  await page.getByRole("link", { name: "Forgot your password?" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Forgot your password?" })).toBeVisible();
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Recovery code").fill(code.toLowerCase());
  await page.getByLabel("New password").fill("e2e-new-password-456");
  await page.getByLabel("Type it again").fill("e2e-new-password-456");
  await page.getByRole("button", { name: "Set new password" }).click();
  await expect(page.getByText("Password changed")).toBeVisible();
  await expect(page.getByTestId("recovery-code")).not.toHaveText(code);
  await page.getByLabel("I've saved my recovery code.").check();
  await page.getByRole("button", { name: "Continue to CodeMentor" }).click();
  await expect(page).toHaveURL(/\/app/);
});

test("a failed request shows a clear message instead of a false success", async ({ page }) => {
  await startAsGuest(page);
  await writeCode(page, CORRECT);
  await page.route("**/api/lessons/check", (route) => route.abort("connectionfailed"));
  await page.getByRole("button", { name: "Check answer" }).click();
  await expect(page.getByText(/Couldn't reach CodeMentor|offline/)).toBeVisible();
  await expect(page.getByText(/Exercise complete/)).toHaveCount(0);
});

test("the Monaco editor loads for desktop users", async ({ page }) => {
  await startAsGuest(page);
  await expect(page.locator(".monaco-editor").first()).toBeVisible({ timeout: 30_000 });
});

test("mobile: landing, start and lessons are usable with no sideways scrolling", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await page.goto("/");
  expect(await overflow()).toBeLessThanOrEqual(1);
  await page.getByRole("button", { name: /Start learning/ }).first().click();
  await expect(page).toHaveURL(/\/app\/learn\/what-is-programming$/, { timeout: 30_000 });
  expect(await overflow()).toBeLessThanOrEqual(1);
  await expect(page.getByRole("textbox", { name: /Code editor for/ })).toBeVisible();
  await page.screenshot({ path: "test-results/5-mobile-lesson.png" });
  await ctx.close();
});

test("admin pages and APIs refuse anyone who isn't an admin", async ({ page, request }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login/);
  const res = await request.post("/api/admin/generate", { data: { conceptId: "for-loops", difficulty: 1 }, headers: { origin: "http://localhost:3400" } });
  expect(res.status()).toBe(401);
  await startAsGuest(page);
  await page.goto("/admin");
  await expect(page).not.toHaveURL(/\/admin/);
  const asGuest = await page.request.post("/api/admin/question-status", { data: { questionId: "x", status: "disabled" }, headers: { origin: "http://localhost:3400" } });
  expect(asGuest.status()).toBe(403);
});

test("practice problems: the ladder links the lesson's three levels, and a solved problem earns XP", async ({ page }) => {
  await startAsGuest(page);
  await page.goto("/app/learn/for-loops");
  const ladder = page.getByRole("navigation", { name: "Practice problems" });
  await expect(ladder.getByText("0/3 solved")).toBeVisible();
  await ladder.getByRole("link", { name: /Intermediate · 20 XP/ }).click();
  await expect(page).toHaveURL(/\/app\/learn\/for-loops\/practice\/p2$/);
  await expect(page.getByRole("heading", { level: 1, name: "Sum of squares" })).toBeVisible();

  await writeCode(page, `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    long long s = 0;
    for (int i = 1; i <= n; i++) s += (long long)i * i;
    cout << s << endl;
    return 0;
}`);
  await page.getByRole("button", { name: "Check answer" }).click();
  await expect(page.getByText(/Problem solved — all \d+ tests passed/)).toBeVisible();
  await expect(page.getByText("+20 XP", { exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByText("Solved · +20 XP")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Practice problems" }).getByText("1/3 solved")).toBeVisible();
});
