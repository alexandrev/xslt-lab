---
title: "Chrome is removing XSLT on November 17, 2026: what breaks and what to do"
description: "Chrome 158 drops native XSLT — XSLTProcessor and xml-stylesheet stop working. Who is actually affected, honest pros and cons of the WASM polyfill vs server-side migration paths, and how to test your stylesheets outside the browser today."
date: 2026-08-14T00:00:00Z
tags: ["xslt", "chrome", "browser", "deprecation", "migration"]
---

**Quick answer:** Chrome removes built-in XSLT support in **version 158, shipping November 17, 2026**, with deprecation warnings already appearing since Chrome 142–143 ([official announcement](https://developer.chrome.com/docs/web-platform/deprecating-xslt)). Both the `XSLTProcessor` JavaScript API and `<?xml-stylesheet?>` processing instructions stop working. Firefox and WebKit have signalled they will follow. Your migration options are a WASM polyfill, server-side transformation, or build-time precompilation — and you can verify today whether your stylesheets run correctly outside the browser.

## What exactly is being removed

Two things, both part of the same removal:

1. **`XSLTProcessor`** — the JavaScript API (`importStylesheet()`, `transformToFragment()`, `transformToDocument()`). Any client-side code calling it throws once the API is gone.
2. **`<?xml-stylesheet type="text/xsl" ...?>`** — the processing instruction that made the browser auto-render an XML document (RSS feeds, sitemaps, DocBook-ish documentation, legacy intranet reports) through a stylesheet. Those URLs will render as raw XML.

## Why, and why now

Chrome's stated numbers: XSLT appears in roughly **0.02% of page loads**, and the `xml-stylesheet` processing instruction in **under 0.001%**. The driving reason is security, not usage: browsers ship XSLT via **libxslt**, a minimally-maintained C library with a history of memory-safety vulnerabilities — [CVE-2025-7425](https://nvd.nist.gov/vuln/detail/CVE-2025-7425) (use-after-free) and [CVE-2022-22834](https://nvd.nist.gov/vuln/detail/CVE-2022-22834) among them. Maintaining an interpreter for a 1999-era spec in the browser's most attacked process stopped being worth it. Since Firefox and WebKit have indicated the same direction, "wait for another browser" is not a plan.

Worth remembering: the browsers only ever implemented **XSLT 1.0**. Nothing about 2.0/3.0 changes here, because it was never in the browser to begin with.

## Who is actually affected

- **Sites rendering XML directly with `xml-stylesheet`** — styled RSS/Atom feeds, sitemap.xml viewers, legacy documentation systems. This is the biggest visible breakage.
- **Web apps calling `XSLTProcessor`** — often deep inside old admin panels and enterprise frontends that nobody has touched in years. `grep -r XSLTProcessor` your codebase.
- **Not affected:** anything doing XSLT server-side (Java/Saxon, .NET, PHP, integration middleware). That is where most production XSLT already lives.

## Your options, honestly

| Option | Pros | Cons |
|---|---|---|
| **WASM polyfill** (libxslt compiled to WebAssembly, what Chrome recommends for drop-in continuity) | Minimal code change; keeps rendering client-side; works for `XSLTProcessor` call sites | Adds a non-trivial WASM payload to first load; you now ship and patch libxslt yourself — the same library the browsers dropped for security reasons; PI-based auto-rendering needs extra glue |
| **Server-side transformation** | Real processor (Saxon opens up XSLT 2.0/3.0); output is plain HTML so nothing depends on browser support ever again; testable in CI | Needs a backend or edge function; XML URLs must be routed/proxied through it |
| **Precompile at build time** | Zero runtime cost; ideal when the XML is static (docs, feeds with static templates) | Only works for content known at build time; dynamic XML still needs one of the above |

Our take: the polyfill is a reasonable *bridge* for a large `XSLTProcessor` codebase you cannot rework before November. As a destination, server-side or build-time wins — you swap a deprecated browser dependency for a supported processor instead of vendoring the deprecated one.

## Test your stylesheets outside the browser — today

Before choosing, find out whether your stylesheets even behave the same outside the browser. Paste one into [XSLT Playground](https://xsltplayground.com/) together with a sample XML input and run it with **version = 1.0**. That executes a JAXP (Xalan-class) XSLT 1.0 processor — same spec level and very close semantics to what the browser did, so differences surface immediately (typical ones: reliance on browser-specific output quirks, `document()` calls resolving against URLs, disable-output-escaping).

Here is a browser-typical stylesheet — XML rendered as an HTML table — run exactly that way:

Input XML:

```xml
<catalog>
  <book>
    <title>XSLT Cookbook</title>
    <price>39.95</price>
  </book>
  <book>
    <title>XPath Essentials</title>
    <price>24.50</price>
  </book>
</catalog>
```

Stylesheet (run with **version 1.0**):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
  <xsl:output method="html" indent="yes"/>

  <xsl:template match="/catalog">
    <table>
      <tr><th>Title</th><th>Price</th></tr>
      <xsl:for-each select="book">
        <tr>
          <td><xsl:value-of select="title"/></td>
          <td><xsl:value-of select="price"/></td>
        </tr>
      </xsl:for-each>
    </table>
  </xsl:template>
</xsl:stylesheet>
```

Output (exactly as returned):

```html
<table>
    <tr>
        <th>Title</th><th>Price</th>
    </tr>
    <tr>
        <td>XSLT Cookbook</td><td>39.95</td>
    </tr>
    <tr>
        <td>XPath Essentials</td><td>24.50</td>
    </tr>
</table>
```

If it runs clean at 1.0, your server-side migration is low-risk — and once you are server-side you can optionally move to 2.0/3.0 and simplify the stylesheet (grouping, regex, sequences). If it errors, the [Saxon error triage guide](https://xsltplayground.com/blog/posts/xslt-common-errors/) maps each code to its fix.

## Related

The browser removal lands the same year the venerable FreeFormatter site [shut down](https://xsltplayground.com/blog/posts/freeformatter-xsl-transformer-alternative/) — client-side and ad-supported XSLT are both winding down, while server-side XSLT keeps running payment migrations ([ISO 20022](https://xsltplayground.com/blog/posts/iso-20022-xslt-transformations/)) and e-invoicing validation ([Peppol/EN 16931](https://xsltplayground.com/blog/posts/validate-peppol-schematron-xslt-online/)) at scale. XSLT is not dying; it is relocating.

Test your stylesheets now: **[xsltplayground.com](https://xsltplayground.com/)**.
