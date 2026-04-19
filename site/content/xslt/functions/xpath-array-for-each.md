---
title: "array:for-each()"
description: "Returns a new array where each member is the result of applying the function to the corresponding member of the input array."
date: 2026-04-19T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "array function"
syntax: "array:for-each(array, function)"
tags: ["xslt", "reference", "xpath", "xslt3"]
---

## Description

`array:for-each()` applies a function to each member of an array and returns a new array of the same size, where each member is the result of the function applied to the corresponding input member. The original array is not modified.

The function argument takes a single parameter: the current array member, which is a sequence. The function may return any XDM value — a single item, a sequence, or even an empty sequence — and the result becomes the corresponding member of the output array.

`array:for-each()` is the array equivalent of the sequence-level `for-each()` higher-order function, but it preserves array structure rather than flattening to a sequence.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `array` | array(*) | Yes | The input array. |
| `function` | function(item()*) as item()* | Yes | A function applied to each member. |

## Return value

`array(*)` — a new array of the same size as the input, with each member replaced by the function result.

## Examples

### Squaring each element

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:array="http://www.w3.org/2005/xpath-functions/array">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="nums" select="[1, 2, 3, 4, 5]"/>
    <xsl:variable name="squared" select="array:for-each($nums, function($n) { $n * $n })"/>
    <squares>
      <xsl:for-each select="1 to array:size($squared)">
        <val><xsl:value-of select="array:get($squared, .)"/></val>
      </xsl:for-each>
    </squares>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<squares>
  <val>1</val>
  <val>4</val>
  <val>9</val>
  <val>16</val>
  <val>25</val>
</squares>
```

### Uppercasing string members

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
    <xsl:variable name="words" select="['alpha', 'beta', 'gamma']"/>
    <xsl:variable name="upper" select="array:for-each($words, upper-case#1)"/>
    <words>
      <xsl:for-each select="1 to array:size($upper)">
        <word><xsl:value-of select="array:get($upper, .)"/></word>
      </xsl:for-each>
    </words>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<words>
  <word>ALPHA</word>
  <word>BETA</word>
  <word>GAMMA</word>
</words>
```

## Notes

- `array:for-each()` always produces a new array of the same size as the input; it cannot drop or add members. Use `array:filter()` to remove members.
- Named functions can be referenced using the function-reference syntax (`name#arity`) as shown in the second example.
- Unlike `array:fold-left()`, `array:for-each()` does not accumulate state across members; each call is independent.
- An empty array produces an empty array.

## See also

- [array:filter()](../xpath-array-filter)
- [array:fold-left()](../xpath-array-fold-left)
- [array:for-each-pair()](../xpath-array-for-each-pair)
- [array:flatten()](../xpath-array-flatten)
