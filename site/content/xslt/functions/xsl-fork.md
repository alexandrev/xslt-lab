---
title: "xsl:fork"
description: "Processes a streamed sequence in multiple independent branches simultaneously, enabling multiple aggregations in a single pass over a large document."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "element"
syntax: "<xsl:fork>...</xsl:fork>"
tags: ["xslt", "reference", "xslt3"]
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
