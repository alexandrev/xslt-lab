---
title: "filter()"
description: "Returns items from a sequence for which a predicate function returns true, discarding all others."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "higher-order function"
syntax: "filter(sequence, predicate)"
tags: ["xslt", "reference", "xpath", "xslt3"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczp4cz0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiPgoKICA8eHNsOm91dHB1dCBtZXRob2Q9InhtbCIgaW5kZW50PSJ5ZXMiLz4KCiAgPHhzbDp0ZW1wbGF0ZSBtYXRjaD0iLyI-CiAgICA8cmVzdWx0PgogICAgICA8eHNsOnZhcmlhYmxlIG5hbWU9Im51bWJlcnMiIHNlbGVjdD0iMSB0byAxMCIvPgogICAgICA8eHNsOnZhcmlhYmxlIG5hbWU9ImV2ZW5zIiBzZWxlY3Q9ImZpbHRlcigkbnVtYmVycywgZnVuY3Rpb24oJG4pIHsgJG4gbW9kIDIgPSAwIH0pIi8-CiAgICAgIDx4c2w6Zm9yLWVhY2ggc2VsZWN0PSIkZXZlbnMiPgogICAgICAgIDxudW0-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9Ii4iLz48L251bT4KICAgICAgPC94c2w6Zm9yLWVhY2g-CiAgICA8L3Jlc3VsdD4KICA8L3hzbDp0ZW1wbGF0ZT4KPC94c2w6c3R5bGVzaGVldD4&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPG9yZGVycz4KICA8b3JkZXIgaWQ9IjEiIHN0YXR1cz0ic2hpcHBlZCIgYW1vdW50PSI5OS4wMCIvPgogIDxvcmRlciBpZD0iMiIgc3RhdHVzPSJwZW5kaW5nIiBhbW91bnQ9IjQ1LjAwIi8-CiAgPG9yZGVyIGlkPSIzIiBzdGF0dXM9InNoaXBwZWQiIGFtb3VudD0iMTIwLjAwIi8-CiAgPG9yZGVyIGlkPSI0IiBzdGF0dXM9ImNhbmNlbGxlZCIgYW1vdW50PSIzMC4wMCIvPgo8L29yZGVycz4&version=3.0"
---

## Description

`filter()` applies a predicate function to each item in a sequence and returns only those items for which the predicate returns `true`. It is the functional equivalent of an XPath predicate expression but accepts a function item, enabling reusable and composable filtering logic.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sequence` | item()* | Yes | The sequence to filter. |
| `predicate` | function(item()) as xs:boolean | Yes | A function of arity 1 that returns true to keep the item, false to discard it. |

## Return value

`item()*` — the subsequence of items for which the predicate returned `true`, in document order.

## Examples

### Filtering even numbers

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <result>
      <xsl:variable name="numbers" select="1 to 10"/>
      <xsl:variable name="evens" select="filter($numbers, function($n) { $n mod 2 = 0 })"/>
      <xsl:for-each select="$evens">
        <num><xsl:value-of select="."/></num>
      </xsl:for-each>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <num>2</num>
  <num>4</num>
  <num>6</num>
  <num>8</num>
  <num>10</num>
</result>
```

### Filtering XML nodes by attribute value

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<orders>
  <order id="1" status="shipped" amount="99.00"/>
  <order id="2" status="pending" amount="45.00"/>
  <order id="3" status="shipped" amount="120.00"/>
  <order id="4" status="cancelled" amount="30.00"/>
</orders>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/orders">
    <xsl:variable name="shipped"
      select="filter(order, function($o) { $o/@status = 'shipped' })"/>
    <shipped-orders total="{sum($shipped/@amount)}">
      <xsl:copy-of select="$shipped"/>
    </shipped-orders>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<shipped-orders total="219">
  <order id="1" status="shipped" amount="99.00"/>
  <order id="3" status="shipped" amount="120.00"/>
</shipped-orders>
```

## Notes

- The predicate function must return `xs:boolean`; effective boolean value (EBV) is not applied automatically.
- `filter()` preserves the original sequence order.
- Composable with `for-each()`, `fold-left()`, and `sort()` for pipeline-style data transformation.
- For arrays, use `array:filter()` which operates on array members rather than a flat sequence.

## See also

- [for-each()](../xpath-for-each)
- [fold-left()](../xpath-fold-left)
- [fold-right()](../xpath-fold-right)
- [for-each-pair()](../xpath-for-each-pair)
- [array:filter()](../xpath-array-filter)
