---
title: "count()"
description: "Returns the number of nodes in a node-set or items in a sequence as an integer."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "node function"
syntax: "count(node-set)"
tags: ["xslt", "reference", "xslt1", "xpath"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjEuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0idGV4dCIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvbGlicmFyeSI-CiAgICA8eHNsOnZhbHVlLW9mIHNlbGVjdD0iY291bnQoYm9vaykiLz4KICAgIDx4c2w6dGV4dD4gYm9va3MgaW4gdGhlIGxpYnJhcnkuPC94c2w6dGV4dD4KICA8L3hzbDp0ZW1wbGF0ZT4KPC94c2w6c3R5bGVzaGVldD4&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGxpYnJhcnk-CiAgPGJvb2s-PHRpdGxlPlhTTFQgQ29va2Jvb2s8L3RpdGxlPjwvYm9vaz4KICA8Ym9vaz48dGl0bGU-WE1MIGluIGEgTnV0c2hlbGw8L3RpdGxlPjwvYm9vaz4KICA8Ym9vaz48dGl0bGU-TGVhcm5pbmcgWE1MPC90aXRsZT48L2Jvb2s-CjwvbGlicmFyeT4&version=1.0"
---

## Description

`count()` evaluates an XPath expression, collects the resulting node-set (or sequence in XPath 2.0+), and returns the number of items as an integer. It is the standard way to determine how many elements match a given path without iterating over them.

Common use cases include:

- Conditionally processing content only if at least one element exists.
- Displaying totals ("5 items found").
- Checking whether a repeated element has a specific number of occurrences.
- Using the count as a denominator or comparator in arithmetic expressions.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `node-set` | node-set / sequence | Yes | The node-set or sequence whose size is returned. |

## Return value

`xs:integer` — the number of nodes or items in the argument.

## Examples

### Display item count

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<library>
  <book><title>XSLT Cookbook</title></book>
  <book><title>XML in a Nutshell</title></book>
  <book><title>Learning XML</title></book>
</library>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>

  <xsl:template match="/library">
    <xsl:value-of select="count(book)"/>
    <xsl:text> books in the library.</xsl:text>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```
3 books in the library.
```

### Conditional output based on count

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/library">
    <result>
      <xsl:choose>
        <xsl:when test="count(book) = 0">
          <message>No books found.</message>
        </xsl:when>
        <xsl:otherwise>
          <message><xsl:value-of select="count(book)"/> book(s) found.</message>
        </xsl:otherwise>
      </xsl:choose>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <message>3 book(s) found.</message>
</result>
```

### Count elements matching a condition

```xml
<!-- Count books with more than 300 pages -->
<xsl:value-of select="count(book[@pages > 300])"/>
```

## Notes

- `count()` counts nodes in the argument expression, not the context node's children by default. Always specify the path explicitly.
- To count all descendants of a type, use `count(.//element-name)`.
- `count()` always returns a non-negative integer; it returns `0` for an empty node-set, never an error.
- In XSLT 2.0+, you can use `count()` on any sequence, including sequences of atomic values.
- `last()` inside `xsl:for-each` gives the same number as `count(select-expression)` but only within the loop; `count()` can be used anywhere.

## See also

- [sum()](../xpath-sum)
- [last()](../xpath-last)
