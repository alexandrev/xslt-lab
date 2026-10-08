// Each version runs on its own processor and JVM: XSLTC (1.0), Saxon 9 (2.0),
// Saxon HE 12 (3.0, and 2.0 with trace on). Covers what broke in September:
// generic compile errors in 2.0 and with trace, and a runaway stylesheet that
// pinned a core and pushed the HPA to its maximum.
import { test, expect } from "@playwright/test";
import { transform, stylesheet, BACKEND } from "./helpers.js";

for (const version of ["1.0", "2.0", "3.0"]) {
  for (const trace of version === "1.0" ? [false] : [false, true]) {
    test(`XSLT ${version}${trace ? " with trace" : ""} transforms`, async ({ request }) => {
      const { status, body } = await transform(request, BACKEND, { xslt: stylesheet(version, "<ok/>"), version, trace });
      expect(status, JSON.stringify(body)).toBe(200);
      expect(body.result).toContain("<ok/>");
    });
  }
}

for (const [version, trace] of [["2.0", false], ["2.0", true], ["3.0", true]]) {
  test(`compile errors carry a code and a line (${version}${trace ? ", trace" : ""})`, async ({ request }) => {
    const bad = stylesheet(version, "<xsl:choose><xsl:otherwise/></xsl:choose>");
    const { status, body } = await transform(request, BACKEND, { xslt: bad, version, trace });
    expect(status).toBe(400);
    expect(body.error).not.toContain("Errors were reported during stylesheet compilation");
    expect(body.error).toMatch(/XTSE\d{4}: .*\(line \d+\)/);
  });
}

test("a missing input document is explained, not reported as a parser error", async ({ request }) => {
  const { status, body } = await transform(request, BACKEND, { xslt: stylesheet("2.0"), version: "2.0", input: "" });
  expect(status).toBe(400);
  expect(body.error).toContain("No input XML was provided");
});

test("a runaway stylesheet is stopped in under 10 s and the other versions keep working", async ({ request }) => {
  test.setTimeout(60_000);
  const loop = `<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:template match="/"><xsl:call-template name="f"><xsl:with-param name="n" select="1"/></xsl:call-template></xsl:template>
<xsl:template name="f"><xsl:param name="n"/><xsl:if test="$n &gt; 0"><xsl:call-template name="f"><xsl:with-param name="n" select="$n"/></xsl:call-template></xsl:if></xsl:template>
</xsl:stylesheet>`;
  const started = Date.now();
  const stopped = transform(request, BACKEND, { xslt: loop, version: "3.0" });
  // While it spins, the other processors answer.
  for (const version of ["1.0", "2.0"]) {
    const { status } = await transform(request, BACKEND, { xslt: stylesheet(version), version });
    expect(status).toBe(200);
  }
  const { status, body } = await stopped;
  expect(Date.now() - started).toBeLessThan(10_000);
  expect(status).toBe(400);
  expect(body.error).toContain("stopped after");
  // And 3.0 itself is usable straight away.
  const after = await transform(request, BACKEND, { xslt: stylesheet("3.0"), version: "3.0" });
  expect(after.status).toBe(200);
});
