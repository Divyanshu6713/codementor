/**
 * The essential student journey, end to end in a real browser, with code compiled and run by the
 * real sandbox (dev backend). Plus: errors, infinite loops, hints and the worked solution, cleared
 * storage, slow and failing network, mobile layout, and admin access control.
 */
import { expect, test, type Page } from "@playwright/test";

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

/** Switches the lesson editor to the plain textarea (Monaco is covered separately) and types code. */
async function writeCode(page: Page, code: string) {
  const simple = page.getByRole("button", { name: "Simple editor" });
  if (await simple.isVisible()) await simple.click();
  const box = page.getByRole("textbox", { name: /Code editor for/ });
  await box.fill(code);
}

test.beforeEach(async ({ page }) => {
  // Start every test as a brand-new visitor.
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
});

test("the essential journey: start → read → write → run → check → complete → reload → continue", async ({ page }) => {
  // 1–2. Open CodeMentor, Start Learning (no sign-up).
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "CodeMentor" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Continue Learning/ })).toHaveCount(0);
  await page.getByRole("link", { name: /Start Learning/ }).click();

  // 3–4. The first C++ basics lesson.
  await expect(page).toHaveURL(/\/learn\/what-is-programming$/);
  await expect(page.getByRole("heading", { level: 1, name: "What is programming?" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "What you'll learn" })).toBeVisible();
  await expect(page.getByText("A program is a list of instructions", { exact: false })).toBeVisible();
  await page.screenshot({ path: "test-results/journey-1-lesson.png" });

  // 5. Open the coding exercise.
  await page.getByRole("link", { name: "Practise", exact: true }).click();
  await expect(page.getByRole("heading", { name: /Practise: Put the steps in order/ })).toBeVisible();

  // 6–9. Write C++, Run — first with a mistake, then correctly.
  await writeCode(page, SYNTAX_ERROR);
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.getByText("Compile error — the program didn't run")).toBeVisible();
  await expect(page.getByText("`b` is used but was never declared", { exact: false }).or(page.getByText("is used but was never declared"))).toBeVisible();

  await writeCode(page, CORRECT);
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.getByText(/Ran successfully/)).toBeVisible();
  await expect(page.locator("pre", { hasText: "Add tea leaves" }).last()).toBeVisible();

  // 10–12. Check the answer, get feedback, complete the lesson.
  await page.getByRole("button", { name: "Check answer" }).click();
  await expect(page.getByText(/Exercise complete — all 1 tests passed/)).toBeVisible();
  await expect(page.getByText("Lesson complete", { exact: true })).toBeVisible();
  await page.screenshot({ path: "test-results/journey-2-complete.png", fullPage: false });

  // 13–14. Progress is saved; reload.
  await page.reload();
  await expect(page.getByRole("navigation", { name: "Course map" }).getByRole("link", { name: /What is programming\?/ }).getByLabel("completed")).toBeVisible();
  await expect(page.getByText("Lesson complete", { exact: true })).toBeVisible();
  // The saved draft comes back too.
  await page.getByRole("button", { name: "Simple editor" }).click();
  await expect(page.getByRole("textbox", { name: /Code editor for/ })).toHaveValue(CORRECT);

  // 15. Continue from saved progress.
  await page.goto("/");
  const cont = page.getByRole("link", { name: /Continue Learning/ });
  await expect(cont).toBeVisible();
  await cont.click();
  await expect(page.getByRole("heading", { level: 1, name: "How programs work" })).toBeVisible();
});

test("an infinite loop is stopped and explained", async ({ page }) => {
  await page.goto("/learn/why-loops");
  await writeCode(page, "#include <iostream>\nint main() {\n    for (int i = 1; i <= 10; i--) {}\n    return 0;\n}");
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.getByText("The program ran too long and was stopped")).toBeVisible();
});

test("a wrong answer gets feedback, and one hidden test can be revealed on request", async ({ page }) => {
  await page.goto("/learn/if-else");
  await writeCode(page, "#include <iostream>\nusing namespace std;\nint main() { int n; cin >> n; if (n % 2 == 1) cout << \"Odd\"; else cout << \"Even\"; }");
  await page.getByRole("button", { name: "Check answer" }).click();
  await expect(page.getByText("4 of 5 tests passed")).toBeVisible();
  await expect(page.getByText("1 hidden test failed")).toBeVisible();
  await page.getByRole("button", { name: "Show me one failing hidden test" }).click();
  await expect(page.getByText("Hidden test: negative odd")).toBeVisible();
});

test("hints come one level at a time; the worked solution needs an explicit request", async ({ page }) => {
  await page.goto("/learn/variables");
  const help = page.getByRole("region", { name: "Help" });
  await expect(help.getByText("Built-in help")).toBeVisible();
  await help.getByRole("button", { name: "Give me a hint" }).click();
  await expect(help.getByText("Hint 1 of 4")).toBeVisible();
  await expect(help.getByText("what happens to the value that was in", { exact: false })).toBeVisible();
  await expect(help.getByRole("button", { name: /Show worked solution/ })).toHaveCount(0);
  for (const n of [2, 3, 4]) {
    await help.getByRole("button", { name: new RegExp(`Next hint \\(${n} of 4\\)`) }).click();
    await expect(help.getByText(`Hint ${n} of 4`)).toBeVisible();
  }
  page.once("dialog", (d) => d.accept());
  await help.getByRole("button", { name: /Show worked solution/ }).click();
  await expect(help.getByText("Worked solution")).toBeVisible();
  await expect(help.locator("code, pre").filter({ hasText: "int temp = a;" }).first()).toBeVisible();
});

test("explain-my-error works without any AI configured", async ({ page }) => {
  await page.goto("/learn/variables");
  await writeCode(page, SYNTAX_ERROR);
  const help = page.getByRole("region", { name: "Help" });
  await help.getByRole("button", { name: "Explain error" }).click();
  await expect(help.getByText("About your error")).toBeVisible();
  await expect(help.getByText(/is used but was never declared/)).toBeVisible();
  await expect(help.getByText("Built-in", { exact: true })).toBeVisible();
});

test("cleared browser storage starts fresh without errors", async ({ page }) => {
  await page.goto("/learn/what-is-programming");
  await writeCode(page, CORRECT);
  await page.getByRole("button", { name: "Check answer" }).click();
  await expect(page.getByText(/Exercise complete/)).toBeVisible();
  await page.evaluate(() => localStorage.clear());
  await page.goto("/");
  await expect(page.getByRole("link", { name: /Continue Learning/ })).toHaveCount(0);
  await page.goto("/learn/what-is-programming");
  await expect(page.getByText("Lesson complete", { exact: true })).toHaveCount(0);
});

test("corrupt saved progress is reset with a notice, not a crash", async ({ page }) => {
  await page.evaluate(() => localStorage.setItem("cm-progress", "{\"v\":42,\"oops\":true"));
  await page.goto("/learn");
  await expect(page.getByText(/couldn't be read/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "C++ course map" })).toBeVisible();
});

test("a slow network shows progress, and a failed request shows a clear message", async ({ page }) => {
  await page.goto("/learn/what-is-programming");
  await writeCode(page, CORRECT);
  await page.route("**/api/guest/run", async (route) => {
    await new Promise((r) => setTimeout(r, 2500));
    await route.continue();
  });
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.locator("[aria-busy=true]")).toBeVisible();
  await expect(page.getByText(/Ran successfully/)).toBeVisible({ timeout: 30_000 });
  await page.unroute("**/api/guest/run");
  await page.route("**/api/guest/check", (route) => route.abort("connectionfailed"));
  await page.getByRole("button", { name: "Check answer" }).click();
  await expect(page.getByText(/Couldn't reach CodeMentor|offline/)).toBeVisible();
});

test("the Monaco editor loads for desktop users", async ({ page }) => {
  await page.goto("/learn/hello-world");
  await expect(page.locator(".monaco-editor").first()).toBeVisible({ timeout: 30_000 });
});

test("mobile layout: readable lesson, no sideways scrolling, simple editor by default", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto("/learn/for-loops");
  await expect(page.getByRole("heading", { level: 1, name: "for loops" })).toBeVisible();
  await expect(page.getByText("Course map").first()).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.getByRole("link", { name: "Practise", exact: true }).click();
  await expect(page.getByRole("textbox", { name: /Code editor for/ })).toBeVisible();
  await page.screenshot({ path: "test-results/mobile-lesson.png" });
  await page.goto("/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: "test-results/mobile-home.png" });
  await ctx.close();
});

test("admin pages and APIs refuse visitors who aren't signed in as admins", async ({ page, request }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login/);
  const res = await request.post("/api/admin/generate", { data: { conceptId: "for-loops", difficulty: 1 }, headers: { origin: "http://localhost:3400" } });
  expect(res.status()).toBe(401);
  const res2 = await request.post("/api/admin/question-status", { data: { questionId: "x", status: "disabled" }, headers: { origin: "http://localhost:3400" } });
  expect(res2.status()).toBe(401);
});
