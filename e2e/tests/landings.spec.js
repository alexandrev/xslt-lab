// The landing pages send people into the editor; their links are tagged so
// GA4 can tell that traffic from direct visits, and each page has one URL.
import { test, expect } from "@playwright/test";
import { isolate, direct } from "./helpers.js";

for (const name of ["xpath-tester", "xslt-2-0", "xslt-3-0", "xml-to-json"]) {
  test(`/${name} redirects to its trailing-slash URL`, async ({ request, baseURL }) => {
    const res = await request.get(direct(`${baseURL}/${name}`), { maxRedirects: 0 });
    expect(res.status()).toBe(301);
    expect(res.headers()["location"]).toBe(`/${name}/`);
  });
}

test("the XPath landing opens the editor on the XPath template, tagged", async ({ page }) => {
  await isolate(page);
  await page.goto("/xpath-tester/");
  const cta = page.locator('a[href*="template=xpath-tester"]').first();
  const href = await cta.getAttribute("href");
  expect(href).toContain("utm_medium=landing");
  expect(href).toContain("utm_campaign=xpath-tester");
  const local = new URL(href.replace("https://xsltplayground.com", ""), page.url());
  await page.goto(local.toString());
  await expect(page.locator(".tab-button, .tab").filter({ hasText: "XPath tester" }).first()).toBeVisible();
});
