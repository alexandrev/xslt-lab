---
title: "format-number()"
description: "Formats a number as a string using a picture pattern and an optional named decimal format, following the same rules as Java's DecimalFormat."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "numeric function"
syntax: "format-number(number, pattern, decimal-format-name?)"
tags: ["xslt", "reference", "xpath", "xslt1"]
---

## Description

`format-number()` converts a number to a formatted string using a picture pattern string and optional named `xsl:decimal-format` settings. The pattern language follows the same conventions as Java's `java.text.DecimalFormat` class.

The pattern is composed of two optional sub-patterns separated by a semicolon: the **positive pattern** and the **negative pattern**. If only one sub-pattern is given it applies to both positive and negative numbers (with a minus sign prepended for negatives).

Common pattern characters:
- `0` — mandatory digit position (outputs a zero if no digit is present).
- `#` — optional digit position (omitted if not significant).
- `.` — decimal separator.
- `,` — grouping separator (thousands separator).
- `%` — multiplies by 100 and appends a percent sign.
- `E` — separates mantissa and exponent in scientific notation.

The optional third argument names an `xsl:decimal-format` element that can customise the separator characters, infinity string, NaN string, and other locale-specific settings.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `number` | xs:double | Yes | The number to format. |
| `pattern` | xs:string | Yes | The picture pattern string. |
| `decimal-format-name` | xs:QName | No | Name of an `xsl:decimal-format` to use for locale-specific symbols. |

## Return value

`xs:string` — the formatted number as a string.

## Examples

### Format currency and percentages

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<report>
  <revenue>125678.9</revenue>
  <growth>0.0735</growth>
</report>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/report">
    <formatted>
      <revenue><xsl:value-of select="format-number(revenue, '$#,##0.00')"/></revenue>
      <growth><xsl:value-of select="format-number(growth, '0.00%')"/></growth>
    </formatted>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<formatted>
  <revenue>$125,678.90</revenue>
  <growth>7.35%</growth>
</formatted>
```

### Use a named decimal format for European locale

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<prices>
  <price>1234.56</price>
  <price>0.5</price>
</prices>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:decimal-format name="european"
    decimal-separator=","
    grouping-separator="."
    NaN="n/a"
    infinity="inf"/>

  <xsl:template match="/prices">
    <formatted>
      <xsl:for-each select="price">
        <price><xsl:value-of select="format-number(., '#.##0,00', 'european')"/></price>
      </xsl:for-each>
    </formatted>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<formatted>
  <price>1.234,56</price>
  <price>0,50</price>
</formatted>
```

## Notes

- `format-number(NaN, '0')` returns the NaN string defined by the `xsl:decimal-format` (default is `"NaN"`).
- `format-number(number('abc'), '#')` also returns `"NaN"` because `number('abc')` is `NaN`.
- The `%` pattern character multiplies by 100 before formatting; `‰` (per-mille) multiplies by 1000.
- Negative numbers use the negative sub-pattern if provided; otherwise they use the positive pattern with a leading minus sign (using the minus sign character of the decimal format).
- In XSLT 2.0+, `format-number()` is still available but the pattern language is enhanced and the function integrates with `xsl:decimal-format` improvements.

## See also

- [number()](../xpath-number)
- [round()](../xpath-round)
- [xsl:decimal-format](../xsl-decimal-format)
