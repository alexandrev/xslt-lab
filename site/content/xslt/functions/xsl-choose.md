---
title: "xsl:choose"
description: "Multi-branch conditional that evaluates xsl:when conditions in order and optionally falls back to xsl:otherwise."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "element"
syntax: '<xsl:choose>'
tags: ["xslt", "reference", "xslt1"]
---

## Description

`xsl:choose` provides a switch-like construct for selecting one branch of output from several alternatives. It must contain one or more `xsl:when` children (each with its own `test` expression) and may optionally end with a single `xsl:otherwise` child as the default branch.

The processor evaluates each `xsl:when` test in document order and instantiates the first one whose expression evaluates to true, then skips the rest. If no `xsl:when` matches and an `xsl:otherwise` is present, that branch is used. If no branch matches and there is no `xsl:otherwise`, nothing is output.

`xsl:choose` is the XSLT equivalent of an if / else-if / else chain. Unlike chained `xsl:if` elements — which are all evaluated independently — only one branch of `xsl:choose` can ever produce output for a given node.

## Attributes

`xsl:choose` itself takes no attributes. Conditions are specified on the `xsl:when` children.

## Examples

### Classifying numeric values

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<scores>
  <score student="Alice">92</score>
  <score student="Bob">73</score>
  <score student="Carol">55</score>
  <score student="Dave">38</score>
</scores>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/scores">
    <results>
      <xsl:apply-templates select="score"/>
    </results>
  </xsl:template>

  <xsl:template match="score">
    <result student="{@student}" score="{.}">
      <xsl:choose>
        <xsl:when test=". >= 90">A</xsl:when>
        <xsl:when test=". >= 70">B</xsl:when>
        <xsl:when test=". >= 50">C</xsl:when>
        <xsl:otherwise>F</xsl:otherwise>
      </xsl:choose>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<results>
  <result student="Alice" score="92">A</result>
  <result student="Bob" score="73">B</result>
  <result student="Carol" score="55">C</result>
  <result student="Dave" score="38">F</result>
</results>
```

### Choosing output format based on attribute

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<items>
  <item type="link" href="https://example.com">Visit site</item>
  <item type="image" src="logo.png">Logo</item>
  <item type="text">Plain description</item>
</items>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/items">
    <content>
      <xsl:apply-templates select="item"/>
    </content>
  </xsl:template>

  <xsl:template match="item">
    <xsl:choose>
      <xsl:when test="@type = 'link'">
        <a href="{@href}"><xsl:value-of select="."/></a>
      </xsl:when>
      <xsl:when test="@type = 'image'">
        <img src="{@src}" alt="{.}"/>
      </xsl:when>
      <xsl:otherwise>
        <p><xsl:value-of select="."/></p>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<content>
  <a href="https://example.com">Visit site</a>
  <img src="logo.png" alt="Logo"/>
  <p>Plain description</p>
</content>
```

## Notes

- `xsl:when` elements are evaluated strictly in order; only the first matching branch fires. This matters when conditions overlap.
- An `xsl:otherwise` without any `xsl:when` is a schema error. At least one `xsl:when` must be present.
- `xsl:otherwise` must be the last child of `xsl:choose`; placing it before any `xsl:when` is an error.
- `xsl:choose` can be nested to arbitrary depth, enabling complex decision trees.

## See also

- [xsl:when](../xsl-when)
- [xsl:otherwise](../xsl-otherwise)
- [xsl:if](../xsl-if)
