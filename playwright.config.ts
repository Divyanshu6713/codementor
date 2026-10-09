import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests drive a real browser against the dev server with the local sandbox worker
 * (`npm run dev`), so Run/Check use the real compiler. `channel` uses an installed browser
 * (Edge by default; set PW_CHANNEL=chrome or unset it after `npx playwright install chromium`).
 */
const channel = process.env.PW_CHANNEL ?? "msedge";

export default defineConfig({
  testDir: "e2e",
  timeout: 90_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3400",
    channel: channel || undefined,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Edge"], channel: channel || undefined, viewport: { width: 1440, height: 900 } } },
  ],
  webServer: process.env.E2E_BASE_URL ? undefined : {
    command: "npm run dev",
    url: "http://localhost:3400/api/health",
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
