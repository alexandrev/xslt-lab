---
title: "substring()"
description: "Extracts a portion of a string by start position and optional length, returning the resulting substring."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "string function"
syntax: "substring(string, start, length?)"
tags: ["xslt", "reference", "xslt1", "xpath"]
---

## Description

`substring()` returns the portion of a string beginning at position `start` and extending for `length` characters. If `length` is omitted, the function returns all characters from `start` to the end of the string.

String positions in XPath are **1-based** (the first character is position 1). The `start` and `length` arguments are numbers; they are rounded to the nearest integer using the XPath rounding rules. If `start` is less than 1, the returned string effectively begins at position 1 (the excess is deducted from `length`).

`substring()` is the fundamental string-slicing function in XPath 1.0. For more complex extraction needs, consider `substring-before()` and `substring-after()`, which split on a delimiter without needing to know its position.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `string` | xs:string | Yes | The source string to extract from. |
| `start` | xs:double | Yes | 1-based position of the first character to include. |
| `length` | xs:double | No | Number of characters to include. Defaults to the rest of the string. |

## Return value

`xs:string` — the extracted substring.

## Examples

### Extract a fixed-length prefix

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<codes>
  <code>PROD-001-RED</code>
  <code>PROD-002-BLU</code>
  <code>PROD-003-GRN</code>
</codes>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/codes">
    <ids>
      <xsl:for-each select="code">
        <!-- Extract characters 6 to 8 (the numeric ID) -->
        <id><xsl:value-of select="substring(., 6, 3)"/></id>
      </xsl:for-each>
    </ids>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<ids>
  <id>001</id>
  <id>002</id>
  <id>003</id>
</ids>
```

### Extract from a position to end of string

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/codes">
    <colors>
      <xsl:for-each select="code">
        <!-- Skip first 9 characters, get the rest -->
        <color><xsl:value-of select="substring(., 10)"/></color>
      </xsl:for-each>
    </colors>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<colors>
  <color>RED</color>
  <color>BLU</color>
  <color>GRN</color>
</colors>
```

### Capitalise first character (XSLT 2.0 pattern)

```xml
<!-- Uppercase the first character, lowercase the rest -->
<xsl:value-of select="concat(upper-case(substring(name, 1, 1)), lower-case(substring(name, 2)))"/>
```

## Notes

- XPath string positions start at **1**, not 0. `substring('hello', 1, 3)` returns `"hel"`.
- If `start + length` exceeds the string length, the result is simply truncated at the end of the string — no error is raised.
- For delimiter-based splitting, `substring-before()` and `substring-after()` are more convenient than computing numeric positions.
- In XSLT 2.0+, `replace()` with regex groups is often a cleaner way to extract structured parts of strings.

## See also

- [contains()](../xpath-contains)
- [replace()](../xpath-replace)
