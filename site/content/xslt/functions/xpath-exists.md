---
title: "exists()"
description: "Returns true if the sequence contains at least one item, and false if it is empty."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "sequence function"
syntax: "exists(sequence)"
tags: ["xslt", "reference", "xslt2", "xpath"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0iaHRtbCIgaW5kZW50PSJ5ZXMiLz4KCiAgPHhzbDp0ZW1wbGF0ZSBtYXRjaD0iL3JlcG9ydCI-CiAgICA8aHRtbD48Ym9keT4KICAgICAgPHhzbDphcHBseS10ZW1wbGF0ZXMgc2VsZWN0PSJzZWN0aW9uIi8-CiAgICA8L2JvZHk-PC9odG1sPgogIDwveHNsOnRlbXBsYXRlPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSJzZWN0aW9uIj4KICAgIDxzZWN0aW9uPgogICAgICA8aDI-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9InRpdGxlIi8-PC9oMj4KICAgICAgPHA-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9ImNvbnRlbnQiLz48L3A-CiAgICAgIDx4c2w6aWYgdGVzdD0iZXhpc3RzKGZvb3Rub3Rlcy9mbikiPgogICAgICAgIDxhc2lkZT4KICAgICAgICAgIDx4c2w6Zm9yLWVhY2ggc2VsZWN0PSJmb290bm90ZXMvZm4iPgogICAgICAgICAgICA8cCBjbGFzcz0iZm4iPjx4c2w6dmFsdWUtb2Ygc2VsZWN0PSIuIi8-PC9wPgogICAgICAgICAgPC94c2w6Zm9yLWVhY2g-CiAgICAgICAgPC9hc2lkZT4KICAgICAgPC94c2w6aWY-CiAgICA8L3NlY3Rpb24-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHJlcG9ydD4KICA8c2VjdGlvbiBpZD0iaW50cm8iPgogICAgPHRpdGxlPkludHJvZHVjdGlvbjwvdGl0bGU-CiAgICA8Y29udGVudD5Tb21lIHRleHQgaGVyZS48L2NvbnRlbnQ-CiAgICA8Zm9vdG5vdGVzPgogICAgICA8Zm4-U291cmNlOiBXaWtpcGVkaWE8L2ZuPgogICAgPC9mb290bm90ZXM-CiAgPC9zZWN0aW9uPgogIDxzZWN0aW9uIGlkPSJib2R5Ij4KICAgIDx0aXRsZT5NYWluIENvbnRlbnQ8L3RpdGxlPgogICAgPGNvbnRlbnQ-Qm9keSB0ZXh0LjwvY29udGVudD4KICA8L3NlY3Rpb24-CjwvcmVwb3J0Pg&version=2.0"
---

## Description

`exists()` tests whether a sequence is non-empty. It returns `true` as soon as it finds at least one item, making it potentially more efficient than `count($seq) gt 0` because it can stop evaluation early. It is the complement of `empty()`.

While XSLT 1.0 used boolean coercion of node sets (e.g., `if ($nodes)`) to test for existence, `exists()` is the explicit and type-safe XPath 2.0 way to do the same.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sequence` | item()* | Yes | The sequence to test. |

## Return value

`xs:boolean` — `true` if the sequence contains one or more items, `false` if it is empty.

## Examples

### Conditional output based on element existence

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<report>
  <section id="intro">
    <title>Introduction</title>
    <content>Some text here.</content>
    <footnotes>
      <fn>Source: Wikipedia</fn>
    </footnotes>
  </section>
  <section id="body">
    <title>Main Content</title>
    <content>Body text.</content>
  </section>
</report>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" indent="yes"/>

  <xsl:template match="/report">
    <html><body>
      <xsl:apply-templates select="section"/>
    </body></html>
  </xsl:template>

  <xsl:template match="section">
    <section>
      <h2><xsl:value-of select="title"/></h2>
      <p><xsl:value-of select="content"/></p>
      <xsl:if test="exists(footnotes/fn)">
        <aside>
          <xsl:for-each select="footnotes/fn">
            <p class="fn"><xsl:value-of select="."/></p>
          </xsl:for-each>
        </aside>
      </xsl:if>
    </section>
  </xsl:template>
</xsl:stylesheet>
```

**Output:** The intro section renders an `<aside>` with footnotes; the body section does not.

### Checking whether a variable holds a result

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/inventory">
    <xsl:variable name="out-of-stock" select="item[@qty = 0]"/>
    <xsl:if test="exists($out-of-stock)">
      <alert>
        <xsl:value-of select="count($out-of-stock)"/> item(s) out of stock.
      </alert>
    </xsl:if>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- `exists($seq)` is equivalent to `count($seq) gt 0` but preferred for readability and potential performance benefits.
- In XPath 1.0, existence was tested by relying on the boolean value of a node-set: `if ($nodes)`. In XPath 2.0, `exists()` makes the intent explicit and works correctly for all sequence types.
- Do not confuse `exists()` with `not(empty($seq))` — they are logically identical, but `exists()` is more readable.
- For constraining cardinality rather than just testing, see `zero-or-one()`, `one-or-more()`, and `exactly-one()`.

## See also

- [empty()](../xpath-empty)
- [count()](../xpath-count)
- [one-or-more()](../xpath-one-or-more)
