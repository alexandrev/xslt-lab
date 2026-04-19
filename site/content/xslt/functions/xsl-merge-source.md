---
title: "xsl:merge-source"
description: "Defines one sorted input sequence for xsl:merge, specifying the source data and its merge keys so the merge algorithm can interleave items correctly."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "element"
syntax: '<xsl:merge-source name="src" select="collection()" streamable="no">'
tags: ["xslt", "reference", "xslt3"]
---

## Description

`xsl:merge-source` is a child of `xsl:merge` that declares one of the input sequences to be merged. Each source specifies *what* data to read (via `select`) and *how* to identify its sort key (via one or more `xsl:merge-key` children). The `xsl:merge` processor interleaves items from all sources in key order, processing each key group through `xsl:merge-action`.

The `name` attribute gives the source an identifier that is available inside `xsl:merge-action` as part of `$current-merge-group` context — you can distinguish which source an item came from using `xsl:merge-source` context functions.

The `select` expression may reference any sequence, including documents, collections, or streaming sources. When `streamable="yes"` is specified, the source is processed without buffering, enabling large-file merges.

The `use-accumulators` attribute lists accumulators that should be active while reading items from this source. This is especially useful when the source document itself needs accumulated state (such as running totals or section headers) while being streamed.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | NCName | Yes | Identifies this source within `xsl:merge`. |
| `select` | expression | Yes | The sequence of items to merge from this source. |
| `streamable` | `yes\|no` | No | Whether this source should be processed in streaming mode. Default `no`. |
| `use-accumulators` | names | No | Accumulators active while reading from this source. |
| `sort-before-merge` | `yes\|no` | No | If `yes`, the processor sorts this source before merging. Default `no`. |
| `validation` | token | No | `strict`, `lax`, or `preserve`. Default `preserve`. |

## Examples

### Two named merge sources from different documents

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template name="xsl:initial-template">
    <combined>
      <xsl:merge>
        <xsl:merge-source name="online" select="doc('online-orders.xml')//order">
          <xsl:merge-key select="xs:date(@date)" order="ascending"/>
        </xsl:merge-source>
        <xsl:merge-source name="retail" select="doc('retail-orders.xml')//order">
          <xsl:merge-key select="xs:date(@date)" order="ascending"/>
        </xsl:merge-source>
        <xsl:merge-action>
          <xsl:for-each select="$current-merge-group">
            <order channel="{if (. is $current-merge-group[. = current-merge-group('online')]) then 'online' else 'retail'}"
                   date="{@date}" amount="{@amount}"/>
          </xsl:for-each>
        </xsl:merge-action>
      </xsl:merge>
    </combined>
  </xsl:template>
</xsl:stylesheet>
```

### Streaming merge source from a collection

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template name="xsl:initial-template">
    <report>
      <xsl:merge>
        <xsl:merge-source name="logs"
          select="collection('logs/?select=*.xml')//entry"
          streamable="yes">
          <xsl:merge-key select="xs:dateTime(@timestamp)" order="ascending"/>
        </xsl:merge-source>
        <xsl:merge-action>
          <entry ts="{$current-merge-key}">
            <xsl:value-of select="$current-merge-group"/>
          </entry>
        </xsl:merge-action>
      </xsl:merge>
    </report>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- All `xsl:merge-source` elements within an `xsl:merge` must use the same number of `xsl:merge-key` children with compatible types and orders.
- The `name` attribute is required even when there is only one source.
- If `sort-before-merge="no"` (the default), the source data must already be sorted by the merge keys. Providing unsorted data produces incorrect results.
- In `xsl:merge-action`, use `current-merge-group('source-name')` to get items from a specific named source.

## See also

- [xsl:merge](../xsl-merge)
- [xsl:merge-key](../xsl-merge-key)
- [xsl:merge-action](../xsl-merge-action)
