---
title: "array:reverse()"
description: "Returns a new array with the members in reverse order."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "array function"
syntax: "array:reverse(array)"
tags: ["xslt", "reference", "xpath", "xslt3"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczphcnJheT0iaHR0cDovL3d3dy53My5vcmcvMjAwNS94cGF0aC1mdW5jdGlvbnMvYXJyYXkiPgoKICA8eHNsOm91dHB1dCBtZXRob2Q9InhtbCIgaW5kZW50PSJ5ZXMiLz4KCiAgPHhzbDp0ZW1wbGF0ZSBtYXRjaD0iLyI-CiAgICA8eHNsOnZhcmlhYmxlIG5hbWU9Im9yaWdpbmFsIiBzZWxlY3Q9IlsxMCwgMjAsIDMwLCA0MCwgNTBdIi8-CiAgICA8eHNsOnZhcmlhYmxlIG5hbWU9InJldmVyc2VkIiBzZWxlY3Q9ImFycmF5OnJldmVyc2UoJG9yaWdpbmFsKSIvPgogICAgPHJlc3VsdD4KICAgICAgPHhzbDpmb3ItZWFjaCBzZWxlY3Q9IjEgdG8gYXJyYXk6c2l6ZSgkcmV2ZXJzZWQpIj4KICAgICAgICA8bj48eHNsOnZhbHVlLW9mIHNlbGVjdD0iYXJyYXk6Z2V0KCRyZXZlcnNlZCwgLikiLz48L24-CiAgICAgIDwveHNsOmZvci1lYWNoPgogICAgPC9yZXN1bHQ-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHNjb3Jlcz4KICA8cz44ODwvcz48cz40Mjwvcz48cz45NTwvcz48cz42Nzwvcz4KPC9zY29yZXM-&version=3.0"
---

## Description

`array:reverse()` returns a new array whose members are in the reverse order of the input array. The function is a convenience over manual head/tail recursion and operates on the array structure directly, preserving each member as-is (including members that are sequences).

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `array` | array(*) | Yes | The array whose members are to be reversed. |

## Return value

`array(*)` — a new array with members in reverse order; an empty array if the input is empty.

## Examples

### Reversing a simple array

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:array="http://www.w3.org/2005/xpath-functions/array">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="original" select="[10, 20, 30, 40, 50]"/>
    <xsl:variable name="reversed" select="array:reverse($original)"/>
    <result>
      <xsl:for-each select="1 to array:size($reversed)">
        <n><xsl:value-of select="array:get($reversed, .)"/></n>
      </xsl:for-each>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <n>50</n>
  <n>40</n>
  <n>30</n>
  <n>20</n>
  <n>10</n>
</result>
```

### Reversing a sorted array for descending order

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<scores>
  <s>88</s><s>42</s><s>95</s><s>67</s>
</scores>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:array="http://www.w3.org/2005/xpath-functions/array">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/scores">
    <xsl:variable name="nums" select="for $s in s return xs:integer($s)"/>
    <!-- sort ascending then reverse for descending -->
    <xsl:variable name="sorted-asc" select="
      fold-left(sort($nums), [],
        function($acc, $n) { array:append($acc, $n) }
      )"/>
    <xsl:variable name="sorted-desc" select="array:reverse($sorted-asc)"/>
    <ranked>
      <xsl:for-each select="1 to array:size($sorted-desc)">
        <rank pos="{.}"><xsl:value-of select="array:get($sorted-desc, .)"/></rank>
      </xsl:for-each>
    </ranked>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<ranked>
  <rank pos="1">95</rank>
  <rank pos="2">88</rank>
  <rank pos="3">67</rank>
  <rank pos="4">42</rank>
</ranked>
```

## Notes

- `array:reverse()` reverses member order only; individual members (including multi-item sequence members) are not affected internally.
- An empty array returns an empty array without error.
- For sequence reversal (not arrays), use `reverse()`.

## See also

- [array:sort()](../xpath-array-sort)
- [array:subarray()](../xpath-array-subarray)
- [array:head()](../xpath-array-head)
- [array:tail()](../xpath-array-tail)
- [xsl:array](../xsl-array)
