---
title: "xsl:when"
description: "Condition branch inside xsl:choose; its content is output when test evaluates to true and no earlier sibling matched."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "element"
syntax: '<xsl:when test="boolean-expression">'
tags: ["xslt", "reference", "xslt1"]
---

## Description

`xsl:when` is a child element of `xsl:choose` that represents one conditional branch. Its `test` attribute holds a boolean XPath expression. The parent `xsl:choose` evaluates the tests of its `xsl:when` children in document order and instantiates the content of the first one whose test is true. All subsequent `xsl:when` elements (and `xsl:otherwise`, if present) are skipped.

`xsl:when` cannot appear outside of `xsl:choose`, and every `xsl:choose` must contain at least one `xsl:when`.

The `test` expression follows the same rules as the `xsl:if` test: the result is coerced to boolean if it is not already one. An empty node-set, zero, `NaN`, or an empty string are all false; everything else is true.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `test` | Boolean XPath expression | Yes | Condition that must be true for this branch to be selected. |

## Examples

### Status label with multiple branches

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<orders>
  <order id="1" status="pending"/>
  <order id="2" status="shipped"/>
  <order id="3" status="delivered"/>
  <order id="4" status="cancelled"/>
</orders>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/orders">
    <orders>
      <xsl:apply-templates select="order"/>
    </orders>
  </xsl:template>

  <xsl:template match="order">
    <order id="{@id}">
      <xsl:choose>
        <xsl:when test="@status = 'pending'">Awaiting processing</xsl:when>
        <xsl:when test="@status = 'shipped'">In transit</xsl:when>
        <xsl:when test="@status = 'delivered'">Completed</xsl:when>
        <xsl:otherwise>Unknown status</xsl:otherwise>
      </xsl:choose>
    </order>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<orders>
  <order id="1">Awaiting processing</order>
  <order id="2">In transit</order>
  <order id="3">Completed</order>
  <order id="4">Unknown status</order>
</orders>
```

### Positional branch

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<items>
  <item>Alpha</item>
  <item>Beta</item>
  <item>Gamma</item>
  <item>Delta</item>
</items>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/items">
    <list>
      <xsl:for-each select="item">
        <item>
          <xsl:choose>
            <xsl:when test="position() = 1">first</xsl:when>
            <xsl:when test="position() = last()">last</xsl:when>
            <xsl:otherwise>middle</xsl:otherwise>
          </xsl:choose>
          <xsl:text>: </xsl:text>
          <xsl:value-of select="."/>
        </item>
      </xsl:for-each>
    </list>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<list>
  <item>first: Alpha</item>
  <item>middle: Beta</item>
  <item>middle: Gamma</item>
  <item>last: Delta</item>
</list>
```

## Notes

- Conditions are tested strictly in order; once a match is found, no further `xsl:when` conditions are evaluated. Arrange branches from most specific to most general to avoid ambiguity.
- The content of an unmatched `xsl:when` is never instantiated, so side effects (like `xsl:message`) inside it will not occur.
- In XSLT 2.0+ the `test` attribute can contain any XPath 2.0 expression; the coercion rules are more strict than in 1.0 (only `xs:boolean` and node-sets are accepted without explicit conversion).

## See also

- [xsl:choose](../xsl-choose)
- [xsl:otherwise](../xsl-otherwise)
- [xsl:if](../xsl-if)
