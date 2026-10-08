// End-to-end tests against a running stack.
//
// In CI the stack is docker-compose.local.yml + docker-compose.e2e.yml:
// frontend on :3000, a second frontend with a sponsor configured on :3001,
// backend on :8000. The app switches ads off on localhost, so the browser
// reaches the frontends as xsltplayground.test, mapped to 127.0.0.1: the ad
// tests then exercise the same code path as production.
//
// The "smoke" project is the small subset that also runs against production
// every 15 minutes (charts/xslt-playground/files/smoke); see that directory.
import { defineConfig } from "@playwright/test";

const host = process.env.E2E_HOST || "xsltplayground.test";
export const FRONTEND = process.env.E2E_BASE_URL || `http://${host}:3000`;
export const SPONSOR_FRONTEND = process.env.E2E_SPONSOR_URL || `http://${host}:3001`;
export const BACKEND = process.env.E2E_BACKEND_URL || "http://localhost:8000";

export default defineConfig({
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: FRONTEND,
    viewport: { width: 1400, height: 900 },
    // Marks every request as synthetic: the backend serves it normally but
    // keeps it out of its metrics and error log.
    extraHTTPHeaders: { "X-Synthetic-Check": "e2e" },
    trace: "retain-on-failure",
    launchOptions: {
      args: [`--host-resolver-rules=MAP ${host} 127.0.0.1`],
    },
  },
  projects: [
    { name: "full", testDir: "./tests" },
    { name: "smoke", testDir: "../charts/xslt-playground/files/smoke", testMatch: /.*\.spec\.js/ },
  ],
});
