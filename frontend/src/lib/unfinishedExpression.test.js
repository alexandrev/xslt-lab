import { describe, it, expect } from "vitest";
import {
  describeUnfinished,
  findUnfinishedExpression,
} from "./unfinishedExpression";
import { TEMPLATES, STARTER_STYLESHEET } from "./templates";

const wrap = (body, version = "2.0") =>
  `<xsl:stylesheet version="${version}" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">${body}</xsl:stylesheet>`;

describe("describeUnfinished — expressions that are still being typed", () => {
  // Every one of these came off a day of production logs.
  it.each([
    ["", "is empty"],
    ["   ", "is empty"],
    ["/Shop/Category/", 'stops at "/"'],
    ["/Shop/Category/@", 'stops at "@"'],
    ["current()/", 'stops at "/"'],
    ["../", 'stops at "/"'],
    ["..//", 'stops at "//"'],
    ["./@", 'stops at "@"'],
    ["current()/..[", 'has a [ that is never closed'],
    ["Book[@CategoryId =  ", "has a [ that is never closed"],
    ["concat(@a,", "has a ( that is never closed"],
    ["@Name = 'Programm", "has a quote that is still open"],
    ["$total +", 'stops at "+"'],
    ["@a =", 'stops at "="'],
    ["item[@id = $", 'has a [ that is never closed'],
    ["1 to", 'stops at "to"'],
    ["@a and", 'stops at "and"'],
  ])("flags %j", (value, reason) => {
    expect(describeUnfinished(value)).toBe(reason);
  });
});

describe("describeUnfinished — expressions it must leave alone", () => {
  it.each([
    "/", // the root pattern, not an abandoned path
    ".",
    "..",
    "*",
    "@*",
    "@id",
    "node()",
    "text()",
    "child::*",
    "//item",
    "/Shop/Category",
    "$total",
    "count(item)",
    "concat(@a, '-', @b)",
    "item[@id = '3']",
    "item[position() > 1]",
    "current()/..",
    "1 to 5",
    "@a and @b",
    "and", // a path selecting <and> children is legal
    "or",
    "to",
    "@price * 1.21",
    "-1",
    "@a - 1",
    "substring(@a, 1, 2)",
    "if ($a) then 'x' else 'y'",
    "for $i in item return $i",
    "@a != @b",
    "'a literal with a ( in it'",
    "'unbalanced ] inside a string'",
    "item[1]/name",
    "xs:date('2026-01-01')",
    "map{'a': 1}",
  ])("stays quiet on %j", (value) => {
    expect(describeUnfinished(value)).toBeNull();
  });

  it("leaves a genuinely wrong expression to the processor", () => {
    // Closing more than was opened is a mistake, not a half-finished edit: the
    // real error message is more useful than us guessing.
    expect(describeUnfinished("item)")).toBeNull();
    expect(describeUnfinished("item]")).toBeNull();
  });
});

describe("findUnfinishedExpression", () => {
  it("catches the attribute that is not there yet", () => {
    // "Required attribute 'select' is missing" was the single most common
    // error in production: 65 hits on one line in 24 hours.
    expect(
      findUnfinishedExpression(
        wrap(`<xsl:template match="/"><xsl:value-of/></xsl:template>`),
      ).message,
    ).toBe("<xsl:value-of> has no select expression yet");

    expect(
      findUnfinishedExpression(
        wrap(`<xsl:template match="/"><xsl:if>x</xsl:if></xsl:template>`),
      ).message,
    ).toBe("<xsl:if> has no test expression yet");
  });

  it("allows a sequence constructor in place of value-of/@select", () => {
    expect(
      findUnfinishedExpression(
        wrap(
          `<xsl:template match="/"><xsl:value-of><xsl:sequence select="1"/></xsl:value-of></xsl:template>`,
        ),
      ),
    ).toBeNull();
  });

  it("names the attribute and the element it is on", () => {
    const found = findUnfinishedExpression(
      wrap(`<xsl:template match="/"><xsl:for-each select="/Shop/Category/"/></xsl:template>`),
    );
    expect(found.message).toBe(
      'select="/Shop/Category/" on <xsl:for-each> stops at "/"',
    );
  });

  it("ignores attributes that are not expressions", () => {
    expect(
      findUnfinishedExpression(
        wrap(`<xsl:template match="/"><xsl:element name="a-"/></xsl:template>`),
      ),
    ).toBeNull();
  });

  it("says nothing about a document that does not parse", () => {
    // That is the well-formedness gate's job, and it reports it better.
    expect(findUnfinishedExpression(`<xsl:stylesheet><xsl:template`)).toBeNull();
  });

  it("says nothing about an empty editor", () => {
    expect(findUnfinishedExpression("")).toBeNull();
    expect(findUnfinishedExpression("   ")).toBeNull();
  });

  it("passes every stylesheet the app itself ships", () => {
    // The strongest guard against a false positive: if the gate would hold back
    // the starter document or any gallery template, it is wrong.
    expect(findUnfinishedExpression(STARTER_STYLESHEET)).toBeNull();
    for (const template of TEMPLATES) {
      expect(
        findUnfinishedExpression(template.xslt),
        `template ${template.id} must run`,
      ).toBeNull();
    }
  });
});

describe("cost", () => {
  it("skips a stylesheet too large to have been typed", () => {
    const filler = "<xsl:comment>x</xsl:comment>".repeat(3000);
    const big = wrap(
      `${filler}<xsl:template match="/"><xsl:value-of select="/a/"/></xsl:template>`,
    );
    expect(big.length).toBeGreaterThan(64 * 1024);
    expect(findUnfinishedExpression(big)).toBeNull();
  });
});
