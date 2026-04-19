---
title: "for-each()"
description: "Applies a function to each item of a sequence and returns the concatenation of all results."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "higher-order function"
syntax: "for-each(sequence, function)"
tags: ["xslt", "reference", "xpath", "xslt3"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczp4cz0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiPgoKICA8eHNsOm91dHB1dCBtZXRob2Q9InhtbCIgaW5kZW50PSJ5ZXMiLz4KCiAgPHhzbDp0ZW1wbGF0ZSBtYXRjaD0iLyI-CiAgICA8cmVzdWx0PgogICAgICA8eHNsOnZhcmlhYmxlIG5hbWU9IndvcmRzIiBzZWxlY3Q9IignYXBwbGUnLCAnYmFuYW5hJywgJ2NoZXJyeScpIi8-CiAgICAgIDx4c2w6dmFyaWFibGUgbmFtZT0idXBwZXIiIHNlbGVjdD0iZm9yLWVhY2goJHdvcmRzLCB1cHBlci1jYXNlIzEpIi8-CiAgICAgIDx4c2w6Zm9yLWVhY2ggc2VsZWN0PSIkdXBwZXIiPgogICAgICAgIDx3b3JkPjx4c2w6dmFsdWUtb2Ygc2VsZWN0PSIuIi8-PC93b3JkPgogICAgICA8L3hzbDpmb3ItZWFjaD4KICAgIDwvcmVzdWx0PgogIDwveHNsOnRlbXBsYXRlPgo8L3hzbDpzdHlsZXNoZWV0Pg&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHByb2R1Y3RzPgogIDxwcm9kdWN0IGlkPSJwMSIgcHJpY2U9IjEwLjAwIi8-CiAgPHByb2R1Y3QgaWQ9InAyIiBwcmljZT0iMjUuNTAiLz4KICA8cHJvZHVjdCBpZD0icDMiIHByaWNlPSI1Ljk5Ii8-CjwvcHJvZHVjdHM-&version=3.0"
---

## Description

`for-each()` iterates over a sequence and applies a unary function to each item, returning a new sequence that is the concatenation of all individual results. It is the functional equivalent of `xsl:for-each` but operates as an XPath expression, making it composable with other higher-order functions.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sequence` | item()* | Yes | The sequence of items to iterate over. |
| `function` | function(item()) as item()* | Yes | A function of arity 1 applied to each item. |

## Return value

`item()*` — the concatenated results of applying the function to each item.

## Examples

### Converting a sequence of strings to upper case

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <result>
      <xsl:variable name="words" select="('apple', 'banana', 'cherry')"/>
      <xsl:variable name="upper" select="for-each($words, upper-case#1)"/>
      <xsl:for-each select="$upper">
        <word><xsl:value-of select="."/></word>
      </xsl:for-each>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <word>APPLE</word>
  <word>BANANA</word>
  <word>CHERRY</word>
</result>
```

### Extracting attributes from nodes using for-each()

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<products>
  <product id="p1" price="10.00"/>
  <product id="p2" price="25.50"/>
  <product id="p3" price="5.99"/>
</products>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/products">
    <xsl:variable name="prices"
      select="for-each(product, function($p) { xs:decimal($p/@price) })"/>
    <summary>
      <total><xsl:value-of select="sum($prices)"/></total>
      <max><xsl:value-of select="max($prices)"/></max>
    </summary>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<summary>
  <total>41.49</total>
  <max>25.50</max>
</summary>
```

## Notes

- `for-each()` is an XPath function and must not be confused with the `xsl:for-each` instruction.
- The function must accept exactly one argument.
- Results from each invocation are concatenated into a flat sequence; use `array:for-each()` if you need to preserve array structure.
- Composable with `filter()`, `fold-left()`, and `sort()` for pipeline-style processing.

## See also

- [filter()](../xpath-filter)
- [fold-left()](../xpath-fold-left)
- [fold-right()](../xpath-fold-right)
- [for-each-pair()](../xpath-for-each-pair)
- [array:for-each()](../xpath-array-for-each)
