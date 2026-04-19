---
title: "round()"
description: "Returns the integer closest to the argument, rounding half-values toward positive infinity (round half up)."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "numeric function"
syntax: "round(number)"
tags: ["xslt", "reference", "xpath", "xslt1"]
---

## Description

`round()` returns the integer nearest to its argument. When the fractional part is exactly `0.5`, XPath 1.0 uses **round-half-up** (toward positive infinity): `round(2.5)` returns `3`, and `round(-2.5)` returns `-2` (not `-3`).

The argument is converted to a number via the same rules as `number()`. If the argument is already an integer, it is returned unchanged. Special values (`NaN`, `Infinity`, `-Infinity`) pass through unmodified.

`round()` is the standard way to obtain a "nearest integer" result in XPath 1.0. It is frequently used to clean up the results of arithmetic expressions before displaying them, or to produce integer offsets for positioning calculations.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `number` | xs:double | Yes | The number to round to the nearest integer. |

## Return value

`xs:double` — the nearest integer, with ties rounded toward positive infinity.

## Examples

### Round calculated averages

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<scores>
  <score>88</score>
  <score>92</score>
  <score>75</score>
</scores>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/scores">
    <xsl:variable name="avg" select="sum(score) div count(score)"/>
    <result>
      <exact-average><xsl:value-of select="$avg"/></exact-average>
      <rounded-average><xsl:value-of select="round($avg)"/></rounded-average>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <exact-average>85</exact-average>
  <rounded-average>85</rounded-average>
</result>
```

### Demonstrate half-up tie-breaking

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<values>
  <v>2.5</v>
  <v>-2.5</v>
  <v>3.4</v>
  <v>3.6</v>
</values>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/values">
    <results>
      <xsl:for-each select="v">
        <round of="{.}"><xsl:value-of select="round(.)"/></round>
      </xsl:for-each>
    </results>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<results>
  <round of="2.5">3</round>
  <round of="-2.5">-2</round>
  <round of="3.4">3</round>
  <round of="3.6">4</round>
</results>
```

## Notes

- The tie-breaking rule (0.5 rounds up toward positive infinity) is defined in the XPath 1.0 specification and may differ from other languages: `round(-2.5)` is `-2`, not `-3`.
- `round()` has no `precision` argument in XPath 1.0. To round to a specific number of decimal places, multiply, round, then divide: `round($n * 100) div 100` for two decimal places.
- If the argument is `NaN`, the result is `NaN`.
- In XSLT 2.0+, the `round()` function gains an optional second argument specifying the number of decimal places, eliminating the multiply-round-divide workaround.

## See also

- [floor()](../xpath-floor)
- [ceiling()](../xpath-ceiling)
- [number()](../xpath-number)
- [format-number()](../xpath-format-number)
