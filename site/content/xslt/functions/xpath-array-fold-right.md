---
title: "array:fold-right()"
description: "Accumulates a result by applying a function to each array member from right to left, starting with a seed value."
date: 2026-04-19T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "array function"
syntax: "array:fold-right(array, zero, function)"
tags: ["xslt", "reference", "xslt3", "xpath"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczphcnJheT0iaHR0cDovL3d3dy53My5vcmcvMjAwNS94cGF0aC1mdW5jdGlvbnMvYXJyYXkiPgoKICA8eHNsOm91dHB1dCBtZXRob2Q9InhtbCIgaW5kZW50PSJ5ZXMiLz4KCiAgPHhzbDp0ZW1wbGF0ZSBtYXRjaD0iLyI-CiAgICA8eHNsOnZhcmlhYmxlIG5hbWU9IndvcmRzIiBzZWxlY3Q9Ilsnb25lJywgJ3R3bycsICd0aHJlZScsICdmb3VyJ10iLz4KCiAgICA8IS0tIGZvbGQtbGVmdDogcHJvY2Vzc2VzIGxlZnQgdG8gcmlnaHQsIGFjYyBjb21lcyBmaXJzdCAtLT4KICAgIDx4c2w6dmFyaWFibGUgbmFtZT0ibGVmdC1yZXN1bHQiCiAgICAgIHNlbGVjdD0iYXJyYXk6Zm9sZC1sZWZ0KCR3b3JkcywgJycsCiAgICAgICAgICAgICAgZnVuY3Rpb24oJGFjYywgJHYpIHsgaWYgKCRhY2M9JycpIHRoZW4gJHYgZWxzZSBjb25jYXQoJGFjYywgJyA-ICcsICR2KSB9KSIvPgoKICAgIDwhLS0gZm9sZC1yaWdodDogcHJvY2Vzc2VzIHJpZ2h0IHRvIGxlZnQsIG1lbWJlciBjb21lcyBmaXJzdCAtLT4KICAgIDx4c2w6dmFyaWFibGUgbmFtZT0icmlnaHQtcmVzdWx0IgogICAgICBzZWxlY3Q9ImFycmF5OmZvbGQtcmlnaHQoJHdvcmRzLCAnJywKICAgICAgICAgICAgICBmdW5jdGlvbigkdiwgJGFjYykgeyBpZiAoJGFjYz0nJykgdGhlbiAkdiBlbHNlIGNvbmNhdCgkdiwgJyA-ICcsICRhY2MpIH0pIi8-CgogICAgPHJlc3VsdD4KICAgICAgPGZvbGQtbGVmdD48eHNsOnZhbHVlLW9mIHNlbGVjdD0iJGxlZnQtcmVzdWx0Ii8-PC9mb2xkLWxlZnQ-CiAgICAgIDxmb2xkLXJpZ2h0Pjx4c2w6dmFsdWUtb2Ygc2VsZWN0PSIkcmlnaHQtcmVzdWx0Ii8-PC9mb2xkLXJpZ2h0PgogICAgPC9yZXN1bHQ-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGRhdGEvPg&version=3.0"
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
