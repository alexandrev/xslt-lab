---
title: "array:flatten()"
description: "Recursively flattens nested arrays into a single flat sequence of atomic items and nodes."
date: 2026-04-19T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "array function"
syntax: "array:flatten(items)"
tags: ["xslt", "reference", "xslt3", "xpath"]
---

## Description

`array:flatten()` takes a sequence of items that may contain arrays—including arrays nested inside arrays—and returns a flat sequence in which every array has been dissolved. Non-array items (strings, integers, nodes, maps, etc.) pass through unchanged; only array wrappers are removed.

The recursion is unbounded: a three-level-deep nesting such as `[[1, [2, 3]], [4]]` is fully flattened to `(1, 2, 3, 4)`. This makes `array:flatten()` useful when assembling arrays incrementally or when consuming data structures of unknown depth.

Note that the result is a **sequence**, not an array. Wrap it in `array:join()` if an array is required.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `items` | `item()*` | Yes | A sequence of items, which may include arrays at any depth of nesting. |

## Return value

`item()*` — a flat sequence with all array wrappers removed. Maps are not unwrapped; only arrays are affected.

## Examples

### Flattening nested integer arrays

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

  <xsl:template match="/">
    <xsl:variable name="nested" select="[[1, 2], [3, [4, 5]], [6]]"/>
    <xsl:variable name="flat" select="array:flatten($nested)"/>
    <result>
      <flat><xsl:value-of select="$flat" separator=", "/></flat>
      <sum><xsl:value-of select="sum($flat)"/></sum>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <flat>1, 2, 3, 4, 5, 6</flat>
  <sum>21</sum>
</result>
```

### Normalising a heterogeneous collection before processing

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <group id="A">
    <item>alpha</item>
    <item>beta</item>
  </group>
  <group id="B">
    <item>gamma</item>
  </group>
</catalog>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:array="http://www.w3.org/2005/xpath-functions/array">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/catalog">
    <!-- Build one sub-array per group, then wrap them all -->
    <xsl:variable name="groups"
      select="array:join(for $g in group return [array:join(for $i in $g/item return [$i])])"/>
    <!-- Flatten the two-level structure into a single sequence -->
    <xsl:variable name="all" select="array:flatten($groups)"/>
    <items count="{count($all)}">
      <xsl:for-each select="$all">
        <item><xsl:value-of select="."/></item>
      </xsl:for-each>
    </items>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<items count="3">
  <item>alpha</item>
  <item>beta</item>
  <item>gamma</item>
</items>
```

## Notes

- Only arrays are unwrapped. Maps, even though they are also XDM structured types, are left intact.
- The function accepts a plain sequence as its argument, not only an array. Items in the sequence that are not arrays pass through unchanged.
- Members that are sequences (e.g. a member holding `(1, 2)`) remain as sequences inside the result because they are not themselves arrays.
- To convert the resulting sequence back into an array, use `array:join()` with individual wrapping: `array:join(for $x in array:flatten($arr) return [$x])`.

## See also

- [array:join()](../xpath-array-join)
- [array:for-each()](../xpath-array-for-each)
- [array:fold-left()](../xpath-array-fold-left)
