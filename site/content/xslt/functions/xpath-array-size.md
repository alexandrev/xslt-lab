---
title: "array:size()"
description: "Returns the number of members in an array."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "array function"
syntax: "array:size(array)"
tags: ["xslt", "reference", "xpath", "xslt3"]
---

## Description

`array:size()` returns the count of members in an array as an `xs:integer`. An empty array returns `0`. Unlike `count()` which operates on sequences, `array:size()` counts top-level members — each member may itself be a sequence or nested array.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `array` | array(*) | Yes | The array whose member count is to be returned. |

## Return value

`xs:integer` — the number of top-level members; `0` for an empty array.

## Examples

### Checking array size before access

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:array="http://www.w3.org/2005/xpath-functions/array">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="items" select="['red', 'green', 'blue']"/>
    <result>
      <size><xsl:value-of select="array:size($items)"/></size>
      <empty><xsl:value-of select="array:size([])"/></empty>
      <safe>
        <xsl:if test="array:size($items) gt 0">
          <xsl:value-of select="array:head($items)"/>
        </xsl:if>
      </safe>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <size>3</size>
  <empty>0</empty>
  <safe>red</safe>
</result>
```

### Comparing sequence count vs array size

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:array="http://www.w3.org/2005/xpath-functions/array">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <!-- Each member is a sequence of 2 items, so array has 3 members -->
    <xsl:variable name="pairs" select="[('a',1), ('b',2), ('c',3)]"/>
    <result>
      <!-- array:size counts members (3), not total items (6) -->
      <array-size><xsl:value-of select="array:size($pairs)"/></array-size>
      <!-- array:flatten then count gives total items -->
      <flat-count><xsl:value-of select="count(array:flatten($pairs))"/></flat-count>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <array-size>3</array-size>
  <flat-count>6</flat-count>
</result>
```

## Notes

- `array:size()` counts top-level members; use `count(array:flatten($arr))` to count all atomic items recursively.
- An array member that is an empty sequence still counts as one member.
- Equivalent to `count(1 to array:size($arr))` but far more efficient.

## See also

- [array:get()](../xpath-array-get)
- [array:head()](../xpath-array-head)
- [array:tail()](../xpath-array-tail)
- [array:flatten()](../xpath-array-flatten)
- [xsl:array](../xsl-array)
