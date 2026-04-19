---
title: "sort()"
description: "Sorts a sequence of items using an optional collation and key function, returning items in ascending order."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "higher-order function"
syntax: "sort(sequence, collation?, key-function?)"
tags: ["xslt", "reference", "xpath", "xslt3"]
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
