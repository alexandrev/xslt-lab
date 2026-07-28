import { describe, it, expect } from "vitest";
import { reviewWorkspace, unprefixedNameTests } from "./reviewRules";

const NS = "http://example.com/orders";
const INPUT_NS = `<orders xmlns="${NS}"><order id="1"/></orders>`;
const INPUT_PLAIN = `<orders><order id="1"/></orders>`;

const sheet = (attrs, body) =>
  `<xsl:stylesheet ${attrs} xmlns:xsl="http://www.w3.org/1999/XSL/Transform">${body}</xsl:stylesheet>`;

const find = (findings, id) => findings.find((f) => f.id === id);

describe("unprefixedNameTests", () => {
  it("picks up bare element names", () => {
    expect(unprefixedNameTests("orders/order")).toEqual(["orders", "order"]);
  });
  it("ignores prefixed names", () => {
    expect(unprefixedNameTests("ns:orders/ns:order")).toEqual([]);
  });
  it("ignores functions, axes, variables and wildcards", () => {
    expect(unprefixedNameTests("count(child::*[. = $x])")).toEqual([]);
    expect(unprefixedNameTests("normalize-space(@id)")).toEqual([]);
  });
  it("ignores operators and node tests", () => {
    expect(unprefixedNameTests("a[b and c]")).toEqual(["a", "b", "c"]);
    expect(unprefixedNameTests("text()")).toEqual([]);
    expect(unprefixedNameTests("node()")).toEqual([]);
  });
  it("ignores names inside string literals", () => {
    expect(unprefixedNameTests("@type = 'order'")).toEqual([]);
  });
  it("ignores the root pattern and attributes", () => {
    expect(unprefixedNameTests("/")).toEqual([]);
    expect(unprefixedNameTests("@id")).toEqual([]);
  });
});

describe("default namespace mismatch", () => {
  it("flags unprefixed patterns when the input is namespaced", () => {
    const f = find(
      reviewWorkspace({
        xslt: sheet('version="2.0"', '<xsl:template match="orders/order"/>'),
        inputXml: INPUT_NS,
        version: "2.0",
      }),
      "default-namespace-mismatch",
    );
    expect(f).toBeTruthy();
    expect(f.severity).toBe("high");
    expect(f.fix).toContain("xpath-default-namespace");
  });

  it("tells 1.0 users to use a prefix, since xpath-default-namespace is 2.0+", () => {
    const f = find(
      reviewWorkspace({
        xslt: sheet('version="1.0"', '<xsl:template match="orders"/>'),
        inputXml: INPUT_NS,
        version: "1.0",
      }),
      "default-namespace-mismatch",
    );
    expect(f.fix).toContain("xmlns:ns=");
    expect(f.fix).not.toContain("xpath-default-namespace=");
  });

  // The rest are the false-positive guards: staying silent matters more here
  // than catching every case.
  it("stays silent when the input has no namespace", () => {
    expect(
      reviewWorkspace({
        xslt: sheet('version="2.0"', '<xsl:template match="orders/order"/>'),
        inputXml: INPUT_PLAIN,
        version: "2.0",
      }),
    ).toEqual([]);
  });

  it("stays silent when xpath-default-namespace already covers it", () => {
    expect(
      find(
        reviewWorkspace({
          xslt: sheet(
            `version="2.0" xpath-default-namespace="${NS}"`,
            '<xsl:template match="orders/order"/>',
          ),
          inputXml: INPUT_NS,
          version: "2.0",
        }),
        "default-namespace-mismatch",
      ),
    ).toBeUndefined();
  });

  it("stays silent when a bound prefix is actually used", () => {
    expect(
      find(
        reviewWorkspace({
          xslt: sheet(
            `version="2.0" xmlns:o="${NS}"`,
            '<xsl:template match="o:orders/o:order"/>',
          ),
          inputXml: INPUT_NS,
          version: "2.0",
        }),
        "default-namespace-mismatch",
      ),
    ).toBeUndefined();
  });

  it("stays silent when the only patterns are root or attribute tests", () => {
    expect(
      find(
        reviewWorkspace({
          xslt: sheet('version="2.0"', '<xsl:template match="/"/>'),
          inputXml: INPUT_NS,
          version: "2.0",
        }),
        "default-namespace-mismatch",
      ),
    ).toBeUndefined();
  });

  it("stays silent when there is no input document to compare against", () => {
    expect(
      reviewWorkspace({
        xslt: sheet('version="2.0"', '<xsl:template match="orders"/>'),
        inputXml: "",
        version: "2.0",
      }),
    ).toEqual([]);
  });

  it("stays silent when the input XML is not well-formed", () => {
    expect(
      reviewWorkspace({
        xslt: sheet('version="2.0"', '<xsl:template match="orders"/>'),
        inputXml: "<orders><order></orders>",
        version: "2.0",
      }),
    ).toEqual([]);
  });
});

describe("version mismatch", () => {
  it("flags a 1.0 stylesheet run as 3.0", () => {
    const f = find(
      reviewWorkspace({
        xslt: sheet('version="1.0"', '<xsl:template match="/"/>'),
        inputXml: INPUT_PLAIN,
        version: "3.0",
      }),
      "version-mismatch",
    );
    expect(f).toBeTruthy();
    expect(f.detail).toContain("1.0");
  });

  it("flags a 3.0 stylesheet run as 1.0 as the more serious direction", () => {
    const f = find(
      reviewWorkspace({
        xslt: sheet('version="3.0"', '<xsl:template match="/"/>'),
        inputXml: INPUT_PLAIN,
        version: "1.0",
      }),
      "version-mismatch",
    );
    expect(f.severity).toBe("high");
    expect(f.detail).toContain("forwards-compatible");
  });

  it("stays silent when the versions agree", () => {
    expect(
      find(
        reviewWorkspace({
          xslt: sheet('version="2.0"', '<xsl:template match="/"/>'),
          inputXml: INPUT_PLAIN,
          version: "2.0",
        }),
        "version-mismatch",
      ),
    ).toBeUndefined();
  });
});

describe("reviewWorkspace", () => {
  it("returns nothing when the stylesheet does not parse", () => {
    expect(reviewWorkspace({ xslt: "<xsl:stylesheet", inputXml: INPUT_NS, version: "2.0" })).toEqual([]);
  });
  it("returns nothing for an empty workspace", () => {
    expect(reviewWorkspace({ xslt: "", inputXml: "", version: "1.0" })).toEqual([]);
  });
});
