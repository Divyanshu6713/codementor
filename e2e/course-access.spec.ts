/**
 * Regression for "lessons 12–18 show 'coming later' and can't be opened": every topic in the
 * full path opens a real lesson, from the overview and by direct URL, for guests and for
 * signed-in students. Nothing here depends on progress — a brand-new visitor can open everything.
 */
import { expect, test, type Page } from "@playwright/test";
import { CONCEPTS } from "../src/content/curriculum";
import { COURSE_MODULES, getCourseLesson } from "../src/content/course";

const REPORTED = ["strings", "2d-arrays", "pointers", "oop", "stl", "complexity", "searching-sorting", "recursion"];

async function startAsGuest(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: /Start learning/ }).first().click();
  await expect(page).toHaveURL(/\/app\/learn\/what-is-programming$/, { timeout: 30_000 });
}

/** A real lesson page: its title, the exercise editor's Check button, and no "coming later". */
async function expectRealLesson(page: Page, lessonId: string) {
  await expect(page.getByRole("heading", { level: 1, name: getCourseLesson(lessonId)!.title })).toBeVisible();
  await expect(page.getByRole("button", { name: "Check answer" })).toBeVisible();
  await expect(page.getByText(/coming later/i)).toHaveCount(0);
}

test("guest: every reported topic opens from the full path, with no locks", async ({ page }) => {
  test.setTimeout(180_000);
  await startAsGuest(page);
  await page.goto("/app/learn");
  // Other learning paths (e.g. JavaScript) are honestly "coming later"; the C++ path must not be.
  await expect(page.locator("section[aria-labelledby=path]").getByText(/coming later/i)).toHaveCount(0);
  await expect(page.locator("[data-course-modules]").getByText(/coming later/i)).toHaveCount(0);
  for (const id of REPORTED) {
    const concept = CONCEPTS.find((c) => c.id === id)!;
    const row = page.locator(`li[data-concept="${id}"]`);
    await expect(row, id).toBeVisible();
    await row.getByRole("link", { name: new RegExp(`^Open ${concept.title.replace(/[.*+?^${}()|[\]\\&]/g, "\\$&")}`) }).click();
    await expect(page).toHaveURL(new RegExp(`/app/learn/${concept.courseLessons[0]}$`));
    await expectRealLesson(page, concept.courseLessons[0]);
    await page.goto("/app/learn");
  }
});

test("guest: every lesson of the reported topics loads by direct URL", async ({ page }) => {
  test.setTimeout(240_000);
  await startAsGuest(page);
  const ids = [...new Set(REPORTED.flatMap((id) => CONCEPTS.find((c) => c.id === id)!.courseLessons))];
  for (const id of ids) {
    await page.goto(`/app/learn/${id}`);
    await expectRealLesson(page, id);
  }
});

test("the first lesson of every one of the 17 modules opens by direct URL", async ({ page }) => {
  test.setTimeout(240_000);
  await startAsGuest(page);
  for (const m of COURSE_MODULES) {
    await page.goto(`/app/learn/${m.lessons[0]}`);
    await expectRealLesson(page, m.lessons[0]);
  }
});

test("prev/next walks from Strings into the new modules without dead ends", async ({ page }) => {
  await startAsGuest(page);
  await page.goto("/app/learn/c-strings");
  await page.getByRole("link", { name: /^Next: Addresses and pointers/ }).click();
  await expectRealLesson(page, "pointers-basics");
  await page.getByRole("link", { name: /C-style strings/ }).click();
  await expect(page).toHaveURL(/\/app\/learn\/c-strings$/);
});

test("signed-in student: the same topics open, and an unknown lesson shows the not-found page", async ({ page }) => {
  await startAsGuest(page);
  await page.goto("/app/settings");
  const username = `e2e_access_${Date.now()}`;
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").first().fill("e2e-password-123");
  await page.getByRole("button", { name: "Keep my progress" }).click();
  await expect(page.getByTestId("recovery-code")).toBeVisible();
  await page.getByLabel("I've saved my recovery code.").check();
  await page.getByRole("button", { name: "Done" }).click();
  await expect(page.getByText(`Signed in as ${username}.`)).toBeVisible();
  for (const id of ["two-d-arrays", "dynamic-memory", "inheritance-polymorphism", "stack-queue", "complexity", "simple-sorts", "recursion"]) {
    await page.goto(`/app/learn/${id}`);
    await expectRealLesson(page, id);
  }
  // /app streams (app/app/loading.tsx), so Next sends 200 before notFound() runs; the page itself is the 404 UI.
  await page.goto("/app/learn/no-such-lesson");
  await expect(page.getByRole("heading", { level: 1, name: /couldn.t find that page/ })).toBeVisible();
});
