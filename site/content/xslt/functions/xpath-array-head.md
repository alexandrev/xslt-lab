---
title: "array:head()"
description: "Returns the first member of an array; raises an error if the array is empty."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "array function"
syntax: "array:head(array)"
tags: ["xslt", "reference", "xpath", "xslt3"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczphcnJheT0iaHR0cDovL3d3dy53My5vcmcvMjAwNS94cGF0aC1mdW5jdGlvbnMvYXJyYXkiPgoKICA8eHNsOm91dHB1dCBtZXRob2Q9InhtbCIgaW5kZW50PSJ5ZXMiLz4KCiAgPHhzbDp0ZW1wbGF0ZSBtYXRjaD0iLyI-CiAgICA8eHNsOnZhcmlhYmxlIG5hbWU9Iml0ZW1zIiBzZWxlY3Q9IlsnZmlyc3QnLCAnc2Vjb25kJywgJ3RoaXJkJ10iLz4KICAgIDxyZXN1bHQ-CiAgICAgIDx4c2w6aWYgdGVzdD0iYXJyYXk6c2l6ZSgkaXRlbXMpIGd0IDAiPgogICAgICAgIDxoZWFkPjx4c2w6dmFsdWUtb2Ygc2VsZWN0PSJhcnJheTpoZWFkKCRpdGVtcykiLz48L2hlYWQ-CiAgICAgIDwveHNsOmlmPgogICAgPC9yZXN1bHQ-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHJvb3QvPg&version=3.0"
---

## Description

`array:head()` returns the value of the first member of an array. If the array is empty, error `err:FOAY0001` is raised. Together with `array:tail()`, it supports recursive pattern-matching style processing over arrays.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `array` | array(*) | Yes | The array whose first member is to be returned. |

## Return value

`item()*` — the first member (which may itself be a sequence).

## Examples

### Accessing the first element safely

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:array="http://www.w3.org/2005/xpath-functions/array">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="items" select="['first', 'second', 'third']"/>
    <result>
      <xsl:if test="array:size($items) gt 0">
        <head><xsl:value-of select="array:head($items)"/></head>
      </xsl:if>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <head>first</head>
</result>
```

### Recursive processing with head and tail

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:array="http://www.w3.org/2005/xpath-functions/array"
  xmlns:f="http://example.com/fn">

  <xsl:output method="xml" indent="yes"/>

  <xsl:function name="f:sum-array" as="xs:integer">
    <xsl:param name="arr" as="array(xs:integer)"/>
    <xsl:sequence select="
      if (array:size($arr) = 0) then 0
      else array:head($arr) + f:sum-array(array:tail($arr))
    "/>
  </xsl:function>

  <xsl:template match="/">
    <result>
      <sum><xsl:value-of select="f:sum-array([10, 20, 30, 40])"/></sum>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <sum>100</sum>
</result>
```

## Notes

- Equivalent to `array:get($array, 1)`.
- Raises `err:FOAY0001` on an empty array; guard with `array:size($arr) gt 0`.
- Pair with `array:tail()` for list-processing patterns.

## See also

- [array:tail()](../xpath-array-tail)
- [array:get()](../xpath-array-get)
- [array:size()](../xpath-array-size)
- [xsl:array](../xsl-array)
