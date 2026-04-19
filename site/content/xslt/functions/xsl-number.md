---
title: "xsl:number"
description: "Formats a number or automatically generates a sequence number based on the node's position in the document."
date: 2026-04-19T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "element"
syntax: "<xsl:number value=\"expression\" level=\"single|multiple|any\" count=\"pattern\" format=\"1\"/>"
tags: ["xslt", "reference", "xpath", "xslt1"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjEuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSI-CiAgPHhzbDpvdXRwdXQgbWV0aG9kPSJ0ZXh0Ii8-CgogIDx4c2w6dGVtcGxhdGUgbWF0Y2g9ImNoYXB0ZXIiPgogICAgPHhzbDpudW1iZXIgbGV2ZWw9InNpbmdsZSIgY291bnQ9ImNoYXB0ZXIiIGZvcm1hdD0iMSIvPgogICAgPHhzbDp0ZXh0Pi4gPC94c2w6dGV4dD4KICAgIDx4c2w6dmFsdWUtb2Ygc2VsZWN0PSJ0aXRsZSIvPgogICAgPHhzbDp0ZXh0PiYjMTA7PC94c2w6dGV4dD4KICAgIDx4c2w6YXBwbHktdGVtcGxhdGVzIHNlbGVjdD0ic2VjdGlvbiIvPgogIDwveHNsOnRlbXBsYXRlPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSJzZWN0aW9uIj4KICAgIDx4c2w6dGV4dD4gIDwveHNsOnRleHQ-CiAgICA8eHNsOm51bWJlciBsZXZlbD0ibXVsdGlwbGUiIGNvdW50PSJjaGFwdGVyfHNlY3Rpb24iIGZvcm1hdD0iMS4xIi8-CiAgICA8eHNsOnRleHQ-IDwveHNsOnRleHQ-CiAgICA8eHNsOnZhbHVlLW9mIHNlbGVjdD0idGl0bGUiLz4KICAgIDx4c2w6dGV4dD4mIzEwOzwveHNsOnRleHQ-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGJvb2s-CiAgPGNoYXB0ZXI-PHRpdGxlPkludHJvZHVjdGlvbjwvdGl0bGU-CiAgICA8c2VjdGlvbj48dGl0bGU-QmFja2dyb3VuZDwvdGl0bGU-PC9zZWN0aW9uPgogICAgPHNlY3Rpb24-PHRpdGxlPlNjb3BlPC90aXRsZT48L3NlY3Rpb24-CiAgPC9jaGFwdGVyPgogIDxjaGFwdGVyPjx0aXRsZT5NZXRob2RzPC90aXRsZT4KICAgIDxzZWN0aW9uPjx0aXRsZT5EYXRhIENvbGxlY3Rpb248L3RpdGxlPjwvc2VjdGlvbj4KICA8L2NoYXB0ZXI-CjwvYm9vaz4&version=1.0"
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
