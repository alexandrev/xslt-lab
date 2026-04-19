---
title: "xsl:break"
description: "Exits an xsl:iterate loop early and returns an optional final value, enabling efficient early-termination patterns over large sequences."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "element"
syntax: '<xsl:break select="expression"/>'
tags: ["xslt", "reference", "xslt3"]
---

## Description

`xsl:break` terminates an `xsl:iterate` loop before the sequence is exhausted. When a `break` fires, the iteration stops immediately and the value supplied in the `select` attribute (or the content sequence constructor) becomes the result of the entire `xsl:iterate` expression. If no `select` or content is given, the result is the empty sequence.

This enables patterns like "find the first matching item", "accumulate a running total until a threshold is crossed", or "process records until a sentinel value is found" — all without pre-filtering the input or using a recursive named template.

`xsl:break` must appear inside `xsl:iterate`. It can be conditionally executed inside `xsl:if` or `xsl:choose`. Any `xsl:on-completion` block in the same `xsl:iterate` is skipped when a break occurs.

The `select` expression (or content) that provides the break value is evaluated in the context of the current iteration, after the current iteration's body has partially executed up to the `xsl:break` instruction. Parameters updated by `xsl:next-iteration` before the break instruction are visible in the select expression.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `select` | expression | No | The value to return as the result of the `xsl:iterate`. If absent, the content sequence constructor is used. |

## Examples

### Finding the first record above a threshold

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<readings>
  <reading sensor="A" value="12"/>
  <reading sensor="B" value="45"/>
  <reading sensor="C" value="103"/>
  <reading sensor="D" value="78"/>
</readings>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/readings">
    <xsl:variable name="first-alert">
      <xsl:iterate select="reading">
        <xsl:if test="xs:integer(@value) gt 100">
          <xsl:break select="."/>
        </xsl:if>
        <xsl:next-iteration/>
      </xsl:iterate>
    </xsl:variable>
    <alert>
      <xsl:choose>
        <xsl:when test="$first-alert/reading">
          <sensor><xsl:value-of select="$first-alert/reading/@sensor"/></sensor>
          <value><xsl:value-of select="$first-alert/reading/@value"/></value>
        </xsl:when>
        <xsl:otherwise>No alert threshold exceeded.</xsl:otherwise>
      </xsl:choose>
    </alert>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<alert>
  <sensor>C</sensor>
  <value>103</value>
</alert>
```

### Accumulating a running total until a budget is exhausted

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/orders">
    <xsl:variable name="budget" select="xs:decimal(100)"/>
    <included>
      <xsl:iterate select="order">
        <xsl:param name="total" select="xs:decimal(0)"/>
        <xsl:variable name="new-total" select="$total + xs:decimal(@cost)"/>
        <xsl:choose>
          <xsl:when test="$new-total gt $budget">
            <xsl:break/>
          </xsl:when>
          <xsl:otherwise>
            <order id="{@id}" cost="{@cost}"/>
            <xsl:next-iteration>
              <xsl:with-param name="total" select="$new-total"/>
            </xsl:next-iteration>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:iterate>
    </included>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- `xsl:break` may only appear inside `xsl:iterate`. Using it elsewhere is a static error.
- When `xsl:break` fires, any `xsl:on-completion` in the same `xsl:iterate` is **not** executed.
- The result of the `xsl:iterate` expression is whatever `xsl:break` returns, or the result of `xsl:on-completion` if the loop completes naturally.
- Inside streaming mode, `xsl:break` is allowed if the `xsl:iterate` is otherwise streamable.

## See also

- [xsl:next-iteration](../xsl-next-iteration)
- [xsl:iterate](../xsl-iterate)
