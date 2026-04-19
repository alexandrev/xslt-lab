---
title: "array:remove()"
description: "Returns a new array with the members at the specified 1-based positions removed."
date: 2026-04-19T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "array function"
syntax: "array:remove(array, positions)"
tags: ["xslt", "reference", "xpath", "xslt3"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczphcnJheT0iaHR0cDovL3d3dy53My5vcmcvMjAwNS94cGF0aC1mdW5jdGlvbnMvYXJyYXkiPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0idGV4dCIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvIj4KICAgIDx4c2w6dmFyaWFibGUgbmFtZT0iYSIgc2VsZWN0PSJbJ0EnLCAnQicsICdDJywgJ0QnXSIvPgogICAgPHhzbDp2YXJpYWJsZSBuYW1lPSJyZXN1bHQiIHNlbGVjdD0iYXJyYXk6cmVtb3ZlKCRhLCAyKSIvPgogICAgPHhzbDp2YWx1ZS1vZiBzZWxlY3Q9ImFycmF5OmZsYXR0ZW4oJHJlc3VsdCkiIHNlcGFyYXRvcj0iICIvPgogIDwveHNsOnRlbXBsYXRlPgo8L3hzbDpzdHlsZXNoZWV0Pg&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGRhdGEvPg&version=3.0"
---

## Description

`array:remove()` returns a new array with specified members omitted. The `positions` argument is a sequence of 1-based integers identifying the members to remove. Positions may be supplied in any order; duplicates are ignored. Members not listed in `positions` are retained in their original relative order.

If `positions` is the empty sequence, the function returns a copy of the input array unchanged. All specified positions must be valid (between 1 and `array:size(array)` inclusive); an out-of-range position raises a dynamic error.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `array` | array(*) | Yes | The source array. |
| `positions` | xs:integer* | Yes | A sequence of 1-based positions to remove. |

## Return value

`array(*)` — a new array with the specified members removed, preserving the relative order of remaining members.

## Examples

### Removing a single member

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:array="http://www.w3.org/2005/xpath-functions/array">
  <xsl:output method="text"/>

  <xsl:template match="/">
    <xsl:variable name="a" select="['A', 'B', 'C', 'D']"/>
    <xsl:variable name="result" select="array:remove($a, 2)"/>
    <xsl:value-of select="array:flatten($result)" separator=" "/>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```
A C D
```

### Removing multiple members

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<data/>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:array="http://www.w3.org/2005/xpath-functions/array">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/data">
    <xsl:variable name="a" select="[10, 20, 30, 40, 50]"/>
    <!-- Remove positions 1 and 3 -->
    <xsl:variable name="result" select="array:remove($a, (1, 3))"/>
    <remaining>
      <xsl:for-each select="1 to array:size($result)">
        <item><xsl:value-of select="array:get($result, .)"/></item>
      </xsl:for-each>
    </remaining>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<remaining>
  <item>20</item>
  <item>40</item>
  <item>50</item>
</remaining>
```

## Notes

- `array:remove()` removes by position, not by value. To remove by value, combine `array:filter()` with a value comparison.
- Positions are 1-based, consistent with all other array functions.
- Duplicate positions in the `positions` sequence are silently ignored.
- Removing all positions results in an empty array `[]`; removing no positions (`()`) returns a copy of the input.

## See also

- [array:insert-before()](../xpath-array-insert-before)
- [array:filter()](../xpath-array-filter)
- [array:subarray()](../xpath-array-subarray)
- [array:size()](../xpath-array-size)
