---
title: "floor()"
description: "Returns the largest integer not greater than the argument — equivalent to rounding a number down toward negative infinity."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "numeric function"
syntax: "floor(number)"
tags: ["xslt", "reference", "xpath", "xslt1"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjEuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnZhcmlhYmxlIG5hbWU9InBhZ2VTaXplIiBzZWxlY3Q9IjIiLz4KCiAgPHhzbDp0ZW1wbGF0ZSBtYXRjaD0iL2NhdGFsb2ciPgogICAgPHhzbDp2YXJpYWJsZSBuYW1lPSJ0b3RhbCIgc2VsZWN0PSJjb3VudChpdGVtKSIvPgogICAgPHBhZ2luYXRpb24-CiAgICAgIDx0b3RhbC1pdGVtcz48eHNsOnZhbHVlLW9mIHNlbGVjdD0iJHRvdGFsIi8-PC90b3RhbC1pdGVtcz4KICAgICAgPGZ1bGwtcGFnZXM-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9ImZsb29yKCR0b3RhbCBkaXYgJHBhZ2VTaXplKSIvPjwvZnVsbC1wYWdlcz4KICAgIDwvcGFnaW5hdGlvbj4KICA8L3hzbDp0ZW1wbGF0ZT4KPC94c2w6c3R5bGVzaGVldD4&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGNhdGFsb2c-CiAgPGl0ZW0-QTwvaXRlbT4KICA8aXRlbT5CPC9pdGVtPgogIDxpdGVtPkM8L2l0ZW0-CiAgPGl0ZW0-RDwvaXRlbT4KICA8aXRlbT5FPC9pdGVtPgo8L2NhdGFsb2c-&version=1.0"
---

## Description

`floor()` returns the largest integer that is less than or equal to its argument. In plain terms, it rounds a number **down** toward negative infinity. For positive numbers this truncates the decimal part; for negative numbers this rounds away from zero.

The argument is first converted to a number using the same rules as `number()`. If the argument is already an integer, it is returned unchanged. If the argument is `NaN` or infinite, the same special value is returned.

Common uses include computing page numbers, calculating array indices from fractional results, and trimming calculated dimensions to integer pixel values.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `number` | xs:double | Yes | The number to round down. |

## Return value

`xs:double` — the largest integer value less than or equal to the argument.

## Examples

### Compute page count from item count

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
      <full-pages><xsl:value-of select="floor($total div $pageSize)"/></full-pages>
    </pagination>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<pagination>
  <total-items>5</total-items>
  <full-pages>2</full-pages>
</pagination>
```

### Floor of positive and negative numbers

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<values>
  <v>3.7</v>
  <v>-3.7</v>
  <v>5.0</v>
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
        <floor of="{.}"><xsl:value-of select="floor(.)"/></floor>
      </xsl:for-each>
    </results>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<results>
  <floor of="3.7">3</floor>
  <floor of="-3.7">-4</floor>
  <floor of="5.0">5</floor>
</results>
```

## Notes

- `floor(-3.7)` returns `-4`, not `-3`. Rounding is always toward negative infinity, not toward zero.
- If the argument is `NaN`, `floor()` returns `NaN`.
- If the argument is `Infinity` or `-Infinity`, the same infinity is returned unchanged.
- `floor()` returns a `double` type in XPath 1.0, so the output may include a trailing `.0` on some processors when serialised. Use `round()` or integer arithmetic if you need a guaranteed integer format.
- For rounding toward zero (truncation), there is no dedicated XPath 1.0 function; the common workaround is `floor($n)` for positive numbers or `ceiling($n)` for negative ones.

## See also

- [ceiling()](../xpath-ceiling)
- [round()](../xpath-round)
- [number()](../xpath-number)
