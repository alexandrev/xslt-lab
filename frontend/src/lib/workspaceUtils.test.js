import { describe, it, expect } from "vitest";
import {
  addParams,
  extractParamNames,
  injectParamBlock,
  parseErrorLines,
  setStylesheetVersion,
  stripParamBlock,
} from "./workspaceUtils";

const SAMPLE_STYLESHEET = `<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:param name="foo"/>
<xsl:param name="bar"/>
<xsl:template match="/">
<root/>
</xsl:template>
</xsl:stylesheet>`;

describe("workspace utils", () => {
  it("parses error lines with warning/error prefixes", () => {
    const lines = parseErrorLines("intro\nWarning test 1\nError details\n");
    expect(lines).toEqual(["intro", "Warning test 1", "Error details"]);
  });

  it("strips injected param blocks and inline params", () => {
    const injected = injectParamBlock(SAMPLE_STYLESHEET, [
      { name: "alpha" },
      { name: "beta" },
    ]);
    const cleaned = stripParamBlock(injected);
    expect(cleaned).not.toContain("PARAMS_START");
    expect(cleaned).not.toContain("alpha");
    expect(cleaned).not.toContain("beta");
    expect(cleaned).not.toMatch(/<xsl:param/);
  });

  it("keeps scoped params inside functions", () => {
    const withFunctionParam = `<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:f="urn:test">
<xsl:template match="/"><out/></xsl:template>
<xsl:function name="f:echo" as="xs:string">
  <xsl:param name="val"/>
  <xsl:sequence select="$val"/>
</xsl:function>
</xsl:stylesheet>`;
    const cleaned = stripParamBlock(withFunctionParam);
    expect(cleaned).toContain(`<xsl:param name="val"/>`);
  });

  it("extracts params from existing definitions", () => {
    expect(extractParamNames(SAMPLE_STYLESHEET).sort()).toEqual(["bar", "foo"]);
  });

  it("ignores template-scoped params", () => {
    const withLocalParam = `<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:template name="local"><xsl:param name="expr"/><xsl:value-of select="$expr"/></xsl:template>
</xsl:stylesheet>`;
    expect(extractParamNames(withLocalParam)).toEqual([]);
  });

  it("adds new params discovered in xslt", () => {
    const tab = {
      params: [{ name: "foo", value: "value", open: false }],
    };
    const params = addParams(SAMPLE_STYLESHEET, tab);
    expect(params).toHaveLength(2);
    expect(params.some((p) => p.name === "bar")).toBe(true);
  });

  it("updates or injects stylesheet version attribute", () => {
    const noVersion = SAMPLE_STYLESHEET.replace(`version="1.0"`, "");
    expect(setStylesheetVersion(noVersion, "2.0")).toContain(`version="2.0"`);
    expect(setStylesheetVersion(SAMPLE_STYLESHEET, "3.0")).toContain(
      `version="3.0"`,
    );
  });
});
