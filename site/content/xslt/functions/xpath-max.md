---
title: "max()"
description: "Returns the largest value in a sequence of comparable items, optionally using a named collation for string comparison."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "numeric function"
syntax: "max(sequence, collation?)"
tags: ["xslt", "reference", "xpath", "xslt2"]
---

## Description

`max()` returns the maximum value from a sequence. It works with any orderable atomic type: numeric types, strings, dates, times, and durations. All items in the sequence must be mutually comparable; mixing incompatible types raises a type error.

When comparing strings, an optional collation URI controls ordering rules.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sequence` | xs:anyAtomicType* | Yes | Sequence of comparable values. |
| `collation` | xs:string | No | Collation URI used for string comparison. Defaults to the default collation. |

## Return value

`xs:anyAtomicType?` — the largest item in the sequence according to the `gt` operator, or the empty sequence if the input is empty.

## Examples

### Maximum numeric value

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<prices>
  <price>29.99</price>
  <price>149.00</price>
  <price>9.50</price>
  <price>74.95</price>
</prices>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/prices">
    <result>
      <max-price><xsl:value-of select="max(price/xs:decimal(.))"/></max-price>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <max-price>149.00</max-price>
</result>
```

### Latest date in a list

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<deadlines>
  <deadline>2026-05-01</deadline>
  <deadline>2026-04-15</deadline>
  <deadline>2026-06-30</deadline>
</deadlines>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/deadlines">
    <final-deadline>
      <xsl:value-of select="max(deadline/xs:date(.))"/>
    </final-deadline>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<final-deadline>2026-06-30</final-deadline>
```

## Notes

- Returns the empty sequence (not an error) when the input sequence is empty.
- `NaN` propagates: if any item is `xs:double('NaN')`, the result is `NaN`.
- The collation parameter is only meaningful for string sequences.
- Equivalent to sorting descending and taking the first item, but more concise and efficient.

## See also

- [min()](../xpath-min)
- [avg()](../xpath-avg)
- [abs()](../xpath-abs)
