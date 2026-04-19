---
title: "fold-right()"
description: "Accumulates a result by applying a function right-to-left over a sequence, starting from an initial zero value."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "higher-order function"
syntax: "fold-right(sequence, zero, function)"
tags: ["xslt", "reference", "xpath", "xslt3"]
---

## Description

`fold-right()` (also called a right reduce) processes a sequence from right to left. It begins with an initial accumulator value (`zero`) and repeatedly applies a binary function that combines the current item with the accumulated result. This produces different results from `fold-left()` for non-associative operations.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sequence` | item()* | Yes | The sequence to fold over. |
| `zero` | item()* | Yes | The initial accumulator value (rightmost identity). |
| `function` | function(item(), item()*) as item()* | Yes | A binary function: (currentItem, accumulator) → newAccumulator. |

## Return value

`item()*` — the final accumulated value after processing all items from right to left.

## Examples

### Right-fold to build a nested structure

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">

  <xsl:output method="text"/>

  <xsl:template match="/">
    <!-- fold-right builds: cons(1, cons(2, cons(3, nil))) -->
    <xsl:variable name="items" select="(1, 2, 3)"/>
    <xsl:value-of select="fold-right($items, 'nil',
      function($item, $acc) { 'cons(' || $item || ', ' || $acc || ')' }
    )"/>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```
cons(1, cons(2, cons(3, nil)))
```

### Reversing a sequence with fold-right

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="items" select="('a', 'b', 'c', 'd')"/>
    <xsl:variable name="reversed" select="
      fold-right($items, (),
        function($item, $acc) { ($acc, $item) }
      )"/>
    <result>
      <xsl:for-each select="$reversed">
        <item><xsl:value-of select="."/></item>
      </xsl:for-each>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <item>d</item>
  <item>c</item>
  <item>b</item>
  <item>a</item>
</result>
```

## Notes

- The function signature for `fold-right()` is `f(item, accumulator)` — note the argument order is reversed compared to `fold-left()`.
- For commutative operations (sum, product), `fold-left()` and `fold-right()` produce identical results.
- If the sequence is empty, the `zero` value is returned unchanged.
- For array-based right folding, use `array:fold-right()`.

## See also

- [fold-left()](../xpath-fold-left)
- [for-each()](../xpath-for-each)
- [filter()](../xpath-filter)
- [for-each-pair()](../xpath-for-each-pair)
- [array:fold-right()](../xpath-array-fold-right)
