import { describe, it, expect } from "vitest";
import {
  addParams,
  detectVersionUpgradeHint,
  detectTooNewSyntax,
  findErrorReference,
  needsStylesheetReset,
  checkWellFormed,
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

const STYLESHEET_WITH_IF =
  '<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">' +
  '<xsl:template match="/">' +
  `<xsl:element name="{local-name()}" namespace="{if (namespace-uri() != '') then $ns else ''}"/>` +
  "</xsl:template></xsl:stylesheet>";

describe("detectVersionUpgradeHint", () => {
  it("flags a 2.0 function used in 1.0 (Xalan funcall form)", () => {
    const err = "Error checking type of the expression 'funcall(current-date, [])'.";
    expect(detectVersionUpgradeHint(err, "1.0")).toEqual({ func: "current-date", version: "2.0" });
  });
  it("flags tokenize() called in 1.0", () => {
    expect(detectVersionUpgradeHint("Could not find function: tokenize(...)", "1.0")).toEqual({
      func: "tokenize",
      version: "2.0",
    });
  });
  it("flags map:/array: (3.0) when in 2.0", () => {
    expect(detectVersionUpgradeHint("XPST0017 map:merge(...) is not defined", "2.0")).toEqual({
      func: "map/array",
      version: "3.0",
    });
  });
  it("returns null when the function is available in the current version", () => {
    expect(detectVersionUpgradeHint("funcall(tokenize, [])", "2.0")).toBeNull();
  });
  it("does not false-positive on a plain word without a call shape", () => {
    expect(detectVersionUpgradeHint("the file exists on disk but is empty", "1.0")).toBeNull();
  });
  it("returns null for empty input", () => {
    expect(detectVersionUpgradeHint("", "1.0")).toBeNull();
    expect(detectVersionUpgradeHint("tokenize(", "")).toBeNull();
  });
  it("falls back to the stylesheet when the error names nothing", () => {
    // The real case: one person, 29 attempts, and all the processor said was
    // "Error parsing XPath expression 'null'".
    const xslt = STYLESHEET_WITH_IF;
    expect(
      detectVersionUpgradeHint("line 12: Error parsing XPath expression 'null'.", "1.0", xslt),
    ).toEqual({ func: "if … then … else", label: "if … then … else", version: "2.0" });
  });
});

describe("detectTooNewSyntax", () => {
  it("finds 2.0 syntax inside an attribute value template", () => {
    expect(detectTooNewSyntax(STYLESHEET_WITH_IF, "1.0")).toEqual({
      func: "if … then … else",
      label: "if … then … else",
      version: "2.0",
    });
  });

  it.each([
    ['<xsl:value-of select="for $i in item return $i"/>', "for $x in … return", "2.0"],
    ['<xsl:if test="some $i in item satisfies $i > 1"/>', "some/every … satisfies", "2.0"],
    ['<xsl:value-of select="@a instance of xs:date"/>', "instance of", "2.0"],
    ['<xsl:value-of select="@a castable as xs:date"/>', "castable as", "2.0"],
    ['<xsl:value-of select="@a => upper-case()"/>', "=> (arrow operator)", "3.0"],
  ])("flags %s", (body, label, version) => {
    const xslt =
      '<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">' +
      `<xsl:template match="/">${body}</xsl:template></xsl:stylesheet>`;
    expect(detectTooNewSyntax(xslt, "1.0")).toMatchObject({ label, version });
  });

  it("stays quiet when the syntax is available in the running version", () => {
    expect(detectTooNewSyntax(STYLESHEET_WITH_IF, "2.0")).toBeNull();
    expect(detectTooNewSyntax(STYLESHEET_WITH_IF, "3.0")).toBeNull();
  });

  it("does not read comments or literal output as XPath", () => {
    // Only expression attributes and {…} count; text is text.
    const xslt =
      '<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">' +
      "<!-- if (a) then b else c -->" +
      '<xsl:template match="/"><p>if (a) then b else c</p></xsl:template>' +
      "</xsl:stylesheet>";
    expect(detectTooNewSyntax(xslt, "1.0")).toBeNull();
  });

  it("stays quiet on ordinary 1.0 stylesheets", () => {
    const xslt =
      '<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">' +
      '<xsl:template match="/"><out class="{@id}"><xsl:value-of select="count(//item)"/></out></xsl:template>' +
      "</xsl:stylesheet>";
    expect(detectTooNewSyntax(xslt, "1.0")).toBeNull();
  });

  it("says nothing about what it cannot parse", () => {
    expect(detectTooNewSyntax("<xsl:stylesheet", "1.0")).toBeNull();
    expect(detectTooNewSyntax("", "1.0")).toBeNull();
  });
});

describe("findErrorReference", () => {
  it("links a documented Saxon code to its reference page", () => {
    expect(findErrorReference("XPST0017: function foo#1 is not defined")).toEqual({
      code: "XPST0017",
      url: "https://xsltplayground.com/blog/xslt/errors/xpst0017/",
    });
  });
  it("links prose well-formedness errors that have a page", () => {
    const r = findErrorReference("Content is not allowed in prolog.");
    expect(r.url).toBe("https://xsltplayground.com/blog/xslt/errors/content-not-allowed-in-prolog/");
  });
  it("returns null for codes without a page", () => {
    expect(findErrorReference("XPST9999: made up")).toBeNull();
  });
  it("returns null for empty input", () => {
    expect(findErrorReference("")).toBeNull();
  });
});

describe("needsStylesheetReset", () => {
  it("is true for an emptied editor", () => {
    expect(needsStylesheetReset("")).toBe(true);
    expect(needsStylesheetReset("   \n ")).toBe(true);
  });
  it("is true for a half-deleted, malformed stylesheet", () => {
    expect(needsStylesheetReset('<xsl:stylesheet version="1.0"')).toBe(true);
  });
  it("is false for a well-formed stylesheet", () => {
    expect(
      needsStylesheetReset(
        '<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"><xsl:template match="/"/></xsl:stylesheet>',
      ),
    ).toBe(false);
  });
});

describe("checkWellFormed", () => {
  it("accepts a well-formed document", () => {
    expect(checkWellFormed("<root><a/></root>")).toBeNull();
  });
  it("reports a truncated document — the half-typed case", () => {
    const r = checkWellFormed("<root><a>");
    expect(r).not.toBeNull();
    expect(typeof r.message).toBe("string");
  });
  it("reports an unterminated attribute — literally mid-keystroke", () => {
    expect(checkWellFormed('<xsl:template match="/')).not.toBeNull();
  });
  it("stays silent on empty input, which is legitimate", () => {
    expect(checkWellFormed("")).toBeNull();
    expect(checkWellFormed("   ")).toBeNull();
  });
});
