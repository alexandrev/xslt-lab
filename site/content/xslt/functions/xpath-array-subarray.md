---
title: "array:subarray()"
description: "Returns a contiguous sub-array starting at a given position, with optional length."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "array function"
syntax: "array:subarray(array, start, length?)"
tags: ["xslt", "reference", "xpath", "xslt3"]
---

## Description

`array:subarray()` extracts a portion of an array. The `start` position is 1-based. If `length` is omitted, all members from `start` to the end are returned. If `length` is 0, an empty array is returned. Out-of-range positions or negative lengths raise `err:FOAY0001`.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `array` | array(*) | Yes | The source array. |
| `start` | xs:integer | Yes | The 1-based starting position. |
| `length` | xs:integer? | No | Number of members to include. Defaults to all remaining members. |

## Return value

`array(*)` — the specified sub-array.

## Examples

### Slicing an array

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:array="http://www.w3.org/2005/xpath-functions/array">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="data" select="['a','b','c','d','e','f']"/>
    <result>
      <!-- Items 2 through 4 -->
      <slice from="2" length="3">
        <xsl:value-of select="array:subarray($data, 2, 3)" separator=","/>
      </slice>
      <!-- Items from position 4 to end -->
      <tail from="4">
        <xsl:value-of select="array:subarray($data, 4)" separator=","/>
      </tail>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <slice from="2" length="3">b,c,d</slice>
  <tail from="4">d,e,f</tail>
</result>
```

### Pagination with subarray

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:array="http://www.w3.org/2005/xpath-functions/array">

  <xsl:output method="xml" indent="yes"/>

  <xsl:param name="page"     as="xs:integer" select="2"/>
  <xsl:param name="per-page" as="xs:integer" select="3"/>

  <xsl:template match="/">
    <xsl:variable name="all"   select="[1,2,3,4,5,6,7,8,9,10]"/>
    <xsl:variable name="start" select="($page - 1) * $per-page + 1"/>
    <xsl:variable name="len"   select="min(($per-page, array:size($all) - $start + 1))"/>
    <xsl:variable name="page-data" select="array:subarray($all, $start, $len)"/>
    <page num="{$page}">
      <xsl:for-each select="1 to array:size($page-data)">
        <item><xsl:value-of select="array:get($page-data, .)"/></item>
      </xsl:for-each>
    </page>
  </xsl:template>
</xsl:stylesheet>
```

**Output (page=2, per-page=3):**
```xml
<page num="2">
  <item>4</item>
  <item>5</item>
  <item>6</item>
</page>
```

## Notes

- `array:subarray($arr, 1)` returns a copy of the entire array.
- `array:subarray($arr, 2)` is equivalent to `array:tail($arr)`.
- `start` must be in the range `1` to `array:size($arr) + 1`; `length` must be non-negative.

## See also

- [array:get()](../xpath-array-get)
- [array:head()](../xpath-array-head)
- [array:tail()](../xpath-array-tail)
- [array:remove()](../xpath-array-remove)
- [xsl:array](../xsl-array)
