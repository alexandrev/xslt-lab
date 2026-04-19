---
title: "array:put()"
description: "Returns a new array with the member at a given position replaced by a new value."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "array function"
syntax: "array:put(array, position, value)"
tags: ["xslt", "reference", "xpath", "xslt3"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczphcnJheT0iaHR0cDovL3d3dy53My5vcmcvMjAwNS94cGF0aC1mdW5jdGlvbnMvYXJyYXkiPgoKICA8eHNsOm91dHB1dCBtZXRob2Q9InhtbCIgaW5kZW50PSJ5ZXMiLz4KCiAgPHhzbDp0ZW1wbGF0ZSBtYXRjaD0iLyI-CiAgICA8eHNsOnZhcmlhYmxlIG5hbWU9Im9yaWdpbmFsIiBzZWxlY3Q9IlsnYScsICdiJywgJ2MnLCAnZCddIi8-CiAgICA8eHNsOnZhcmlhYmxlIG5hbWU9InVwZGF0ZWQiIHNlbGVjdD0iYXJyYXk6cHV0KCRvcmlnaW5hbCwgMiwgJ0InKSIvPgogICAgPHJlc3VsdD4KICAgICAgPHhzbDpmb3ItZWFjaCBzZWxlY3Q9IjEgdG8gYXJyYXk6c2l6ZSgkdXBkYXRlZCkiPgogICAgICAgIDxpdGVtPjx4c2w6dmFsdWUtb2Ygc2VsZWN0PSJhcnJheTpnZXQoJHVwZGF0ZWQsIC4pIi8-PC9pdGVtPgogICAgICA8L3hzbDpmb3ItZWFjaD4KICAgIDwvcmVzdWx0PgogIDwveHNsOnRlbXBsYXRlPgo8L3hzbDpzdHlsZXNoZWV0Pg&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHBhdGNoIHBvc2l0aW9uPSIyIiB2YWx1ZT0idXBkYXRlZC12YWx1ZSIvPg&version=3.0"
---

## Description

`array:put()` produces a new array identical to the input except that the member at the specified 1-based position is replaced with the new value. Arrays are immutable in XDM; the original array is not modified. Out-of-range positions raise `err:FOAY0001`.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `array` | array(*) | Yes | The source array. |
| `position` | xs:integer | Yes | The 1-based position of the member to replace. |
| `value` | item()* | Yes | The new value for that position. |

## Return value

`array(*)` — a new array with the member at `position` replaced by `value`.

## Examples

### Replacing a member in an array

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:array="http://www.w3.org/2005/xpath-functions/array">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="original" select="['a', 'b', 'c', 'd']"/>
    <xsl:variable name="updated" select="array:put($original, 2, 'B')"/>
    <result>
      <xsl:for-each select="1 to array:size($updated)">
        <item><xsl:value-of select="array:get($updated, .)"/></item>
      </xsl:for-each>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <item>a</item>
  <item>B</item>
  <item>c</item>
  <item>d</item>
</result>
```

### Updating JSON-like array data

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<patch position="2" value="updated-value"/>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:array="http://www.w3.org/2005/xpath-functions/array">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/patch">
    <xsl:variable name="data" select="['original-1', 'original-2', 'original-3']"/>
    <xsl:variable name="pos" select="xs:integer(@position)"/>
    <xsl:variable name="patched" select="array:put($data, $pos, string(@value))"/>
    <patched>
      <xsl:for-each select="1 to array:size($patched)">
        <item pos="{.}"><xsl:value-of select="array:get($patched, .)"/></item>
      </xsl:for-each>
    </patched>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<patched>
  <item pos="1">original-1</item>
  <item pos="2">updated-value</item>
  <item pos="3">original-3</item>
</patched>
```

## Notes

- Array positions are 1-based. Position `0` or greater than `array:size()` raises `err:FOAY0001`.
- The new value can be any XDM value, including a sequence (which becomes a single multi-item member).
- Arrays are immutable; the result is always a new array.

## See also

- [array:get()](../xpath-array-get)
- [array:append()](../xpath-array-append)
- [array:remove()](../xpath-array-remove)
- [array:insert-before()](../xpath-array-insert-before)
- [xsl:array](../xsl-array)
