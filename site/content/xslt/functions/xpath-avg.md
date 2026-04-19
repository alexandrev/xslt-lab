---
title: "avg()"
description: "Returns the arithmetic mean of a sequence of numeric values, or the empty sequence if the input is empty."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "numeric function"
syntax: "avg(sequence)"
tags: ["xslt", "reference", "xpath", "xslt2"]
---

## Description

`avg()` computes the arithmetic mean of all values in a sequence. All items in the sequence must be of a common numeric type (or castable to one). If the sequence is empty, the empty sequence is returned rather than an error.

Duration types (`xs:yearMonthDuration`, `xs:dayTimeDuration`) are also supported.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sequence` | xs:anyAtomicType* | Yes | A sequence of numeric or duration values to average. |

## Return value

`xs:anyAtomicType?` — the arithmetic mean of the values, using the promoted common type of the sequence items. Returns the empty sequence when the input is empty.

## Examples

### Average of element values

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<scores>
  <score>85</score>
  <score>92</score>
  <score>78</score>
  <score>95</score>
</scores>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/scores">
    <result>
      <average><xsl:value-of select="avg(score/xs:integer(.))"/></average>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <average>87.5</average>
</result>
```

### Average with grouped data

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<sales>
  <sale region="north" amount="100"/>
  <sale region="south" amount="200"/>
  <sale region="north" amount="150"/>
  <sale region="south" amount="180"/>
</sales>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/sales">
    <averages>
      <xsl:for-each-group select="sale" group-by="@region">
        <region name="{current-grouping-key()}">
          <avg><xsl:value-of select="avg(current-group()/xs:decimal(@amount))"/></avg>
        </region>
      </xsl:for-each-group>
    </averages>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<averages>
  <region name="north"><avg>125</avg></region>
  <region name="south"><avg>190</avg></region>
</averages>
```

## Notes

- All items in the sequence must be of a compatible numeric type. Mixing `xs:integer` and `xs:string` raises a type error.
- `avg()` is not available in XSLT 1.0. Use `sum() div count()` as a 1.0 equivalent.
- For an empty sequence, the function returns the empty sequence (not `NaN` or zero).

## See also

- [abs()](../xpath-abs)
- [min()](../xpath-min)
- [max()](../xpath-max)
- [sum()](../xpath-sum)
