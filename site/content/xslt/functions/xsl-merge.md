---
title: "xsl:merge"
description: "Merges multiple pre-sorted sequences into a single sorted sequence, processing each group of items with the same merge key via xsl:merge-action."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "element"
syntax: "<xsl:merge><xsl:merge-source .../><xsl:merge-action>...</xsl:merge-action></xsl:merge>"
tags: ["xslt", "reference", "xslt3"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczp4cz0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG5hbWU9InhzbDppbml0aWFsLXRlbXBsYXRlIj4KICAgIDx4c2w6dmFyaWFibGUgbmFtZT0icTEiPgogICAgICA8dHJhbnNhY3Rpb25zPgogICAgICAgIDx0eCBkYXRlPSIyMDI2LTAxLTE1IiBhbW91bnQ9IjEwMC4wMCIgZGVzYz0iQ29mZmVlIi8-CiAgICAgICAgPHR4IGRhdGU9IjIwMjYtMDItMjAiIGFtb3VudD0iMjUwLjAwIiBkZXNjPSJCb29rcyIvPgogICAgICAgIDx0eCBkYXRlPSIyMDI2LTAzLTA1IiBhbW91bnQ9Ijc1LjUwIiAgZGVzYz0iVGVhIi8-CiAgICAgIDwvdHJhbnNhY3Rpb25zPgogICAgPC94c2w6dmFyaWFibGU-CiAgICA8eHNsOnZhcmlhYmxlIG5hbWU9InEyIj4KICAgICAgPHRyYW5zYWN0aW9ucz4KICAgICAgICA8dHggZGF0ZT0iMjAyNi0wNC0xMCIgYW1vdW50PSIxNTAuMDAiIGRlc2M9Ikx1bmNoIi8-CiAgICAgICAgPHR4IGRhdGU9IjIwMjYtMDUtMjUiIGFtb3VudD0iMzAwLjAwIiBkZXNjPSJTb2Z0d2FyZSIvPgogICAgICAgIDx0eCBkYXRlPSIyMDI2LTA2LTE4IiBhbW91bnQ9IjkwLjAwIiAgZGVzYz0iQm9va3MiLz4KICAgICAgPC90cmFuc2FjdGlvbnM-CiAgICA8L3hzbDp2YXJpYWJsZT4KICAgIDxhbGwtdHJhbnNhY3Rpb25zPgogICAgICA8eHNsOm1lcmdlPgogICAgICAgIDx4c2w6bWVyZ2Utc291cmNlIG5hbWU9InExIiBzZWxlY3Q9IiRxMS90cmFuc2FjdGlvbnMvdHgiPgogICAgICAgICAgPHhzbDptZXJnZS1rZXkgc2VsZWN0PSJ4czpkYXRlKEBkYXRlKSIgb3JkZXI9ImFzY2VuZGluZyIvPgogICAgICAgIDwveHNsOm1lcmdlLXNvdXJjZT4KICAgICAgICA8eHNsOm1lcmdlLXNvdXJjZSBuYW1lPSJxMiIgc2VsZWN0PSIkcTIvdHJhbnNhY3Rpb25zL3R4Ij4KICAgICAgICAgIDx4c2w6bWVyZ2Uta2V5IHNlbGVjdD0ieHM6ZGF0ZShAZGF0ZSkiIG9yZGVyPSJhc2NlbmRpbmciLz4KICAgICAgICA8L3hzbDptZXJnZS1zb3VyY2U-CiAgICAgICAgPHhzbDptZXJnZS1hY3Rpb24-CiAgICAgICAgICA8eHNsOmNvcHktb2Ygc2VsZWN0PSIkY3VycmVudC1tZXJnZS1ncm91cCIvPgogICAgICAgIDwveHNsOm1lcmdlLWFjdGlvbj4KICAgICAgPC94c2w6bWVyZ2U-CiAgICA8L2FsbC10cmFuc2FjdGlvbnM-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHJvb3QvPg&version=3.0"
---

## Description

`xsl:merge` performs a sorted merge of two or more input sequences, each pre-sorted by a common key. It is the XSLT 3.0 equivalent of the merge step in a merge sort algorithm. The processor reads from each source in lockstep, advancing whichever source has the smallest current key, and passes each key-group to `xsl:merge-action` for processing.

This is particularly powerful for combining large datasets that cannot all be loaded into memory simultaneously. Each source can be a collection of documents, a selection from an existing tree, or a streaming source. The merge happens in a single pass and does not require the processor to hold the entire merged result in memory.

Each `xsl:merge` must have at least one `xsl:merge-source` child (usually two or more) and exactly one `xsl:merge-action` child. The merge sources must each be sorted by the same set of `xsl:merge-key` expressions. Inside `xsl:merge-action`, the variable `$current-merge-key` holds the current key value, and the variable `$current-merge-group` holds the sequence of items from all sources that share that key.

## Attributes

`xsl:merge` has no element-specific attributes. Its structure is defined entirely by its children: one or more `xsl:merge-source` elements and exactly one `xsl:merge-action` element.

## Examples

### Merging two sorted XML files by date

**Source 1 (transactions-2026-q1.xml):**
```xml
<transactions>
  <tx date="2026-01-05" amount="100"/>
  <tx date="2026-02-14" amount="250"/>
  <tx date="2026-03-22" amount="75"/>
</transactions>
```

**Source 2 (transactions-2026-q2.xml):**
```xml
<transactions>
  <tx date="2026-04-01" amount="180"/>
  <tx date="2026-04-15" amount="320"/>
</transactions>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template name="xsl:initial-template">
    <all-transactions>
      <xsl:merge>
        <xsl:merge-source name="q1" select="doc('transactions-2026-q1.xml')/transactions/tx">
          <xsl:merge-key select="xs:date(@date)" order="ascending"/>
        </xsl:merge-source>
        <xsl:merge-source name="q2" select="doc('transactions-2026-q2.xml')/transactions/tx">
          <xsl:merge-key select="xs:date(@date)" order="ascending"/>
        </xsl:merge-source>
        <xsl:merge-action>
          <xsl:copy-of select="$current-merge-group"/>
        </xsl:merge-action>
      </xsl:merge>
    </all-transactions>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<all-transactions>
  <tx date="2026-01-05" amount="100"/>
  <tx date="2026-02-14" amount="250"/>
  <tx date="2026-03-22" amount="75"/>
  <tx date="2026-04-01" amount="180"/>
  <tx date="2026-04-15" amount="320"/>
</all-transactions>
```

### Merging with aggregation on common keys

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template name="xsl:initial-template">
    <monthly-totals>
      <xsl:merge>
        <xsl:merge-source name="q1" select="doc('q1.xml')//tx">
          <xsl:merge-key select="month-from-date(xs:date(@date))" order="ascending"/>
        </xsl:merge-source>
        <xsl:merge-source name="q2" select="doc('q2.xml')//tx">
          <xsl:merge-key select="month-from-date(xs:date(@date))" order="ascending"/>
        </xsl:merge-source>
        <xsl:merge-action>
          <month key="{$current-merge-key}"
            total="{sum($current-merge-group/@amount)}"/>
        </xsl:merge-action>
      </xsl:merge>
    </monthly-totals>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- All sources must be pre-sorted by the merge keys in the same order (ascending/descending). The processor does not sort them.
- `$current-merge-key` and `$current-merge-group` are automatically available inside `xsl:merge-action`.
- `xsl:merge` is streamable: each source can be a streaming source as long as individual sources do not need to be revisited.
- When two sources have identical keys, their items are merged into the same `$current-merge-group`.

## See also

- [xsl:merge-source](../xsl-merge-source)
- [xsl:merge-key](../xsl-merge-key)
- [xsl:merge-action](../xsl-merge-action)
- [xsl:stream](../xsl-stream)
