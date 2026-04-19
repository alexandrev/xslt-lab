---
title: "xsl:fork"
description: "Processes a streamed sequence in multiple independent branches simultaneously, enabling multiple aggregations in a single pass over a large document."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "element"
syntax: "<xsl:fork>...</xsl:fork>"
tags: ["xslt", "reference", "xslt3"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczp4cz0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnBhcmFtIG5hbWU9InNvdXJjZS11cmkiIHNlbGVjdD0iJ3RyYW5zYWN0aW9ucy54bWwnIi8-CgogIDx4c2w6dGVtcGxhdGUgbmFtZT0ieHNsOmluaXRpYWwtdGVtcGxhdGUiPgogICAgPHhzbDpzdHJlYW0gaHJlZj0ieyRzb3VyY2UtdXJpfSI-CiAgICAgIDx4c2w6dmFyaWFibGUgbmFtZT0ic3RhdHMiPgogICAgICAgIDx4c2w6Zm9yaz4KICAgICAgICAgIDx4c2w6c2VxdWVuY2Ugc2VsZWN0PSJjb3VudCgvL3RyYW5zYWN0aW9uKSIvPgogICAgICAgICAgPHhzbDpzZXF1ZW5jZSBzZWxlY3Q9InN1bSgvL3RyYW5zYWN0aW9uL0BhbW91bnQpIi8-CiAgICAgICAgPC94c2w6Zm9yaz4KICAgICAgPC94c2w6dmFyaWFibGU-CiAgICAgIDxzdW1tYXJ5PgogICAgICAgIDxjb3VudD48eHNsOnZhbHVlLW9mIHNlbGVjdD0iJHN0YXRzWzFdIi8-PC9jb3VudD4KICAgICAgICA8dG90YWw-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9IiRzdGF0c1syXSIvPjwvdG90YWw-CiAgICAgIDwvc3VtbWFyeT4KICAgIDwveHNsOnN0cmVhbT4KICA8L3hzbDp0ZW1wbGF0ZT4KPC94c2w6c3R5bGVzaGVldD4&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHJvb3QvPg&version=3.0"
---

## Description

`xsl:fork` solves a fundamental streaming constraint: you can only read a stream once. If you need to compute two different aggregations (say, a count and a sum) over the same streaming input, you would normally need two passes — but streaming prohibits that. `xsl:fork` allows both operations to happen in a *single pass* by running multiple sequence constructors over the same streamed input simultaneously.

Each direct child sequence constructor of `xsl:fork` is evaluated independently against the same input. The results of all branches are concatenated in document order. Branches must be individually streamable — they cannot share state with each other except via accumulators.

`xsl:fork` is only meaningful in a streaming context. Outside streaming it works but is equivalent to simply writing the branches sequentially. The real value is inside `xsl:stream` or inside a streamable template where the input can only be consumed once.

A common pattern is `xsl:fork` containing two or more `xsl:sequence` children, each with a streamable `select` expression (such as `count(//element)` or `sum(//amount)`). Each select is computed in parallel over the single stream.

## Attributes

`xsl:fork` has no element-specific attributes. Its children are sequence constructors forming the independent branches.

## Examples

### Computing count and sum in one streaming pass

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:param name="source-uri" select="'transactions.xml'"/>

  <xsl:template name="xsl:initial-template">
    <xsl:stream href="{$source-uri}">
      <xsl:variable name="stats">
        <xsl:fork>
          <xsl:sequence select="count(//transaction)"/>
          <xsl:sequence select="sum(//transaction/@amount)"/>
        </xsl:fork>
      </xsl:variable>
      <summary>
        <count><xsl:value-of select="$stats[1]"/></count>
        <total><xsl:value-of select="$stats[2]"/></total>
      </summary>
    </xsl:stream>
  </xsl:template>
</xsl:stylesheet>
```

### Fork with apply-templates branches

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>
  <xsl:mode name="count-mode" streamable="yes"/>
  <xsl:mode name="list-mode" streamable="yes"/>

  <xsl:param name="source-uri" select="'catalog.xml'"/>

  <xsl:template name="xsl:initial-template">
    <xsl:stream href="{$source-uri}">
      <report>
        <xsl:fork>
          <xsl:apply-templates select="." mode="count-mode"/>
          <xsl:apply-templates select="." mode="list-mode"/>
        </xsl:fork>
      </report>
    </xsl:stream>
  </xsl:template>

  <xsl:template match="/" mode="count-mode">
    <total-items><xsl:value-of select="count(//item)"/></total-items>
  </xsl:template>

  <xsl:template match="/" mode="list-mode">
    <xsl:for-each select="//item">
      <item><xsl:value-of select="@name"/></item>
    </xsl:for-each>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- Each branch of `xsl:fork` must be independently streamable. The branches cannot share variables or communicate except through accumulators.
- The results of all branches are concatenated in the order the branches appear.
- `xsl:fork` can contain `xsl:fallback` to handle non-streaming processors gracefully.
- Using `xsl:fork` outside a streaming context is valid but adds no value — branches execute sequentially.
- Processors may or may not truly parallelise the branches; the specification only requires that the result is as-if they ran simultaneously.

## See also

- [xsl:stream](../xsl-stream)
- [xsl:merge](../xsl-merge)
- [xsl:accumulator](../xsl-accumulator)
