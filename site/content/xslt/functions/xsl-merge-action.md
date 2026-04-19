---
title: "xsl:merge-action"
description: "Defines the body executed for each group of items sharing the same merge key during an xsl:merge operation, with access to the merged items and current key."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "element"
syntax: "<xsl:merge-action>...</xsl:merge-action>"
tags: ["xslt", "reference", "xslt3"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczp4cz0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG5hbWU9InhzbDppbml0aWFsLXRlbXBsYXRlIj4KICAgIDxyZWNvbmNpbGlhdGlvbj4KICAgICAgPHhzbDptZXJnZT4KICAgICAgICA8eHNsOm1lcmdlLXNvdXJjZSBuYW1lPSJpbnZvaWNlcyIgc2VsZWN0PSJkb2MoJ2ludm9pY2VzLnhtbCcpLy9pbnZvaWNlIj4KICAgICAgICAgIDx4c2w6bWVyZ2Uta2V5IHNlbGVjdD0ic3RyaW5nKEBpZCkiIG9yZGVyPSJhc2NlbmRpbmciLz4KICAgICAgICA8L3hzbDptZXJnZS1zb3VyY2U-CiAgICAgICAgPHhzbDptZXJnZS1zb3VyY2UgbmFtZT0icGF5bWVudHMiIHNlbGVjdD0iZG9jKCdwYXltZW50cy54bWwnKS8vcGF5bWVudCI-CiAgICAgICAgICA8eHNsOm1lcmdlLWtleSBzZWxlY3Q9InN0cmluZyhAaW52b2ljZS1pZCkiIG9yZGVyPSJhc2NlbmRpbmciLz4KICAgICAgICA8L3hzbDptZXJnZS1zb3VyY2U-CiAgICAgICAgPHhzbDptZXJnZS1hY3Rpb24-CiAgICAgICAgICA8eHNsOnZhcmlhYmxlIG5hbWU9ImludiIgc2VsZWN0PSJjdXJyZW50LW1lcmdlLWdyb3VwKCdpbnZvaWNlcycpIi8-CiAgICAgICAgICA8eHNsOnZhcmlhYmxlIG5hbWU9InBheSIgc2VsZWN0PSJjdXJyZW50LW1lcmdlLWdyb3VwKCdwYXltZW50cycpIi8-CiAgICAgICAgICA8ZW50cnkgaWQ9InskY3VycmVudC1tZXJnZS1rZXl9Ij4KICAgICAgICAgICAgPGludm9pY2UtYW1vdW50Pjx4c2w6dmFsdWUtb2Ygc2VsZWN0PSIkaW52L0BhbW91bnQiLz48L2ludm9pY2UtYW1vdW50PgogICAgICAgICAgICA8cGFpZD48eHNsOnZhbHVlLW9mIHNlbGVjdD0iaWYgKGV4aXN0cygkcGF5KSkgdGhlbiAneWVzJyBlbHNlICdubyciLz48L3BhaWQ-CiAgICAgICAgICAgIDxwYXltZW50LWFtb3VudD4KICAgICAgICAgICAgICA8eHNsOnZhbHVlLW9mIHNlbGVjdD0iaWYgKGV4aXN0cygkcGF5KSkgdGhlbiAkcGF5L0BhbW91bnQgZWxzZSAwIi8-CiAgICAgICAgICAgIDwvcGF5bWVudC1hbW91bnQ-CiAgICAgICAgICA8L2VudHJ5PgogICAgICAgIDwveHNsOm1lcmdlLWFjdGlvbj4KICAgICAgPC94c2w6bWVyZ2U-CiAgICA8L3JlY29uY2lsaWF0aW9uPgogIDwveHNsOnRlbXBsYXRlPgo8L3hzbDpzdHlsZXNoZWV0Pg&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHJvb3QvPg&version=3.0"
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
