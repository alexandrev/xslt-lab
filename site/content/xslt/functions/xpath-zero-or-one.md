---
title: "zero-or-one()"
description: "Asserts that the sequence contains zero or one items; raises a dynamic error if it contains more than one item."
date: 2026-04-19T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "sequence function"
syntax: "zero-or-one(sequence)"
tags: ["xslt", "reference", "xpath", "xslt2"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSI-CiAgPHhzbDpvdXRwdXQgbWV0aG9kPSJ4bWwiIGluZGVudD0ieWVzIi8-CgogIDx4c2w6dGVtcGxhdGUgbWF0Y2g9Ii9wcm9maWxlIj4KICAgIDx4c2w6dmFyaWFibGUgbmFtZT0ibmljayIgc2VsZWN0PSJ6ZXJvLW9yLW9uZShuaWNrbmFtZSkiLz4KICAgIDxkaXNwbGF5PgogICAgICA8eHNsOnZhbHVlLW9mIHNlbGVjdD0ibmFtZSIvPgogICAgICA8eHNsOmlmIHRlc3Q9IiRuaWNrIj4KICAgICAgICA8eHNsOnRleHQ-ICg8L3hzbDp0ZXh0PgogICAgICAgIDx4c2w6dmFsdWUtb2Ygc2VsZWN0PSIkbmljayIvPgogICAgICAgIDx4c2w6dGV4dD4pPC94c2w6dGV4dD4KICAgICAgPC94c2w6aWY-CiAgICA8L2Rpc3BsYXk-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHByb2ZpbGU-CiAgPG5hbWU-QWxpY2U8L25hbWU-CiAgPG5pY2tuYW1lPkFsPC9uaWNrbmFtZT4KPC9wcm9maWxlPg&version=2.0"
---

## Description

`zero-or-one()` is a cardinality assertion function. It returns the sequence unchanged when it contains zero or one items, and raises a dynamic error (`FORG0003`) if the sequence contains two or more items. The function is the XPath equivalent of an optional element that must not appear more than once.

This function is useful when you need to assign a node to a variable and want to assert that the source never unexpectedly produces multiple matches. It is also the standard way to annotate the return type of a function that may produce an optional result.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sequence` | item()* | Yes | The sequence that must contain zero or one items. |

## Return value

`item()?` — the original sequence (empty or a single item). Raises `FORG0003` if the sequence contains more than one item.

## Examples

### Optional element lookup

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<profile>
  <name>Alice</name>
  <nickname>Al</nickname>
</profile>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/profile">
    <xsl:variable name="nick" select="zero-or-one(nickname)"/>
    <display>
      <xsl:value-of select="name"/>
      <xsl:if test="$nick">
        <xsl:text> (</xsl:text>
        <xsl:value-of select="$nick"/>
        <xsl:text>)</xsl:text>
      </xsl:if>
    </display>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<display>Alice (Al)</display>
```

### Detecting accidental duplicates

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<document>
  <title>First</title>
  <title>Second</title>
</document>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/document">
    <!-- This will raise FORG0003 because two title elements exist -->
    <xsl:variable name="t" select="zero-or-one(title)"/>
    <result><xsl:value-of select="$t"/></result>
  </xsl:template>
</xsl:stylesheet>
```

**Output (error raised):**
```
FORG0003: zero-or-one() called with a sequence containing more than one item
```

## Notes

- The error code raised is `err:FORG0003`.
- In XSLT 2.0 function signatures, a parameter typed as `item()?` implicitly accepts zero or one items; `zero-or-one()` enforces this same constraint in XPath expressions.
- Unlike `exactly-one()`, this function permits an empty sequence, making it suitable for optional elements or attributes.
- When the goal is simply to take the first item without asserting uniqueness, use `($seq)[1]` instead.

## See also

- [exactly-one()](../xpath-exactly-one)
- [one-or-more()](../xpath-one-or-more)
- [empty()](../xpath-empty)
- [error()](../xpath-error)
