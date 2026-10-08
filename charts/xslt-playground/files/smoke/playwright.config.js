// Config for the production smoke test inside the cluster (see the chart's
// smoke CronJob). CI runs the same spec through e2e/playwright.config.js.
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: /.*\.spec\.js/,
  timeout: 60_000,
  retries: 1,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: process.env.SMOKE_BASE_URL || "https://xsltplayground.com",
    viewport: { width: 1400, height: 900 },
    extraHTTPHeaders: { "X-Synthetic-Check": "smoke" },
  },
});
