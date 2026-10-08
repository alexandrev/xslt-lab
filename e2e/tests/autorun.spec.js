// 2026-10-03: runTransform was a debounce rebuilt on every render, so every
// keystroke ran its own transformation 2 s later — 12 keys, 12 requests.
import { test, expect } from "@playwright/test";
import { isolate, trackTransforms, openEditor } from "./helpers.js";

test("a burst of typing runs one transformation, after the pause", async ({ page }) => {
  await isolate(page);
  const sent = trackTransforms(page);
  await openEditor(page);
  await expect(page.locator(".success-box")).toBeVisible({ timeout: 15_000 });
  const before = sent.length;

  // Text at the end of a line of the input XML keeps it well-formed after
  // every keystroke, so the client-side gate lets each state through.
  await page.locator('.cm-content[aria-label="Input XML"] .cm-line').nth(2).click();
  await page.keyboard.press("End");
  const typedAt = Date.now();
  await page.keyboard.type("abcdefghijkl", { delay: 120 });
  await page.waitForTimeout(4_500);

  const burst = sent.slice(before);
  expect(burst, "requests sent for 12 keystrokes").toHaveLength(1);
  // Sent about 2 s after the last key, not after the first.
  expect(burst[0].at - typedAt).toBeGreaterThan(2_500);
  expect(burst[0].body.parameters.input).toContain("abcdefghijkl");
});
