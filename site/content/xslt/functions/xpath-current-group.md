---
title: "current-group()"
description: "Returns the sequence of items in the current group inside an xsl:for-each-group instruction."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "node function"
syntax: "current-group()"
tags: ["xslt", "reference", "xpath", "xslt2"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczp4cz0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvc2FsZXMiPgogICAgPHN1bW1hcnk-CiAgICAgIDx4c2w6Zm9yLWVhY2gtZ3JvdXAgc2VsZWN0PSJzYWxlIiBncm91cC1ieT0iQHJlZ2lvbiI-CiAgICAgICAgPHJlZ2lvbiBuYW1lPSJ7Y3VycmVudC1ncm91cGluZy1rZXkoKX0iPgogICAgICAgICAgPGNvdW50Pjx4c2w6dmFsdWUtb2Ygc2VsZWN0PSJjb3VudChjdXJyZW50LWdyb3VwKCkpIi8-PC9jb3VudD4KICAgICAgICAgIDx0b3RhbD48eHNsOnZhbHVlLW9mIHNlbGVjdD0ic3VtKGN1cnJlbnQtZ3JvdXAoKS94czpkZWNpbWFsKEBhbW91bnQpKSIvPjwvdG90YWw-CiAgICAgICAgPC9yZWdpb24-CiAgICAgIDwveHNsOmZvci1lYWNoLWdyb3VwPgogICAgPC9zdW1tYXJ5PgogIDwveHNsOnRlbXBsYXRlPgo8L3hzbDpzdHlsZXNoZWV0Pg&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHNhbGVzPgogIDxzYWxlIHJlZ2lvbj0ibm9ydGgiIGFtb3VudD0iMTAwIi8-CiAgPHNhbGUgcmVnaW9uPSJzb3V0aCIgYW1vdW50PSIyMDAiLz4KICA8c2FsZSByZWdpb249Im5vcnRoIiBhbW91bnQ9IjE1MCIvPgogIDxzYWxlIHJlZ2lvbj0iZWFzdCIgIGFtb3VudD0iMzAwIi8-CiAgPHNhbGUgcmVnaW9uPSJzb3V0aCIgYW1vdW50PSIxODAiLz4KPC9zYWxlcz4&version=2.0"
---

## Description

`current-group()` returns all the items that belong to the current group within an `<xsl:for-each-group>` instruction. It is only meaningful inside `xsl:for-each-group` — outside that instruction, the result is implementation-defined (typically the empty sequence).

Paired with `current-grouping-key()`, it gives you full access to both the grouping criterion and the grouped items.

## Parameters

This function takes no parameters.

## Return value

`item()*` — the sequence of items in the current group.

## Examples

### Summarise sales by region

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<sales>
  <sale region="north" amount="100"/>
  <sale region="south" amount="200"/>
  <sale region="north" amount="150"/>
  <sale region="east"  amount="300"/>
  <sale region="south" amount="180"/>
</sales>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/sales">
    <summary>
      <xsl:for-each-group select="sale" group-by="@region">
        <region name="{current-grouping-key()}">
          <count><xsl:value-of select="count(current-group())"/></count>
          <total><xsl:value-of select="sum(current-group()/xs:decimal(@amount))"/></total>
        </region>
      </xsl:for-each-group>
    </summary>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<summary>
  <region name="north"><count>2</count><total>250</total></region>
  <region name="south"><count>2</count><total>380</total></region>
  <region name="east"><count>1</count><total>300</total></region>
</summary>
```

### Wrap each group in a container element

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/employees">
    <departments>
      <xsl:for-each-group select="employee" group-by="@dept">
        <department name="{current-grouping-key()}">
          <xsl:copy-of select="current-group()"/>
        </department>
      </xsl:for-each-group>
    </departments>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- `current-group()` is only valid inside `xsl:for-each-group`. Using it elsewhere is an error or returns the empty sequence depending on the processor.
- The items in `current-group()` are a subset of the `select` expression of the enclosing `xsl:for-each-group`, in document order.
- The context item inside `xsl:for-each-group` is the **first item** of the current group; `current-group()` gives you all items.

## See also

- [current-grouping-key()](../xpath-current-grouping-key)
- [xsl:for-each-group](../xsl-for-each-group)
