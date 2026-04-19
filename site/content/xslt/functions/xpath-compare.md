---
title: "compare()"
description: "Compares two strings using a collation and returns -1, 0, or 1 indicating their relative order."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "string function"
syntax: "compare(string1, string2, collation?)"
tags: ["xslt", "reference", "xslt2", "xpath"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvd29yZHMiPgogICAgPCEtLSBGaW5kIHRoZSBhbHBoYWJldGljYWxseSBmaXJzdCB3b3JkIHVzaW5nIGNvbXBhcmUoKSAtLT4KICAgIDx4c2w6dmFyaWFibGUgbmFtZT0iZmlyc3QiPgogICAgICA8eHNsOnBlcmZvcm0tc29ydCBzZWxlY3Q9IndvcmQiPgogICAgICAgIDx4c2w6c29ydCBzZWxlY3Q9Ii4iLz4KICAgICAgPC94c2w6cGVyZm9ybS1zb3J0PgogICAgPC94c2w6dmFyaWFibGU-CiAgICA8Zmlyc3Q-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9IiRmaXJzdC93b3JkWzFdIi8-PC9maXJzdD4KCiAgICA8IS0tIFRlc3QgY29tcGFyZSgpIGRpcmVjdGx5IC0tPgogICAgPGNvbXBhcmlzb24-CiAgICAgIDxyZXN1bHQ-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9ImNvbXBhcmUoJ2FwcGxlJywgJ2JhbmFuYScpIi8-PC9yZXN1bHQ-CiAgICAgIDxyZXN1bHQ-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9ImNvbXBhcmUoJ2JhbmFuYScsICdhcHBsZScpIi8-PC9yZXN1bHQ-CiAgICAgIDxyZXN1bHQ-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9ImNvbXBhcmUoJ2FwcGxlJywgJ2FwcGxlJykiLz48L3Jlc3VsdD4KICAgIDwvY29tcGFyaXNvbj4KICA8L3hzbDp0ZW1wbGF0ZT4KPC94c2w6c3R5bGVzaGVldD4&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHdvcmRzPgogIDx3b3JkPmJhbmFuYTwvd29yZD4KICA8d29yZD5hcHBsZTwvd29yZD4KICA8d29yZD5jaGVycnk8L3dvcmQ-CiAgPHdvcmQ-ZGF0ZTwvd29yZD4KPC93b3Jkcz4&version=2.0"
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
