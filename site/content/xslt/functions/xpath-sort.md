---
title: "sort()"
description: "Sorts a sequence of items using an optional collation and key function, returning items in ascending order."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "higher-order function"
syntax: "sort(sequence, collation?, key-function?)"
tags: ["xslt", "reference", "xpath", "xslt3"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczp4cz0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiPgoKICA8eHNsOm91dHB1dCBtZXRob2Q9InhtbCIgaW5kZW50PSJ5ZXMiLz4KCiAgPHhzbDp0ZW1wbGF0ZSBtYXRjaD0iLyI-CiAgICA8cmVzdWx0PgogICAgICA8eHNsOnZhcmlhYmxlIG5hbWU9ImZydWl0cyIgc2VsZWN0PSIoJ2JhbmFuYScsICdhcHBsZScsICdjaGVycnknLCAnZGF0ZScpIi8-CiAgICAgIDx4c2w6Zm9yLWVhY2ggc2VsZWN0PSJzb3J0KCRmcnVpdHMpIj4KICAgICAgICA8ZnJ1aXQ-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9Ii4iLz48L2ZydWl0PgogICAgICA8L3hzbDpmb3ItZWFjaD4KICAgIDwvcmVzdWx0PgogIDwveHNsOnRlbXBsYXRlPgo8L3hzbDpzdHlsZXNoZWV0Pg&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGVtcGxveWVlcz4KICA8ZW1wbG95ZWUgbmFtZT0iQWxpY2UiIHNhbGFyeT0iNzUwMDAiLz4KICA8ZW1wbG95ZWUgbmFtZT0iQm9iIiAgIHNhbGFyeT0iNTAwMDAiLz4KICA8ZW1wbG95ZWUgbmFtZT0iQ2Fyb2wiIHNhbGFyeT0iOTAwMDAiLz4KPC9lbXBsb3llZXM-&version=3.0"
---

## Description

`sort()` sorts a sequence of items and returns them in ascending order. An optional collation URI controls string comparison, and an optional key function extracts the sort key from each item. This is the functional alternative to `xsl:sort` and can be used directly within XPath expressions.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sequence` | item()* | Yes | The sequence to sort. |
| `collation` | xs:string? | No | URI of the collation to use for string comparison. Defaults to the default collation. |
| `key-function` | function(item()) as xs:anyAtomicType* | No | Function that extracts the sort key from each item. Defaults to identity. |

## Return value

`item()*` — the items in ascending order according to the sort key and collation.

## Examples

### Sorting strings alphabetically

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <result>
      <xsl:variable name="fruits" select="('banana', 'apple', 'cherry', 'date')"/>
      <xsl:for-each select="sort($fruits)">
        <fruit><xsl:value-of select="."/></fruit>
      </xsl:for-each>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <fruit>apple</fruit>
  <fruit>banana</fruit>
  <fruit>cherry</fruit>
  <fruit>date</fruit>
</result>
```

### Sorting XML nodes by a numeric attribute

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<employees>
  <employee name="Alice" salary="75000"/>
  <employee name="Bob"   salary="50000"/>
  <employee name="Carol" salary="90000"/>
</employees>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/employees">
    <sorted>
      <xsl:copy-of select="sort(employee, (), function($e) { xs:integer($e/@salary) })"/>
    </sorted>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<sorted>
  <employee name="Bob"   salary="50000"/>
  <employee name="Alice" salary="75000"/>
  <employee name="Carol" salary="90000"/>
</sorted>
```

## Notes

- Sorting is stable: items with equal keys preserve their original relative order.
- Pass `()` as the collation argument to use the default collation while still providing a key function.
- For descending sort in XPath expressions, use `reverse(sort(...))`.
- `sort()` is also available as `array:sort()` for sorting array members.
- In XSLT templates, `xsl:sort` inside `xsl:for-each` or `xsl:apply-templates` remains an alternative.

## See also

- [for-each()](../xpath-for-each)
- [filter()](../xpath-filter)
- [fold-left()](../xpath-fold-left)
- [array:sort()](../xpath-array-sort)
