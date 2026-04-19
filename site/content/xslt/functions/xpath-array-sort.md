---
title: "array:sort()"
description: "Returns a new array with members sorted using an optional collation and key function."
date: 2026-04-19T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "array function"
syntax: "array:sort(array, collation?, key-function?)"
tags: ["xslt", "reference", "xpath", "xslt3"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczphcnJheT0iaHR0cDovL3d3dy53My5vcmcvMjAwNS94cGF0aC1mdW5jdGlvbnMvYXJyYXkiPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0idGV4dCIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvIj4KICAgIDx4c2w6dmFyaWFibGUgbmFtZT0ibnVtcyIgc2VsZWN0PSJbNSwgMiwgOCwgMSwgOSwgM10iLz4KICAgIDx4c2w6dmFyaWFibGUgbmFtZT0ic29ydGVkIiBzZWxlY3Q9ImFycmF5OnNvcnQoJG51bXMpIi8-CiAgICA8eHNsOnZhbHVlLW9mIHNlbGVjdD0iYXJyYXk6ZmxhdHRlbigkc29ydGVkKSIgc2VwYXJhdG9yPSIgIi8-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGRhdGEvPg&version=3.0"
---

## Description

`array:sort()` returns a new array whose members are in ascending order, determined by the sort key and collation. When no key function is supplied, members are compared directly using the default collation for strings or natural ordering for numbers and other atomic types. When a key function is supplied, it is applied to each member to derive the sort key; members are then sorted by their keys.

This function is the array equivalent of `sort()` for sequences or `xsl:sort` in templates. It does not modify the input array; it always returns a new one.

The `collation` argument controls string comparison. The `key-function` takes a single argument (the array member, which is a sequence) and returns an atomic value to use as the sort key.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `array` | array(*) | Yes | The input array to sort. |
| `collation` | xs:string? | No | URI of the collation to use for string comparison. Empty sequence uses the default. |
| `key-function` | function(item()*) as xs:anyAtomicType* | No | A function that extracts the sort key from each member. |

## Return value

`array(*)` — a new array with the same members in sorted order.

## Examples

### Sorting numbers in ascending order

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:array="http://www.w3.org/2005/xpath-functions/array">
  <xsl:output method="text"/>

  <xsl:template match="/">
    <xsl:variable name="nums" select="[5, 2, 8, 1, 9, 3]"/>
    <xsl:variable name="sorted" select="array:sort($nums)"/>
    <xsl:value-of select="array:flatten($sorted)" separator=" "/>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```
1 2 3 5 8 9
```

### Sorting records by a key field

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
  xmlns:array="http://www.w3.org/2005/xpath-functions/array"
  xmlns:map="http://www.w3.org/2005/xpath-functions/map">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/data">
    <xsl:variable name="people" select="[
      map{'name': 'Charlie', 'age': 35},
      map{'name': 'Alice', 'age': 28},
      map{'name': 'Bob', 'age': 42}
    ]"/>
    <xsl:variable name="by-name" select="array:sort($people, (), function($p) { map:get($p, 'name') })"/>
    <sorted>
      <xsl:for-each select="1 to array:size($by-name)">
        <xsl:variable name="p" select="array:get($by-name, .)"/>
        <person name="{map:get($p, 'name')}" age="{map:get($p, 'age')}"/>
      </xsl:for-each>
    </sorted>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<sorted>
  <person name="Alice" age="28"/>
  <person name="Bob" age="42"/>
  <person name="Charlie" age="35"/>
</sorted>
```

## Notes

- `array:sort()` always sorts in ascending order. To sort in descending order, reverse the result with `array:reverse()`.
- The collation argument may be `()` (empty sequence) to use the default collation, allowing the key function to be specified without supplying a collation.
- Members that are sequences are compared by their atomized value; members that cannot be compared raise a type error.
- An empty array returns an empty array.

## See also

- [array:filter()](../xpath-array-filter)
- [array:for-each()](../xpath-array-for-each)
- [array:reverse()](../xpath-array-reverse)
- [sort()](../xpath-sort)
