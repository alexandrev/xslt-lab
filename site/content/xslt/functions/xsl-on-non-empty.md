---
title: "xsl:on-non-empty"
description: "Generates content only when the sibling sequence constructor produces at least one node, allowing conditional headers or wrappers without extra variables."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "element"
syntax: "<xsl:on-non-empty>...</xsl:on-non-empty>"
tags: ["xslt", "reference", "xslt3"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSI-CiAgPHhzbDpvdXRwdXQgbWV0aG9kPSJodG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvcmVwb3J0Ij4KICAgIDxkaXY-CiAgICAgIDwhLS0gSGVhZGVyIGFwcGVhcnMgb25seSBpZiB0aGVyZSBhcmUgZXJyb3JzIC0tPgogICAgICA8eHNsOm9uLW5vbi1lbXB0eT4KICAgICAgICA8aDI-RXJyb3JzIGZvdW5kPC9oMj4KICAgICAgPC94c2w6b24tbm9uLWVtcHR5PgogICAgICA8eHNsOmFwcGx5LXRlbXBsYXRlcyBzZWxlY3Q9ImVycm9ycy9lcnJvciIvPgogICAgPC9kaXY-CiAgPC94c2w6dGVtcGxhdGU-CgogIDx4c2w6dGVtcGxhdGUgbWF0Y2g9ImVycm9yIj4KICAgIDxwIGNsYXNzPSJlcnJvciI-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9Ii4iLz48L3A-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHJlcG9ydD4KICA8ZXJyb3JzPgogICAgPGVycm9yPkRpc2sgcXVvdGEgZXhjZWVkZWQ8L2Vycm9yPgogICAgPGVycm9yPk5ldHdvcmsgdGltZW91dDwvZXJyb3I-CiAgPC9lcnJvcnM-CjwvcmVwb3J0Pg&version=3.0"
---

## Description

`xsl:on-non-empty` is the complement of `xsl:on-empty`. Its content is output only when the other instructions in the same sequence constructor have produced at least one node. If no nodes were produced, `xsl:on-non-empty` is silently suppressed.

The classic use case is a conditional heading or section wrapper that should only appear when there is actual content beneath it. Before XSLT 3.0 this required storing the content in a variable, testing whether it was non-empty, and then wrapping it — three steps. With `xsl:on-non-empty` you can express the heading inline, adjacent to the content that conditions it.

Like `xsl:on-empty`, this element is evaluated after its preceding siblings in the same sequence constructor have been processed. It considers any node — including whitespace text nodes — as "non-empty" content.

The three streaming-content elements (`xsl:on-empty`, `xsl:on-non-empty`, and `xsl:where-populated`) are often used together. `xsl:on-non-empty` belongs at the *start* of a sequence when the conditional content (such as a heading) must appear *before* the main content it guards.

## Attributes

`xsl:on-non-empty` has no element-specific attributes. It contains a sequence constructor.

## Examples

### Conditional section header before content

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<report>
  <errors>
    <error>Disk quota exceeded</error>
    <error>Network timeout</error>
  </errors>
</report>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" indent="yes"/>

  <xsl:template match="/report">
    <div>
      <!-- Header appears only if there are errors -->
      <xsl:on-non-empty>
        <h2>Errors found</h2>
      </xsl:on-non-empty>
      <xsl:apply-templates select="errors/error"/>
    </div>
  </xsl:template>

  <xsl:template match="error">
    <p class="error"><xsl:value-of select="."/></p>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```html
<div>
  <h2>Errors found</h2>
  <p class="error">Disk quota exceeded</p>
  <p class="error">Network timeout</p>
</div>
```

### Combined on-non-empty and on-empty

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/inventory">
    <stock>
      <xsl:on-non-empty>
        <summary>Items in stock:</summary>
      </xsl:on-non-empty>
      <xsl:apply-templates select="item[@qty > 0]"/>
      <xsl:on-empty>
        <summary>No items currently in stock.</summary>
      </xsl:on-empty>
    </stock>
  </xsl:template>

  <xsl:template match="item">
    <entry qty="{@qty}"><xsl:value-of select="@name"/></entry>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- `xsl:on-non-empty` must be evaluated by the processor after the preceding siblings. Processors that buffer content do so internally; the order in the output is still as written.
- Like `xsl:on-empty`, it evaluates the *preceding sibling* nodes in the same sequence constructor only — not the wider result tree.
- This element is streamable and works well inside streaming templates.
- Whitespace-only text nodes produced by sibling instructions are counted as non-empty content.

## See also

- [xsl:on-empty](../xsl-on-empty)
- [xsl:where-populated](../xsl-where-populated)
