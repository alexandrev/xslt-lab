---
title: "min()"
description: "Returns the smallest value in a sequence of comparable items, optionally using a named collation for string comparison."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "numeric function"
syntax: "min(sequence, collation?)"
tags: ["xslt", "reference", "xpath", "xslt2"]
---

## Description

`min()` returns the minimum value from a sequence. It works with any orderable atomic type: numeric types, strings, dates, times, and durations. All items in the sequence must be mutually comparable; mixing incompatible types raises an error.

When comparing strings, an optional collation URI controls ordering rules.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sequence` | xs:anyAtomicType* | Yes | Sequence of comparable values. |
| `collation` | xs:string | No | Collation URI used for string comparison. Defaults to the default collation. |

## Return value

`xs:anyAtomicType?` — the smallest item in the sequence according to the `lt` operator, or the empty sequence if the input is empty.

## Examples

### Minimum numeric value

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<temperatures>
  <temp>23.5</temp>
  <temp>18.0</temp>
  <temp>31.2</temp>
  <temp>15.7</temp>
</temperatures>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/temperatures">
    <result>
      <min-temp><xsl:value-of select="min(temp/xs:decimal(.))"/></min-temp>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <min-temp>15.7</min-temp>
</result>
```

### Earliest date in a sequence

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<events>
  <event date="2026-06-15">Summer conference</event>
  <event date="2026-03-01">Spring kickoff</event>
  <event date="2026-11-20">Year-end review</event>
</events>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/events">
    <earliest>
      <xsl:value-of select="min(event/xs:date(@date))"/>
    </earliest>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<earliest>2026-03-01</earliest>
```

## Notes

- Returns the empty sequence (not an error) when the input sequence is empty.
- `NaN` propagates: if any item is `xs:double('NaN')`, the result is `NaN`.
- Unlike XSLT 1.0 workarounds (`<xsl:sort>` then `[1]`), `min()` is a single expression and works with typed values.
- The collation parameter is meaningful only for string sequences.

## See also

- [max()](../xpath-max)
- [avg()](../xpath-avg)
- [abs()](../xpath-abs)
