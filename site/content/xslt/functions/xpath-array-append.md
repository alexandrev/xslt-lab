---
title: "array:append()"
description: "Returns a new array with an additional member appended at the end."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "array function"
syntax: "array:append(array, appendage)"
tags: ["xslt", "reference", "xpath", "xslt3"]
---

## Description

`array:append()` returns a new array that is a copy of the input array with the `appendage` value added as a new final member. The appendage is added as a single member regardless of whether it is a sequence, making it distinct from `array:join()` which concatenates arrays.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `array` | array(*) | Yes | The source array. |
| `appendage` | item()* | Yes | The value to add as the new last member. |

## Return value

`array(*)` — a new array with `array:size()` increased by 1.

## Examples

### Building an array by appending

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:array="http://www.w3.org/2005/xpath-functions/array">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="base"  select="['alpha', 'beta']"/>
    <xsl:variable name="plus1" select="array:append($base, 'gamma')"/>
    <xsl:variable name="plus2" select="array:append($plus1, 'delta')"/>
    <result size="{array:size($plus2)}">
      <xsl:for-each select="1 to array:size($plus2)">
        <item><xsl:value-of select="array:get($plus2, .)"/></item>
      </xsl:for-each>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result size="4">
  <item>alpha</item>
  <item>beta</item>
  <item>gamma</item>
  <item>delta</item>
</result>
```

### Accumulating results into an array with fold-left

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<scores>
  <score>85</score>
  <score>92</score>
  <score>78</score>
  <score>96</score>
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
    <xsl:variable name="arr" select="fold-left(score, [],
      function($acc, $s) { array:append($acc, xs:integer($s)) }
    )"/>
    <stats>
      <count><xsl:value-of select="array:size($arr)"/></count>
      <max><xsl:value-of select="max(array:flatten($arr))"/></max>
    </stats>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<stats>
  <count>4</count>
  <max>96</max>
</stats>
```

## Notes

- The `appendage` is added as a single member; if it is a sequence `(1,2)`, the new member is that two-item sequence, not two separate members.
- To concatenate two arrays end-to-end, use `array:join(($arr1, $arr2))`.
- Arrays are immutable; `array:append()` always returns a new array.

## See also

- [array:join()](../xpath-array-join)
- [array:insert-before()](../xpath-array-insert-before)
- [array:remove()](../xpath-array-remove)
- [array:size()](../xpath-array-size)
- [xsl:array](../xsl-array)
- [xsl:array-member](../xsl-array-member)
