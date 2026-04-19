---
title: "xsl:merge-action"
description: "Defines the body executed for each group of items sharing the same merge key during an xsl:merge operation, with access to the merged items and current key."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "element"
syntax: "<xsl:merge-action>...</xsl:merge-action>"
tags: ["xslt", "reference", "xslt3"]
---

## Description

`xsl:merge-action` is the body of an `xsl:merge` instruction. It is executed once for each distinct merge key value encountered across all sources. When multiple sources have items with the same key, all such items are collected into the `$current-merge-group` variable, and the action is called once for the entire group.

Inside `xsl:merge-action`, two implicit variables are always available:

- `$current-merge-key` — the atomic value of the current merge key (for compound keys, this is the primary key; use `current-merge-key()` function for the full key).
- `$current-merge-group` — a sequence containing all items from all merge sources whose key matches the current key. The items appear in source declaration order, and items from earlier-declared sources come before items from later-declared sources with the same key.

You can also call `current-merge-group('source-name')` to get items from a specific named source, enabling source-specific processing within a merge action.

`xsl:merge-action` must be a direct child of `xsl:merge` and there must be exactly one. Any XSLT instructions may appear inside it — `xsl:if`, `xsl:for-each`, `xsl:choose`, `xsl:copy-of`, and so on.

## Attributes

`xsl:merge-action` has no element-specific attributes. It contains a sequence constructor.

## Examples

### Combining matching items from two sources

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template name="xsl:initial-template">
    <reconciliation>
      <xsl:merge>
        <xsl:merge-source name="invoices" select="doc('invoices.xml')//invoice">
          <xsl:merge-key select="string(@id)" order="ascending"/>
        </xsl:merge-source>
        <xsl:merge-source name="payments" select="doc('payments.xml')//payment">
          <xsl:merge-key select="string(@invoice-id)" order="ascending"/>
        </xsl:merge-source>
        <xsl:merge-action>
          <xsl:variable name="inv" select="current-merge-group('invoices')"/>
          <xsl:variable name="pay" select="current-merge-group('payments')"/>
          <entry id="{$current-merge-key}">
            <invoice-amount><xsl:value-of select="$inv/@amount"/></invoice-amount>
            <paid><xsl:value-of select="if (exists($pay)) then 'yes' else 'no'"/></paid>
            <payment-amount>
              <xsl:value-of select="if (exists($pay)) then $pay/@amount else 0"/>
            </payment-amount>
          </entry>
        </xsl:merge-action>
      </xsl:merge>
    </reconciliation>
  </xsl:template>
</xsl:stylesheet>
```

### Generating summaries per key group

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template name="xsl:initial-template">
    <daily-summary>
      <xsl:merge>
        <xsl:merge-source name="all" select="doc('log.xml')//entry">
          <xsl:merge-key select="xs:date(substring(@timestamp, 1, 10))"
            order="ascending"/>
        </xsl:merge-source>
        <xsl:merge-action>
          <day date="{$current-merge-key}"
            count="{count($current-merge-group)}"
            errors="{count($current-merge-group[@level='ERROR'])}"/>
        </xsl:merge-action>
      </xsl:merge>
    </daily-summary>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- `$current-merge-group` is a sequence; use `count()`, `sum()`, `for-each`, or other sequence operations on it.
- `current-merge-group('name')` returns items from one named source only. Items appear in document order within that source.
- When only one source contributes to a key group, `current-merge-group('other-source')` returns the empty sequence.
- `xsl:merge-action` is streamable if its content is streamable.

## See also

- [xsl:merge](../xsl-merge)
- [xsl:merge-source](../xsl-merge-source)
- [xsl:merge-key](../xsl-merge-key)
