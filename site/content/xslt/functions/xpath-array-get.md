---
title: "array:get()"
description: "Returns the member of an array at a specified 1-based position."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "array function"
syntax: "array:get(array, position)"
tags: ["xslt", "reference", "xpath", "xslt3"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczphcnJheT0iaHR0cDovL3d3dy53My5vcmcvMjAwNS94cGF0aC1mdW5jdGlvbnMvYXJyYXkiPgoKICA8eHNsOm91dHB1dCBtZXRob2Q9InhtbCIgaW5kZW50PSJ5ZXMiLz4KCiAgPHhzbDp0ZW1wbGF0ZSBtYXRjaD0iLyI-CiAgICA8eHNsOnZhcmlhYmxlIG5hbWU9ImNvbG9ycyIgc2VsZWN0PSJbJ3JlZCcsICdncmVlbicsICdibHVlJywgJ3llbGxvdyddIi8-CiAgICA8cmVzdWx0PgogICAgICA8IS0tIEJvdGggc3ludGF4ZXMgYXJlIGVxdWl2YWxlbnQgLS0-CiAgICAgIDxmaXJzdD48eHNsOnZhbHVlLW9mIHNlbGVjdD0iYXJyYXk6Z2V0KCRjb2xvcnMsIDEpIi8-PC9maXJzdD4KICAgICAgPHRoaXJkPjx4c2w6dmFsdWUtb2Ygc2VsZWN0PSIkY29sb3JzKDMpIi8-PC90aGlyZD4KICAgICAgPGxhc3Q-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9ImFycmF5OmdldCgkY29sb3JzLCBhcnJheTpzaXplKCRjb2xvcnMpKSIvPjwvbGFzdD4KICAgIDwvcmVzdWx0PgogIDwveHNsOnRlbXBsYXRlPgo8L3hzbDpzdHlsZXNoZWV0Pg&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHJvb3QvPg&version=3.0"
---

## Description

`array:get()` retrieves the member at the given 1-based integer position in an array. If the position is less than 1 or greater than the array size, error `err:FOAY0001` is raised. An alternative shorthand is `$array($position)` using function-call syntax.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `array` | array(*) | Yes | The array to access. |
| `position` | xs:integer | Yes | The 1-based position of the member to retrieve. |

## Return value

`item()*` — the member at the given position (may be a sequence if the member is a sequence).

## Examples

### Accessing array elements by position

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:array="http://www.w3.org/2005/xpath-functions/array">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="colors" select="['red', 'green', 'blue', 'yellow']"/>
    <result>
      <!-- Both syntaxes are equivalent -->
      <first><xsl:value-of select="array:get($colors, 1)"/></first>
      <third><xsl:value-of select="$colors(3)"/></third>
      <last><xsl:value-of select="array:get($colors, array:size($colors))"/></last>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <first>red</first>
  <third>blue</third>
  <last>yellow</last>
</result>
```

### Iterating with positional access

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:array="http://www.w3.org/2005/xpath-functions/array">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="matrix" select="[[1,2,3],[4,5,6],[7,8,9]]"/>
    <matrix>
      <xsl:for-each select="1 to array:size($matrix)">
        <xsl:variable name="row-idx" select="."/>
        <row n="{$row-idx}">
          <xsl:variable name="row" select="array:get($matrix, $row-idx)"/>
          <xsl:for-each select="1 to array:size($row)">
            <cell><xsl:value-of select="array:get($row, .)"/></cell>
          </xsl:for-each>
        </row>
      </xsl:for-each>
    </matrix>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<matrix>
  <row n="1"><cell>1</cell><cell>2</cell><cell>3</cell></row>
  <row n="2"><cell>4</cell><cell>5</cell><cell>6</cell></row>
  <row n="3"><cell>7</cell><cell>8</cell><cell>9</cell></row>
</matrix>
```

## Notes

- Positions are 1-based (not 0-based), consistent with XPath sequence indexing.
- Out-of-bounds access raises `err:FOAY0001`; use `array:size()` to guard.
- The shorthand `$array($pos)` is syntactic sugar for `array:get($array, $pos)`.

## See also

- [array:size()](../xpath-array-size)
- [array:head()](../xpath-array-head)
- [array:put()](../xpath-array-put)
- [array:subarray()](../xpath-array-subarray)
- [xsl:array](../xsl-array)
