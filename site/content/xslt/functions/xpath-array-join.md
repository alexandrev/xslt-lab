---
title: "array:join()"
description: "Concatenates a sequence of arrays into a single array by combining all their members."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "array function"
syntax: "array:join(arrays)"
tags: ["xslt", "reference", "xpath", "xslt3"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczphcnJheT0iaHR0cDovL3d3dy53My5vcmcvMjAwNS94cGF0aC1mdW5jdGlvbnMvYXJyYXkiPgoKICA8eHNsOm91dHB1dCBtZXRob2Q9InhtbCIgaW5kZW50PSJ5ZXMiLz4KCiAgPHhzbDp0ZW1wbGF0ZSBtYXRjaD0iLyI-CiAgICA8eHNsOnZhcmlhYmxlIG5hbWU9ImFycjEiIHNlbGVjdD0iWydhJywgJ2InLCAnYyddIi8-CiAgICA8eHNsOnZhcmlhYmxlIG5hbWU9ImFycjIiIHNlbGVjdD0iWydkJywgJ2UnXSIvPgogICAgPHhzbDp2YXJpYWJsZSBuYW1lPSJhcnIzIiBzZWxlY3Q9IlsnZiddIi8-CiAgICA8eHNsOnZhcmlhYmxlIG5hbWU9ImpvaW5lZCIgc2VsZWN0PSJhcnJheTpqb2luKCgkYXJyMSwgJGFycjIsICRhcnIzKSkiLz4KICAgIDxyZXN1bHQgc2l6ZT0ie2FycmF5OnNpemUoJGpvaW5lZCl9Ij4KICAgICAgPHhzbDpmb3ItZWFjaCBzZWxlY3Q9IjEgdG8gYXJyYXk6c2l6ZSgkam9pbmVkKSI-CiAgICAgICAgPGl0ZW0-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9ImFycmF5OmdldCgkam9pbmVkLCAuKSIvPjwvaXRlbT4KICAgICAgPC94c2w6Zm9yLWVhY2g-CiAgICA8L3Jlc3VsdD4KICA8L3hzbDp0ZW1wbGF0ZT4KPC94c2w6c3R5bGVzaGVldD4&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGdyb3Vwcz4KICA8Z3JvdXAgaWQ9IkEiPjx2YWw-MTwvdmFsPjx2YWw-MjwvdmFsPjwvZ3JvdXA-CiAgPGdyb3VwIGlkPSJCIj48dmFsPjM8L3ZhbD48dmFsPjQ8L3ZhbD48L2dyb3VwPgo8L2dyb3Vwcz4&version=3.0"
---

## Description

`array:join()` takes a sequence of arrays and returns a single array whose members are all the members of the input arrays concatenated in order. An empty sequence of arrays returns an empty array. This is distinct from `array:append()` which adds a single new member.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `arrays` | array(*)* | Yes | A sequence of arrays to concatenate. |

## Return value

`array(*)` — a new array containing all members of all input arrays in order.

## Examples

### Joining two arrays

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:array="http://www.w3.org/2005/xpath-functions/array">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="arr1" select="['a', 'b', 'c']"/>
    <xsl:variable name="arr2" select="['d', 'e']"/>
    <xsl:variable name="arr3" select="['f']"/>
    <xsl:variable name="joined" select="array:join(($arr1, $arr2, $arr3))"/>
    <result size="{array:size($joined)}">
      <xsl:for-each select="1 to array:size($joined)">
        <item><xsl:value-of select="array:get($joined, .)"/></item>
      </xsl:for-each>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result size="6">
  <item>a</item>
  <item>b</item>
  <item>c</item>
  <item>d</item>
  <item>e</item>
  <item>f</item>
</result>
```

### Building an array from chunked XML data

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<groups>
  <group id="A"><val>1</val><val>2</val></group>
  <group id="B"><val>3</val><val>4</val></group>
</groups>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:array="http://www.w3.org/2005/xpath-functions/array">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/groups">
    <xsl:variable name="arrays" select="
      for $g in group return
        fold-left($g/val, [],
          function($acc, $v) { array:append($acc, xs:integer($v)) }
        )"/>
    <xsl:variable name="all" select="array:join($arrays)"/>
    <all total="{sum(array:flatten($all))}">
      <xsl:for-each select="1 to array:size($all)">
        <n><xsl:value-of select="array:get($all, .)"/></n>
      </xsl:for-each>
    </all>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<all total="10">
  <n>1</n><n>2</n><n>3</n><n>4</n>
</all>
```

## Notes

- `array:join(())` returns an empty array `[]`.
- Unlike `array:append()`, which adds one item as a single member, `array:join()` merges the members of each array.
- The result length equals the sum of the sizes of all input arrays.

## See also

- [array:append()](../xpath-array-append)
- [array:subarray()](../xpath-array-subarray)
- [array:size()](../xpath-array-size)
- [array:flatten()](../xpath-array-flatten)
- [xsl:array](../xsl-array)
