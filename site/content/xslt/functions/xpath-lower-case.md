---
title: "lower-case()"
description: "Converts every character of a string to its Unicode lowercase equivalent using locale-independent Unicode case mapping."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "string function"
syntax: "lower-case(string)"
tags: ["xslt", "reference", "xslt2", "xpath"]
---

## Description

`lower-case()` returns a copy of the input string with every character converted to lowercase according to Unicode default case mappings. The conversion is locale-independent. If the argument is an empty sequence, the function returns the empty string `""`.

It is the complement of `upper-case()` and is frequently used for normalization before comparison, sorting, or searching — ensuring that strings like `"XML"`, `"xml"`, and `"Xml"` are treated identically.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `string` | xs:string? | Yes | The string to convert. |

## Return value

`xs:string` — the input string with all characters mapped to lowercase.

## Examples

### Normalizing element text for comparison

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<tags>
  <tag>XSLT</tag>
  <tag>XPath</tag>
  <tag>xml</tag>
  <tag>JSON</tag>
</tags>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/tags">
    <normalized>
      <xsl:for-each select="tag">
        <tag><xsl:value-of select="lower-case(.)"/></tag>
      </xsl:for-each>
    </normalized>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<normalized>
  <tag>xslt</tag>
  <tag>xpath</tag>
  <tag>xml</tag>
  <tag>json</tag>
</normalized>
```

### Generating lowercase slugs for URLs

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<articles>
  <article title="Getting Started With XSLT"/>
  <article title="Advanced XPath Techniques"/>
</articles>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/articles">
    <links>
      <xsl:for-each select="article">
        <xsl:variable name="slug"
          select="lower-case(replace(@title, '\s+', '-'))"/>
        <a href="/articles/{$slug}"><xsl:value-of select="@title"/></a>
      </xsl:for-each>
    </links>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<links>
  <a href="/articles/getting-started-with-xslt">Getting Started With XSLT</a>
  <a href="/articles/advanced-xpath-techniques">Advanced XPath Techniques</a>
</links>
```

## Notes

- Like `upper-case()`, this function uses Unicode default case mappings and is not locale-aware.
- It does not modify digits, punctuation, or whitespace.
- Combining `lower-case()` with `normalize-unicode()` is good practice when normalizing data from multiple sources before comparison.
- In XSLT 1.0, the nearest equivalent is `translate()` with explicit letter-by-letter mapping, which is cumbersome for full Unicode support.

## See also

- [upper-case()](../xpath-upper-case)
- [normalize-unicode()](../xpath-normalize-unicode)
- [normalize-space()](../xpath-normalize-space)
