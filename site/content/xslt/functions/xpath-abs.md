---
title: "abs()"
description: "Returns the absolute value of a numeric argument, removing any negative sign while preserving the numeric type."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "numeric function"
syntax: "abs(number)"
tags: ["xslt", "reference", "xpath", "xslt2"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczp4cz0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvbWVhc3VyZW1lbnRzIj4KICAgIDxhYnNvbHV0ZXM-CiAgICAgIDx4c2w6Zm9yLWVhY2ggc2VsZWN0PSJ2YWx1ZSI-CiAgICAgICAgPGFicz48eHNsOnZhbHVlLW9mIHNlbGVjdD0iYWJzKHhzOmRlY2ltYWwoLikpIi8-PC9hYnM-CiAgICAgIDwveHNsOmZvci1lYWNoPgogICAgPC9hYnNvbHV0ZXM-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPG1lYXN1cmVtZW50cz4KICA8dmFsdWU-LTQyPC92YWx1ZT4KICA8dmFsdWU-MTc8L3ZhbHVlPgogIDx2YWx1ZT4tMy4xNDwvdmFsdWU-CjwvbWVhc3VyZW1lbnRzPg&version=2.0"
---

## Description

`abs()` returns the absolute (non-negative) value of its argument. The result has the same type as the input: `xs:integer` in gives `xs:integer` out, `xs:double` in gives `xs:double` out. If the argument is the empty sequence, the empty sequence is returned.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `number` | xs:numeric? | Yes | The numeric value whose absolute value is required. |

## Return value

`xs:numeric?` — same type and precision as the input, but non-negative. Returns the empty sequence if the argument is the empty sequence.

## Examples

### Absolute value of a negative attribute

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<measurements>
  <value>-42</value>
  <value>17</value>
  <value>-3.14</value>
</measurements>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/measurements">
    <absolutes>
      <xsl:for-each select="value">
        <abs><xsl:value-of select="abs(xs:decimal(.))"/></abs>
      </xsl:for-each>
    </absolutes>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<absolutes>
  <abs>42</abs>
  <abs>17</abs>
  <abs>3.14</abs>
</absolutes>
```

### Computing deviation from a target value

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/measurements">
    <deviations>
      <xsl:variable name="target" select="xs:decimal(10)"/>
      <xsl:for-each select="value">
        <deviation><xsl:value-of select="abs(xs:decimal(.) - $target)"/></deviation>
      </xsl:for-each>
    </deviations>
  </xsl:template>
</xsl:stylesheet>
```

**Output (for values -42, 17, -3.14 against target 10):**
```xml
<deviations>
  <deviation>52</deviation>
  <deviation>7</deviation>
  <deviation>13.14</deviation>
</deviations>
```

## Notes

- `abs()` is defined in XPath 2.0 and is not available in XSLT 1.0. In XSLT 1.0, absolute value required a workaround such as `translate(., '-', '')` or a conditional expression.
- The function preserves numeric type: `abs(xs:float(-1.0))` returns `xs:float(1.0)`.
- `abs(xs:double('NaN'))` returns `NaN`; `abs(xs:double('-INF'))` returns `INF`.

## See also

- [avg()](../xpath-avg)
- [min()](../xpath-min)
- [max()](../xpath-max)
