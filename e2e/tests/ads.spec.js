// September 2026: a refresh that silently did nothing cost five days of ad
// revenue, and a double initialisation sent every view twice. The app earns by
// session length: one ad decision on load, then one a minute while visible.
import { test, expect } from "@playwright/test";
import { isolate, openEditor, SPONSOR_FRONTEND } from "./helpers.js";

test("the ad slot is the manual header placement, paid or our fallback only", async ({ page }) => {
  await isolate(page);
  await openEditor(page);
  const slot = page.locator("#xsltplayground-main");
  await expect(slot).toHaveAttribute("data-ea-manual", "true");
  await expect(slot).toHaveAttribute("data-ea-style", "fixedheader");
  await expect(slot).toHaveAttribute("data-ea-campaign-types", "paid|publisher-house");
});

test("one decision on load, then one every 60 seconds", async ({ page }) => {
  test.setTimeout(180_000);
  const { adDecisions } = await isolate(page);
  await openEditor(page);
  await page.waitForTimeout(5_000);
  // The load, plus at most the existing retry when the slot is still empty
  // after 1.5 s (always the case here: decisions are dropped).
  const onLoad = adDecisions.length;
  expect(onLoad).toBeGreaterThanOrEqual(1);
  expect(onLoad).toBeLessThanOrEqual(2);
  expect(adDecisions[0].url).toContain("campaign_types=paid%7Cpublisher-house");

  await page.waitForTimeout(125_000);
  const refreshes = adDecisions.slice(onLoad).map((d) => d.at);
  expect(refreshes, `refresh times: ${refreshes.join(", ")}`).toHaveLength(2);
  expect(refreshes[1] - refreshes[0]).toBeGreaterThan(55);
  expect(refreshes[1] - refreshes[0]).toBeLessThan(95);
});

test("with a sponsor configured, the sponsor replaces the ad entirely", async ({ page }) => {
  const { adDecisions } = await isolate(page);
  await openEditor(page, SPONSOR_FRONTEND + "/");
  const link = page.locator(".sponsor-bar__link");
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute("href", /utm_source=xsltplayground/);
  await expect(page.locator("#xsltplayground-main")).toHaveCount(0);
  await page.waitForTimeout(3_000);
  expect(adDecisions).toHaveLength(0);
});
