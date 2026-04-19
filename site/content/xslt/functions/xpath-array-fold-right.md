---
title: "array:fold-right()"
description: "Accumulates a result by applying a function to each array member from right to left, starting with a seed value."
date: 2026-04-19T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "array function"
syntax: "array:fold-right(array, zero, function)"
tags: ["xslt", "reference", "xslt3", "xpath"]
---

## Description

`array:fold-right()` traverses an array from its last member to its first, threading an accumulator through each step. For each member the supplied function is called with the current member and the current accumulator; its return value becomes the accumulator for the next (earlier) member. The final accumulator value after processing the first member is returned.

When the array is empty the `zero` seed is returned unchanged. The key distinction from `array:fold-left()` is the traversal direction and the argument order to the function: the member comes first, then the accumulator. This matters for operations that are not commutative, such as building a prefix string or constructing a right-associated structure.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `array` | `array(*)` | Yes | The array to fold. |
| `zero` | `item()*` | Yes | The initial accumulator value, returned as-is when the array is empty. |
| `function` | `function(item()*, item()*) as item()*` | Yes | A function taking `(member, accumulator)` and returning the new accumulator. |

## Return value

`item()*` — the final accumulated result after processing all members from right to left.

## Examples

### Concatenating strings in reverse accumulation order

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
    <xsl:variable name="words" select="['one', 'two', 'three', 'four']"/>

    <!-- fold-left: processes left to right, acc comes first -->
    <xsl:variable name="left-result"
      select="array:fold-left($words, '',
              function($acc, $v) { if ($acc='') then $v else concat($acc, ' > ', $v) })"/>

    <!-- fold-right: processes right to left, member comes first -->
    <xsl:variable name="right-result"
      select="array:fold-right($words, '',
              function($v, $acc) { if ($acc='') then $v else concat($v, ' > ', $acc) })"/>

    <result>
      <fold-left><xsl:value-of select="$left-result"/></fold-left>
      <fold-right><xsl:value-of select="$right-result"/></fold-right>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <fold-left>one &gt; two &gt; three &gt; four</fold-left>
  <fold-right>one &gt; two &gt; three &gt; four</fold-right>
</result>
```

### Building a nested XML structure from right to left

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<path>
  <step>root</step>
  <step>section</step>
  <step>paragraph</step>
</path>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:array="http://www.w3.org/2005/xpath-functions/array">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/path">
    <xsl:variable name="steps"
      select="array:join(for $s in step return [string($s)])"/>
    <!-- Build breadcrumb from right: innermost processed first -->
    <xsl:variable name="breadcrumb"
      select="array:fold-right($steps, 'END',
              function($step, $acc) { concat($step, ' / ', $acc) })"/>
    <breadcrumb><xsl:value-of select="$breadcrumb"/></breadcrumb>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<breadcrumb>root / section / paragraph / END</breadcrumb>
```

## Notes

- The function signature for `array:fold-right()` is `function(member, accumulator)`, while `array:fold-left()` uses `function(accumulator, member)`. Confusing the argument order is a common mistake.
- For commutative operations (addition, min, max) the fold direction produces the same result; for string concatenation and list building the direction matters.
- Like all array functions, the operation returns a new value; no existing array is modified.
- The XPath 3.0 sequence function `fold-right()` (without `array:` prefix) is the equivalent for ordinary sequences.

## See also

- [array:fold-left()](../xpath-array-fold-left)
- [array:for-each()](../xpath-array-for-each)
- [array:filter()](../xpath-array-filter)
