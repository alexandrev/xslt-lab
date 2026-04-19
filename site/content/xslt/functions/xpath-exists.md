---
title: "exists()"
description: "Returns true if the sequence contains at least one item, and false if it is empty."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "sequence function"
syntax: "exists(sequence)"
tags: ["xslt", "reference", "xslt2", "xpath"]
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
