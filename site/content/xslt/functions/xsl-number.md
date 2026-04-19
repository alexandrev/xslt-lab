---
title: "xsl:number"
description: "Formats a number or automatically generates a sequence number based on the node's position in the document."
date: 2026-04-19T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "element"
syntax: "<xsl:number value=\"expression\" level=\"single|multiple|any\" count=\"pattern\" format=\"1\"/>"
tags: ["xslt", "reference", "xpath", "xslt1"]
---

## Description

`xsl:number` inserts a formatted number into the result tree. It operates in two modes: when a `value` attribute is given it simply formats that value; when `value` is absent it automatically computes the source node's position within the document hierarchy according to the `level`, `count`, and `from` attributes.

The `level` attribute controls how the position is computed. `single` (default) counts preceding siblings that match the `count` pattern at the same level. `multiple` generates a compound number like `2.3.1` across nested levels. `any` counts all matching nodes anywhere in the document before the current node, regardless of nesting depth.

The `format` attribute is a picture string where `1` produces Arabic numerals, `a` lowercase letters, `A` uppercase letters, `i` lowercase Roman numerals, and `I` uppercase Roman numerals. Separator characters between tokens in the picture string are reproduced literally.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `value` | expression | No | Numeric expression to format. When present, `level`, `count`, and `from` are ignored. |
| `level` | `single`, `multiple`, or `any` | No | Determines which nodes are counted (default `single`). |
| `count` | pattern | No | Pattern identifying nodes to count. Defaults to nodes with the same name as the current node. |
| `from` | pattern | No | Counting restarts at each node matching this pattern. |
| `format` | string | No | Picture string controlling output format (default `1`). |
| `lang` | NMTOKEN | No | Language used for alphabetic numbering. |
| `letter-value` | `alphabetic` or `traditional` | No | Disambiguates numbering schemes where both exist. |
| `grouping-separator` | char | No | Separator character for digit groups (e.g., `,`). |
| `grouping-size` | number | No | Number of digits per group (e.g., `3`). |

## Return value

Inserts a formatted number string as a text node in the result tree.

## Examples

### Automatic chapter and section numbering

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<book>
  <chapter><title>Introduction</title>
    <section><title>Background</title></section>
    <section><title>Scope</title></section>
  </chapter>
  <chapter><title>Methods</title>
    <section><title>Data Collection</title></section>
  </chapter>
</book>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>

  <xsl:template match="chapter">
    <xsl:number level="single" count="chapter" format="1"/>
    <xsl:text>. </xsl:text>
    <xsl:value-of select="title"/>
    <xsl:text>&#10;</xsl:text>
    <xsl:apply-templates select="section"/>
  </xsl:template>

  <xsl:template match="section">
    <xsl:text>  </xsl:text>
    <xsl:number level="multiple" count="chapter|section" format="1.1"/>
    <xsl:text> </xsl:text>
    <xsl:value-of select="title"/>
    <xsl:text>&#10;</xsl:text>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```
1. Introduction
  1.1 Background
  1.2 Scope
2. Methods
  2.1 Data Collection
```

### Formatting an explicit value with grouping

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<data>
  <count>1234567</count>
</data>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>

  <xsl:template match="/data">
    <xsl:number value="count" grouping-separator="," grouping-size="3" format="1"/>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```
1,234,567
```

## Notes

- When `value` is absent and no `count` pattern is specified, the processor defaults to counting nodes with the same expanded name as the current node.
- `level="any"` is useful for footnote numbering that must be continuous across the whole document.
- In XSLT 2.0 and later, `xsl:number` is largely unchanged but the processor may support additional `format` tokens for other scripts via the `lang` attribute.
- `xsl:number` always inserts a text node; it cannot be used inside an attribute value template directly.

## See also

- [xsl:for-each](../xsl-for-each)
- [format-number()](../xpath-format-number)
- [xsl:decimal-format](../xsl-decimal-format)
- [position()](../xpath-position)
