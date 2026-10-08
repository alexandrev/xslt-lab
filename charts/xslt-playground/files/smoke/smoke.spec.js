// Production smoke test: runs every 15 minutes from the cluster (CronJob in
// this chart) and in CI against the local stack. Self-contained on purpose —
// in the cluster it is the only file next to its config.
//
// It must not distort what it watches: analytics are blocked, ad decisions
// are counted and dropped (no impressions, nothing billed), and every request
// carries X-Synthetic-Check, which the backend keeps out of its metrics and
// error log. About ten transformations per run.
import { test, expect } from "@playwright/test";

const BACKEND = process.env.SMOKE_BACKEND_URL || process.env.E2E_BACKEND_URL || "http://localhost:8000";
// In CI the browser reaches the stack as xsltplayground.test (mapped inside
// the browser only); requests made from Node need the address itself.
const direct = (url) => url.replace("//xsltplayground.test", "//127.0.0.1");

async function isolate(page) {
  const adDecisions = [];
  await page.route(
    /(googletagmanager\.com|google-analytics\.com|clarity\.ms|umami\.alexandre-vazquez\.cloud|media\.ethicalads\.io\/abp)/,
    (route) => route.abort(),
  );
  await page.route(/server\.ethicalads\.io\/api\/v1\/decision/, (route) => {
    adDecisions.push(route.request().url());
    return route.abort();
  });
  return adDecisions;
}

const stylesheet = (version) =>
  `<xsl:stylesheet version="${version}" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"><xsl:template match="/"><ok/></xsl:template></xsl:stylesheet>`;

test("editor loads, runs the welcome example and asks for an ad", async ({ page, request, baseURL }) => {
  const adDecisions = await isolate(page);
  const posts = [];
  page.on("request", (r) => r.method() === "POST" && new URL(r.url()).pathname === "/transform" && posts.push(Date.now()));

  const env = await request.get(direct(baseURL + "/env.js"));
  expect(env.ok()).toBeTruthy();
  const window = {};
  new Function("window", await env.text())(window);
  expect(typeof window.env, "env.js must parse").toBe("object");

  await page.goto("/");
  await expect(page.locator(".success-box")).toBeVisible({ timeout: 20_000 });
  expect(adDecisions.length, "ad decisions on load").toBeGreaterThanOrEqual(1);
  expect(adDecisions[0]).toContain("campaign_types=paid%7Cpublisher-house");

  // Typing runs one transformation after the pause, not one per key.
  const before = posts.length;
  await page.locator('.cm-content[aria-label="Input XML"] .cm-line').nth(2).click();
  await page.keyboard.press("End");
  await page.keyboard.type("smoke", { delay: 120 });
  await page.waitForTimeout(4_000);
  expect(posts.length - before, "transformations for 5 keystrokes").toBe(1);
});

for (const version of ["1.0", "2.0", "3.0"]) {
  test(`XSLT ${version} transforms`, async ({ request }) => {
    const res = await request.post(`${BACKEND}/transform`, {
      data: { xslt: stylesheet(version), version, parameters: { input: "<a/>" } },
      timeout: 20_000,
    });
    const body = await res.json();
    expect(res.status(), JSON.stringify(body)).toBe(200);
    expect(body.result).toContain("<ok/>");
  });
}

test("landing pages answer, without the trailing slash too", async ({ request, baseURL }) => {
  const res = await request.get(direct(`${baseURL}/xpath-tester`), { maxRedirects: 0 });
  expect(res.status()).toBe(301);
  const page = await request.get(direct(`${baseURL}/xpath-tester/`));
  expect(page.ok()).toBeTruthy();
});
