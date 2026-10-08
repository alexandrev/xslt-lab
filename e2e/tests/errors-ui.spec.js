// Clarity's dead-click heatmap: people clicked error messages expecting to be
// taken to the line. An error that names a stylesheet line now jumps there.
import { test, expect } from "@playwright/test";
import { isolate, b64url } from "./helpers.js";

test("clicking an error selects the stylesheet line it names", async ({ page }) => {
  await isolate(page);
  const xslt = `<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:template match="/">
  <xsl:value-of select="$nope"/>
</xsl:template>
</xsl:stylesheet>`;
  await page.goto(`/?version=2.0&xslt=${b64url(xslt)}&xml=${b64url("<a/>")}`);
  const error = page.locator(".error-text--jump").first();
  await expect(error).toBeVisible({ timeout: 15_000 });
  const line = Number((await error.locator(".error-jump-line").textContent()).replace(/\D/g, ""));
  expect(line).toBeGreaterThan(0);
  await error.click();
  const active = page.locator(".xslt-editor-wrap .cm-activeLine");
  await expect(active).toContainText("$nope");
});
