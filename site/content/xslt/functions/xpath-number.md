---
title: "number()"
description: "Converts a string, boolean, or node-set to a number following XPath 1.0 type-conversion rules, returning NaN if the conversion fails."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "numeric function"
syntax: "number(object?)"
tags: ["xslt", "reference", "xpath", "xslt1"]
---

## Description

`number()` converts its argument to a number using XPath 1.0 numeric conversion rules:

- **String:** the string is stripped of leading and trailing whitespace and then parsed as a decimal number. If it cannot be parsed, the result is `NaN`.
- **Boolean:** `true` converts to `1`, `false` converts to `0`.
- **Node-set:** the node-set is first converted to its string value (same as calling `string()` on it), and then that string is converted to a number.
- **Number:** returned unchanged.

When called with no arguments, `number()` converts the string value of the context node.

`number()` is essential when you need to perform arithmetic on element content or attribute values that XPath does not automatically treat as numbers, or when you want to explicitly coerce a value and test for `NaN` before proceeding.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `object` | any | No | Value to convert. Defaults to the context node's string value when omitted. |

## Return value

`xs:double` — the numeric value, or `NaN` if conversion fails.

## Examples

### Arithmetic on element content

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<prices>
  <price>12.50</price>
  <price>7.99</price>
  <price>3.00</price>
</prices>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/prices">
    <result>
      <total><xsl:value-of select="sum(price)"/></total>
      <first-doubled><xsl:value-of select="number(price[1]) * 2"/></first-doubled>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <total>23.49</total>
  <first-doubled>25</first-doubled>
</result>
```

### Guard against NaN before output

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<data>
  <value>42</value>
  <value>N/A</value>
</data>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/data">
    <results>
      <xsl:for-each select="value">
        <xsl:variable name="n" select="number(.)"/>
        <item>
          <xsl:choose>
            <xsl:when test="$n = $n">
              <xsl:value-of select="$n"/>
            </xsl:when>
            <xsl:otherwise>invalid</xsl:otherwise>
          </xsl:choose>
        </item>
      </xsl:for-each>
    </results>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<results>
  <item>42</item>
  <item>invalid</item>
</results>
```

## Notes

- The XPath 1.0 idiom to detect `NaN` is `$n != $n` (or equivalently `not($n = $n)`), because `NaN` is the only value not equal to itself.
- Whitespace around numbers in element content is ignored: `number('  3.14  ')` returns `3.14`.
- Strings like `"Infinity"` and `"-Infinity"` are recognised by some processors as the numeric infinity values, but this is implementation-defined in XPath 1.0.
- In XSLT 2.0+, `xs:double()`, `xs:integer()`, and `xs:decimal()` provide schema-aware type casting and raise errors on invalid input instead of returning `NaN`.

## See also

- [floor()](../xpath-floor)
- [ceiling()](../xpath-ceiling)
- [round()](../xpath-round)
- [format-number()](../xpath-format-number)
