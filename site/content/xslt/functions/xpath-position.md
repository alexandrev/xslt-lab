---
title: "position()"
description: "Returns the position of the context node within the current node-set, starting at 1."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "node function"
syntax: "position()"
tags: ["xslt", "reference", "xslt1", "xpath"]
---

## Description

`position()` returns an integer representing the **1-based position** of the current context node within the node-set being iterated. It takes no arguments.

It is most commonly used inside `xsl:for-each` or predicates to:

- Generate row numbers or sequence numbers in the output.
- Apply alternating styles (odd/even rows).
- Conditionally process only specific positions (first, last, every nth item).
- Omit separators before or after specific items.

The context for `position()` is determined by the nearest enclosing iteration (`xsl:for-each`, `xsl:apply-templates`, or a predicate). Inside a predicate, `position()` refers to the position within the node-set being filtered, not the outer iteration.

## Return value

`xs:integer` — the 1-based position of the context node within the current context sequence.

## Examples

### Row numbers in a table

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<employees>
  <employee><name>Alice</name></employee>
  <employee><name>Bob</name></employee>
  <employee><name>Carol</name></employee>
</employees>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/employees">
    <table>
      <xsl:for-each select="employee">
        <row number="{position()}">
          <xsl:value-of select="name"/>
        </row>
      </xsl:for-each>
    </table>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<table>
  <row number="1">Alice</row>
  <row number="2">Bob</row>
  <row number="3">Carol</row>
</table>
```

### Odd/even row class

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/employees">
    <table>
      <xsl:for-each select="employee">
        <row class="{if(position() mod 2 = 0, 'even', 'odd')}">
          <xsl:value-of select="name"/>
        </row>
      </xsl:for-each>
    </table>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<table>
  <row class="odd">Alice</row>
  <row class="even">Bob</row>
  <row class="odd">Carol</row>
</table>
```

*Note: the `if()` expression requires XSLT 2.0. In XSLT 1.0, use `xsl:choose` instead.*

### Select every second element using a predicate

```xml
<xsl:value-of select="employee[position() mod 2 = 1]/name" separator=", "/>
```

## Notes

- `position()` inside a predicate `[position() = 1]` can be shortened to `[1]`.
- The shorthand `item[last()]` selects the last item; `item[1]` selects the first.
- Document order is used by default; if `xsl:sort` is present, positions reflect the sorted order.
- Do not confuse `position()` with the numeric value of an `@id` attribute or similar content-based numbering — `position()` is purely about iteration order.

## See also

- [last()](../xpath-last)
- [xsl:for-each](../xsl-for-each)
