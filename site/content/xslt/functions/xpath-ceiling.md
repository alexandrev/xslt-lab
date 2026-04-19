---
title: "ceiling()"
description: "Returns the smallest integer not less than the argument — equivalent to rounding a number up toward positive infinity."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "numeric function"
syntax: "ceiling(number)"
tags: ["xslt", "reference", "xpath", "xslt1"]
---

## Description

`ceiling()` returns the smallest integer that is greater than or equal to its argument. It rounds a number **up** toward positive infinity. For positive numbers with a fractional part this means adding enough to reach the next integer; for negative numbers it rounds toward zero.

The argument is first converted to a number using the same rules as `number()`. If the argument is already an integer, it is returned unchanged. Special values (`NaN`, `Infinity`, `-Infinity`) pass through unmodified.

`ceiling()` is the complement of `floor()`. It is commonly used to compute the total number of pages needed to display a set of items, to round monetary amounts up to the next whole unit, or to ensure allocated space is never less than required.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `number` | xs:double | Yes | The number to round up. |

## Return value

`xs:double` — the smallest integer value greater than or equal to the argument.

## Examples

### Total pages needed for a list of items

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <item>A</item>
  <item>B</item>
  <item>C</item>
  <item>D</item>
  <item>E</item>
</catalog>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:variable name="pageSize" select="2"/>

  <xsl:template match="/catalog">
    <xsl:variable name="total" select="count(item)"/>
    <pagination>
      <total-items><xsl:value-of select="$total"/></total-items>
      <pages-needed><xsl:value-of select="ceiling($total div $pageSize)"/></pages-needed>
    </pagination>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<pagination>
  <total-items>5</total-items>
  <pages-needed>3</pages-needed>
</pagination>
```

### Ceiling of positive and negative numbers

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<values>
  <v>3.2</v>
  <v>-3.2</v>
  <v>4.0</v>
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
        <ceiling of="{.}"><xsl:value-of select="ceiling(.)"/></ceiling>
      </xsl:for-each>
    </results>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<results>
  <ceiling of="3.2">4</ceiling>
  <ceiling of="-3.2">-3</ceiling>
  <ceiling of="4.0">4</ceiling>
</results>
```

## Notes

- `ceiling(-3.2)` returns `-3`, not `-4`. The direction is always toward positive infinity.
- If the argument is `NaN`, `ceiling()` returns `NaN`.
- If the argument is `Infinity` or `-Infinity`, the same infinity is returned unchanged.
- Like `floor()`, the return type is `xs:double`, so serialisation may show a trailing `.0` on some processors.
- When dividing integers, use `ceiling($a div $b)` rather than `ceiling($a) div $b`; the latter rounds the numerator first and can produce incorrect results.

## See also

- [floor()](../xpath-floor)
- [round()](../xpath-round)
- [number()](../xpath-number)
