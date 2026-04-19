---
title: "xsl:merge-key"
description: "Defines the sort key for items in an xsl:merge-source, determining how items from different sources are aligned and interleaved during merging."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "element"
syntax: '<xsl:merge-key select="expression" order="ascending" data-type="text"/>'
tags: ["xslt", "reference", "xslt3"]
---

## Description

`xsl:merge-key` is a child of `xsl:merge-source` that specifies how items in a merge source are ordered. Each `xsl:merge-source` must have at least one `xsl:merge-key`. If you need a compound sort key (for example, sort by year then by month), use multiple `xsl:merge-key` elements — the first is the primary key, the second is secondary, and so on.

The `select` expression is evaluated once for each item in the merge source, with the item as the context node. The result must be a single atomic value (or the empty sequence, which sorts last). All merge sources must declare the same number of `xsl:merge-key` elements with compatible key types and the same sort order.

The `order`, `data-type`, `case-order`, `lang`, and `collation` attributes mirror the corresponding attributes on `xsl:sort` and work identically. This means you can sort by date using `xs:date(@date)` and get correct chronological ordering, sort alphabetically with collation support, or sort by numeric value.

Getting merge keys right is critical: the `xsl:merge` instruction trusts that each source is already sorted by its declared keys. If any source is out of order, the merge output will be incorrect without any error being raised by most processors.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `select` | expression | No | Key expression evaluated for each item. Default is `.` (the item itself). |
| `order` | `ascending\|descending` | No | Sort direction. Default `ascending`. |
| `data-type` | `text\|number` | No | Whether to sort as text or number. Default `text`. |
| `case-order` | token | No | `upper-first` or `lower-first`. |
| `lang` | language | No | Language for text comparison. |
| `collation` | URI | No | Collation URI for string comparison. |

## Examples

### Compound merge key: year and month

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template name="xsl:initial-template">
    <merged>
      <xsl:merge>
        <xsl:merge-source name="a" select="doc('data-a.xml')//record">
          <!-- Primary key: year; secondary key: month -->
          <xsl:merge-key select="xs:integer(@year)" order="ascending"/>
          <xsl:merge-key select="xs:integer(@month)" order="ascending"/>
        </xsl:merge-source>
        <xsl:merge-source name="b" select="doc('data-b.xml')//record">
          <xsl:merge-key select="xs:integer(@year)" order="ascending"/>
          <xsl:merge-key select="xs:integer(@month)" order="ascending"/>
        </xsl:merge-source>
        <xsl:merge-action>
          <xsl:copy-of select="$current-merge-group"/>
        </xsl:merge-action>
      </xsl:merge>
    </merged>
  </xsl:template>
</xsl:stylesheet>
```

### Date-typed merge key for chronological ordering

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template name="xsl:initial-template">
    <timeline>
      <xsl:merge>
        <xsl:merge-source name="events"
          select="doc('events.xml')//event">
          <xsl:merge-key select="xs:date(@date)" order="ascending"/>
        </xsl:merge-source>
        <xsl:merge-source name="milestones"
          select="doc('milestones.xml')//milestone">
          <xsl:merge-key select="xs:date(@date)" order="ascending"/>
        </xsl:merge-source>
        <xsl:merge-action>
          <entry date="{$current-merge-key}" count="{count($current-merge-group)}"/>
        </xsl:merge-action>
      </xsl:merge>
    </timeline>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- All merge sources in the same `xsl:merge` must have the same number of `xsl:merge-key` children with comparable types and identical `order` values.
- Using `xs:date()` or `xs:dateTime()` for date keys gives correct chronological comparison; string comparison of date strings would fail for unsorted years.
- The `collation` attribute can be used for locale-aware string merging.
- Empty sequence keys are placed last in ascending order.

## See also

- [xsl:merge](../xsl-merge)
- [xsl:merge-source](../xsl-merge-source)
- [xsl:merge-action](../xsl-merge-action)
