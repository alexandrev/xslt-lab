---
title: "compare()"
description: "Compares two strings using a collation and returns -1, 0, or 1 indicating their relative order."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "string function"
syntax: "compare(string1, string2, collation?)"
tags: ["xslt", "reference", "xslt2", "xpath"]
---

## Description

`compare()` performs a three-way comparison of two strings, returning:

- `-1` if `string1` sorts before `string2`
- `0` if they are equal
- `1` if `string1` sorts after `string2`

Without a `collation` argument, the default collation (Unicode codepoint order) is used. With a collation URI, language- and locale-sensitive ordering is applied — for example, treating accented and unaccented letters as equivalent, or following locale-specific alphabetical order.

This is the XPath 2.0 equivalent of the three-way comparison operators found in languages like Java (`compareTo`) or C (`strcmp`), and it is the correct function to use when you need ordered comparison rather than just equality.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `string1` | xs:string? | Yes | The first string. |
| `string2` | xs:string? | Yes | The second string. |
| `collation` | xs:string | No | A collation URI. Defaults to the default collation (typically Unicode codepoint). |

If either argument is an empty sequence, the function returns an empty sequence.

## Return value

`xs:integer?` — `-1`, `0`, or `1`, or the empty sequence if either argument is empty.

## Examples

### Sorting strings and finding the alphabetically first

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<words>
  <word>banana</word>
  <word>apple</word>
  <word>cherry</word>
  <word>date</word>
</words>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/words">
    <!-- Find the alphabetically first word using compare() -->
    <xsl:variable name="first">
      <xsl:perform-sort select="word">
        <xsl:sort select="."/>
      </xsl:perform-sort>
    </xsl:variable>
    <first><xsl:value-of select="$first/word[1]"/></first>

    <!-- Test compare() directly -->
    <comparison>
      <result><xsl:value-of select="compare('apple', 'banana')"/></result>
      <result><xsl:value-of select="compare('banana', 'apple')"/></result>
      <result><xsl:value-of select="compare('apple', 'apple')"/></result>
    </comparison>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<first>apple</first>
<comparison>
  <result>-1</result>
  <result>1</result>
  <result>0</result>
</comparison>
```

### Custom sort using compare() in a function

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:xs="http://www.w3.org/2001/XMLSchema"
                xmlns:my="http://example.com/my">
  <xsl:output method="xml" indent="yes"/>

  <!-- Returns the lexicographically greater of two strings -->
  <xsl:function name="my:max-string" as="xs:string">
    <xsl:param name="a" as="xs:string"/>
    <xsl:param name="b" as="xs:string"/>
    <xsl:sequence select="if (compare($a, $b) ge 0) then $a else $b"/>
  </xsl:function>

  <xsl:template match="/">
    <result>
      <xsl:value-of select="my:max-string('pear', 'peach')"/>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>pear</result>
```

## Notes

- For simple equality testing, use `=` or `eq`. `compare()` is most useful when you need the direction of the difference, not just whether strings are equal.
- Codepoint collation compares characters by Unicode code number, which does not always match alphabetical order in all languages.
- Saxon supports IETF BCP 47 language tags as collation URIs (e.g., `http://saxon.sf.net/collation?lang=fr` for French).
- `compare($a, $b) = 0` is equivalent to `$a = $b` under the same collation.

## See also

- [upper-case()](../xpath-upper-case)
- [lower-case()](../xpath-lower-case)
- [codepoints-to-string()](../xpath-codepoints-to-string)
- [deep-equal()](../xpath-deep-equal)
