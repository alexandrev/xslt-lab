---
title: "array:for-each-pair()"
description: "Returns a new array by applying the function to corresponding members of two arrays of the same size."
date: 2026-04-19T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "array function"
syntax: "array:for-each-pair(array1, array2, function)"
tags: ["xslt", "reference", "xpath", "xslt3"]
---

## Description

`array:for-each-pair()` applies a two-argument function to corresponding members of two arrays and returns a new array of the results. The function is called with the member from the first array and the member from the second array at each position. The two input arrays must have the same size; if they differ, a dynamic error is raised.

This function is the array analogue of the `for-each-pair()` higher-order function for sequences. It enables pairwise operations — such as computing differences, combining data from parallel arrays, or zipping two arrays together.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `array1` | array(*) | Yes | The first input array. |
| `array2` | array(*) | Yes | The second input array, must be the same size as array1. |
| `function` | function(item()*, item()*) as item()* | Yes | A two-argument function applied to corresponding members. |

## Return value

`array(*)` — a new array of the same size, where each member is the result of applying the function to the corresponding pair of members.

## Examples

### Adding corresponding elements

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:array="http://www.w3.org/2005/xpath-functions/array">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="a" select="[1, 2, 3]"/>
    <xsl:variable name="b" select="[10, 20, 30]"/>
    <xsl:variable name="sums" select="array:for-each-pair($a, $b, function($x, $y) { $x + $y })"/>
    <sums>
      <xsl:for-each select="1 to array:size($sums)">
        <sum><xsl:value-of select="array:get($sums, .)"/></sum>
      </xsl:for-each>
    </sums>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<sums>
  <sum>11</sum>
  <sum>22</sum>
  <sum>33</sum>
</sums>
```

### Zipping names with scores

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
    <xsl:variable name="names" select="['Alice', 'Bob', 'Carol']"/>
    <xsl:variable name="scores" select="[95, 82, 91]"/>
    <xsl:variable name="zipped" select="array:for-each-pair($names, $scores,
      function($name, $score) { concat($name, ':', $score) })"/>
    <results>
      <xsl:for-each select="1 to array:size($zipped)">
        <entry><xsl:value-of select="array:get($zipped, .)"/></entry>
      </xsl:for-each>
    </results>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<results>
  <entry>Alice:95</entry>
  <entry>Bob:82</entry>
  <entry>Carol:91</entry>
</results>
```

## Notes

- Both arrays must have the same number of members. If the sizes differ, a dynamic error is raised.
- Each member is passed to the function as a sequence — a single-item member is a sequence of length one.
- The result array has the same size as the inputs.
- To process a single array with a two-argument function that also tracks the index, combine `array:for-each-pair()` with a position array created via `array:join(for $i in 1 to array:size($a) return [$i])`.

## See also

- [array:for-each()](../xpath-array-for-each)
- [array:filter()](../xpath-array-filter)
- [array:fold-left()](../xpath-array-fold-left)
- [array:flatten()](../xpath-array-flatten)
