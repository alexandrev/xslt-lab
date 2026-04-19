---
title: "array:tail()"
description: "Returns a new array containing all members except the first; raises an error if the array is empty."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "array function"
syntax: "array:tail(array)"
tags: ["xslt", "reference", "xpath", "xslt3"]
---

## Description

`array:tail()` returns a new array that contains every member of the input array except the first one. If the array has one member, an empty array is returned. If the array is empty, error `err:FOAY0001` is raised. Used together with `array:head()` for recursive array processing.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `array` | array(*) | Yes | The source array. |

## Return value

`array(*)` — a new array with the first member removed; empty array if input had one member.

## Examples

### Popping the first element in a loop

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:array="http://www.w3.org/2005/xpath-functions/array">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="original" select="['a', 'b', 'c', 'd']"/>
    <xsl:variable name="tail"     select="array:tail($original)"/>
    <result>
      <head><xsl:value-of select="array:head($original)"/></head>
      <tail-size><xsl:value-of select="array:size($tail)"/></tail-size>
      <tail-first><xsl:value-of select="array:head($tail)"/></tail-first>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <head>a</head>
  <tail-size>3</tail-size>
  <tail-first>b</tail-first>
</result>
```

### Recursive array reverse using head and tail

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:array="http://www.w3.org/2005/xpath-functions/array"
  xmlns:f="http://example.com/fn">

  <xsl:output method="xml" indent="yes"/>

  <xsl:function name="f:reverse-array" as="array(*)">
    <xsl:param name="arr" as="array(*)"/>
    <xsl:sequence select="
      if (array:size($arr) = 0) then []
      else array:append(f:reverse-array(array:tail($arr)), array:head($arr))
    "/>
  </xsl:function>

  <xsl:template match="/">
    <xsl:variable name="rev" select="f:reverse-array([1,2,3,4,5])"/>
    <result>
      <xsl:for-each select="1 to array:size($rev)">
        <n><xsl:value-of select="array:get($rev, .)"/></n>
      </xsl:for-each>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <n>5</n><n>4</n><n>3</n><n>2</n><n>1</n>
</result>
```

## Notes

- Equivalent to `array:subarray($array, 2)`.
- Raises `err:FOAY0001` for an empty array; guard with `array:size($arr) gt 0`.
- For efficient list processing, prefer `array:fold-left()` or `array:for-each()` over manual head/tail recursion.

## See also

- [array:head()](../xpath-array-head)
- [array:get()](../xpath-array-get)
- [array:subarray()](../xpath-array-subarray)
- [array:size()](../xpath-array-size)
- [xsl:array](../xsl-array)
