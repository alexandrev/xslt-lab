---
title: "xsl:decimal-format"
description: "Defines a named decimal format controlling how format-number() formats numbers in XSLT 1.0 and later."
date: 2026-04-19T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "element"
syntax: "<xsl:decimal-format name=\"name\" decimal-separator=\".\" grouping-separator=\",\" NaN=\"NaN\"/>"
tags: ["xslt", "reference", "xpath", "xslt1"]
---

## Description

`xsl:decimal-format` is a top-level declaration that defines the characters and symbols used when `format-number()` converts a numeric value to a string. By giving the format a name you can define multiple locale-specific formats in a single stylesheet, then pass the format name as the third argument to `format-number()`.

If no `name` attribute is given, the declaration sets the default decimal format used when `format-number()` is called with only two arguments. Every attribute has a default value, so you only need to specify the attributes that differ from those defaults.

The `decimal-separator` and `grouping-separator` characters used in the `format` pattern passed to `format-number()` must match those declared in the decimal format — the processor interprets the pattern characters according to the active decimal format.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | QName | No | Name of this format; omit for the default format. |
| `decimal-separator` | char | No | Character used as the decimal point (default `.`). |
| `grouping-separator` | char | No | Character used as the thousands separator (default `,`). |
| `infinity` | string | No | String representing positive infinity (default `Infinity`). |
| `minus-sign` | char | No | Character used as the minus sign (default `-`). |
| `NaN` | string | No | String representing NaN (default `NaN`). |
| `percent` | char | No | Character interpreted as percent in a pattern (default `%`). |
| `per-mille` | char | No | Character interpreted as per-mille in a pattern (default `‰`). |
| `zero-digit` | char | No | Digit character representing zero in a pattern (default `0`). |
| `digit` | char | No | Character representing an optional digit in a pattern (default `#`). |
| `pattern-separator` | char | No | Separates positive and negative sub-patterns (default `;`). |

## Return value

`xsl:decimal-format` is a declaration; it produces no output.

## Examples

### Formatting numbers with European locale

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<prices>
  <price>1234567.89</price>
  <price>0.5</price>
</prices>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:decimal-format name="european"
    decimal-separator=","
    grouping-separator="."/>

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
  <price>1.234.567,89</price>
  <price>0,50</price>
</formatted>
```

### Overriding the default format

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<data>
  <value>3.14159</value>
  <value>-7</value>
</data>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>

  <xsl:decimal-format NaN="n/a" infinity="inf"/>

  <xsl:template match="/data">
    <xsl:for-each select="value">
      <xsl:value-of select="format-number(., '#,##0.##')"/>
      <xsl:text>&#10;</xsl:text>
    </xsl:for-each>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```
3.14
-7
```

## Notes

- All characters used in a decimal format must be distinct from each other.
- The `format` picture string passed to `format-number()` is interpreted using the characters declared in the active decimal format, not literal ASCII symbols.
- In XSLT 2.0, `xsl:decimal-format` gains additional attributes and the semantics align more closely with Unicode CLDR.
- It is an error to have two `xsl:decimal-format` declarations with the same name (or two unnamed declarations) that differ in any attribute value.

## See also

- [format-number()](../xpath-format-number)
- [xsl:number](../xsl-number)
