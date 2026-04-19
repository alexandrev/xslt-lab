---
title: "array:fold-left()"
description: "Accumulates a result by applying a function to each array member from left to right, starting with a seed value."
date: 2026-04-19T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "array function"
syntax: "array:fold-left(array, zero, function)"
tags: ["xslt", "reference", "xslt3", "xpath"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczp4cz0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiCiAgeG1sbnM6YXJyYXk9Imh0dHA6Ly93d3cudzMub3JnLzIwMDUveHBhdGgtZnVuY3Rpb25zL2FycmF5Ij4KCiAgPHhzbDpvdXRwdXQgbWV0aG9kPSJ4bWwiIGluZGVudD0ieWVzIi8-CgogIDx4c2w6dGVtcGxhdGUgbWF0Y2g9Ii8iPgogICAgPHhzbDp2YXJpYWJsZSBuYW1lPSJ2YWx1ZXMiIHNlbGVjdD0iWzEwLCAzLCA3LCA0LCA2XSIvPgogICAgPHhzbDp2YXJpYWJsZSBuYW1lPSJzdW0iCiAgICAgIHNlbGVjdD0iYXJyYXk6Zm9sZC1sZWZ0KCR2YWx1ZXMsIDAsIGZ1bmN0aW9uKCRhY2MsICR2KSB7ICRhY2MgKyAkdiB9KSIvPgogICAgPHhzbDp2YXJpYWJsZSBuYW1lPSJtYXgiCiAgICAgIHNlbGVjdD0iYXJyYXk6Zm9sZC1sZWZ0KCR2YWx1ZXMsIGFycmF5OmdldCgkdmFsdWVzLDEpLAogICAgICAgICAgICAgIGZ1bmN0aW9uKCRhY2MsICR2KSB7IGlmICgkdiBndCAkYWNjKSB0aGVuICR2IGVsc2UgJGFjYyB9KSIvPgogICAgPHJlc3VsdD4KICAgICAgPHN1bT48eHNsOnZhbHVlLW9mIHNlbGVjdD0iJHN1bSIvPjwvc3VtPgogICAgICA8bWF4Pjx4c2w6dmFsdWUtb2Ygc2VsZWN0PSIkbWF4Ii8-PC9tYXg-CiAgICA8L3Jlc3VsdD4KICA8L3hzbDp0ZW1wbGF0ZT4KPC94c2w6c3R5bGVzaGVldD4&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGRhdGEvPg&version=3.0"
---

## Description

`array:fold-left()` processes an array from its first member to its last, threading an accumulator through each step. For each member, the supplied function is called with the current accumulator value and the current member; its return value becomes the accumulator for the next step. After all members have been processed, the final accumulator value is returned.

When the array is empty, the `zero` (seed) value is returned unchanged without calling the function. This mirrors the mathematical notion of a left fold and is equivalent to the XPath 3.0 `fold-left()` function applied to sequences.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `array` | `array(*)` | Yes | The array to fold. |
| `zero` | `item()*` | Yes | The initial accumulator value, returned as-is when the array is empty. |
| `function` | `function(item()*, item()*) as item()*` | Yes | A function taking `(accumulator, member)` and returning the new accumulator. |

## Return value

`item()*` — the final accumulated result after processing all members.

## Examples

### Summing an array of numbers

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
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:array="http://www.w3.org/2005/xpath-functions/array">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="values" select="[10, 3, 7, 4, 6]"/>
    <xsl:variable name="sum"
      select="array:fold-left($values, 0, function($acc, $v) { $acc + $v })"/>
    <xsl:variable name="max"
      select="array:fold-left($values, array:get($values,1),
              function($acc, $v) { if ($v gt $acc) then $v else $acc })"/>
    <result>
      <sum><xsl:value-of select="$sum"/></sum>
      <max><xsl:value-of select="$max"/></max>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <sum>30</sum>
  <max>10</max>
</result>
```

### Building a CSV line from an array of strings

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<record>
  <field>Alice</field>
  <field>Engineering</field>
  <field>London</field>
</record>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:array="http://www.w3.org/2005/xpath-functions/array">

  <xsl:output method="text"/>

  <xsl:template match="/record">
    <xsl:variable name="fields"
      select="array:join(for $f in field return [string($f)])"/>
    <xsl:variable name="csv"
      select="array:fold-left(
        $fields,
        '',
        function($acc, $v) {
          if ($acc = '') then $v else concat($acc, ',', $v)
        }
      )"/>
    <xsl:value-of select="$csv"/>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```
Alice,Engineering,London
```

## Notes

- `array:fold-left()` and `array:fold-right()` differ in the direction of traversal, which matters for non-commutative operations such as string concatenation or subtraction.
- The zero value type must be compatible with the accumulator type expected by the function; Saxon enforces type consistency at runtime.
- For very large arrays, folding is generally more efficient than recursive template calls because it avoids XSL overhead.
- The XPath 3.0 `fold-left()` function (without the `array:` prefix) performs the same operation over sequences rather than arrays.

## See also

- [array:fold-right()](../xpath-array-fold-right)
- [array:for-each()](../xpath-array-for-each)
- [array:filter()](../xpath-array-filter)
- [array:size()](../xpath-array-size)
