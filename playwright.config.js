import { defineConfig, devices } from "@playwright/test";

const runFullMatrix = process.env.PLAYWRIGHT_FULL_MATRIX === "1";

const defaultProjects = [
  {
    name: "chromium",
    use: { ...devices["Desktop Chrome"] },
  },
];

const fullMatrixProjects = [
  {
    name: "chromium",
    use: { ...devices["Desktop Chrome"] },
  },
  {
    name: "firefox",
    use: { ...devices["Desktop Firefox"] },
  },
  {
    name: "webkit",
    use: { ...devices["Desktop Safari"] },
  },
  {
    name: "Mobile Chrome",
    use: { ...devices["Pixel 5"] },
  },
  {
    name: "Mobile Safari",
    use: { ...devices["iPhone 12"] },
  },
  {
    name: "Tablet",
    use: { ...devices["iPad Pro"] },
  },
];

export default defineConfig({
  testDir: "./tests/visual",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:4173",
    trace: "on-first-retry",
  },
  projects: runFullMatrix ? fullMatrixProjects : defaultProjects,
  webServer: {
    command: "pnpm build && pnpm serve",
    port: 4173,
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe",
  },
});
