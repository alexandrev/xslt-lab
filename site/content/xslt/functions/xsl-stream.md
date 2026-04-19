---
title: "xsl:stream"
description: "Processes a source document in streaming mode without loading it fully into memory, enabling transformation of arbitrarily large XML files."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "element"
syntax: '<xsl:stream href="uri">...</xsl:stream>'
tags: ["xslt", "reference", "xslt3"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczp4cz0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnBhcmFtIG5hbWU9InNvdXJjZS11cmkiIHNlbGVjdD0iJ2xhcmdlLWxvZy54bWwnIi8-CgogIDx4c2w6dGVtcGxhdGUgbmFtZT0ieHNsOmluaXRpYWwtdGVtcGxhdGUiPgogICAgPHhzbDpzdHJlYW0gaHJlZj0ieyRzb3VyY2UtdXJpfSI-CiAgICAgIDxyZXN1bHQ-CiAgICAgICAgPGNvdW50PgogICAgICAgICAgPHhzbDp2YWx1ZS1vZiBzZWxlY3Q9ImNvdW50KC8vZW50cnkpIi8-CiAgICAgICAgPC9jb3VudD4KICAgICAgPC9yZXN1bHQ-CiAgICA8L3hzbDpzdHJlYW0-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHJvb3QvPg&version=3.0"
---

## Description

`xsl:stream` is the gateway to XSLT 3.0 streaming. Instead of loading the entire source document into memory as a tree, the processor reads it as a sequential stream of events (similar to SAX). This makes it possible to process XML files of any size — gigabytes of log data, large export files, huge datasets — without running out of memory.

The `href` attribute specifies the URI of the document to stream. The content of `xsl:stream` is a sequence constructor that is evaluated in streaming mode. The context item within the constructor is the document node of the streamed document.

Streaming imposes important restrictions. You can only make *one downward pass* through each node. You cannot navigate upward (to the parent or document node after descending) or reference a node more than once. Templates called from within a streaming context must themselves be streamable. `xsl:accumulator` is the primary mechanism for gathering state as nodes stream past.

`xsl:stream` is a top-level instruction typically placed inside a template matching `/` or invoked from an initial template. It is supported by processors that declare streaming support (Saxon EE, for example). Processors that do not support streaming treat `xsl:stream` as an error unless the `[XTSE3430]` fallback is handled.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `href` | URI | Yes | The URI of the document to process in streaming mode. |

## Examples

### Count elements in a large document without loading it

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:param name="source-uri" select="'large-log.xml'"/>

  <xsl:template name="xsl:initial-template">
    <xsl:stream href="{$source-uri}">
      <result>
        <count>
          <xsl:value-of select="count(//entry)"/>
        </count>
      </result>
    </xsl:stream>
  </xsl:template>
</xsl:stylesheet>
```

### Streaming with an accumulator to track totals

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <!-- Accumulator tracks running total of order amounts -->
  <xsl:accumulator name="total-sales" as="xs:decimal"
    initial-value="0" streamable="yes">
    <xsl:accumulator-rule match="order" phase="end"
      select="$value + xs:decimal(@amount)"/>
  </xsl:accumulator>

  <xsl:param name="orders-uri" select="'orders.xml'"/>

  <xsl:template name="xsl:initial-template">
    <xsl:stream href="{$orders-uri}" use-accumulators="total-sales">
      <xsl:mode streamable="yes" use-accumulators="total-sales"/>
      <xsl:apply-templates select="." mode="#unnamed"/>
    </xsl:stream>
  </xsl:template>

  <xsl:template match="/" mode="#unnamed">
    <summary>
      <total-sales>
        <xsl:value-of select="accumulator-after('total-sales')"/>
      </total-sales>
    </summary>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- Streaming requires processor support; not all XSLT 3.0 processors implement it. Saxon EE supports full streaming.
- Within `xsl:stream`, expressions must follow streamability rules: no upward axes after descending, no multiple passes over a node.
- Use `xsl:fork` inside `xsl:stream` to process the stream in multiple independent branches in a single pass.
- `xsl:stream` cannot appear inside a template or function — it must be a direct call from an initial template or a template with a streaming-compatible context.

## See also

- [xsl:fork](../xsl-fork)
- [xsl:merge](../xsl-merge)
- [xsl:accumulator](../xsl-accumulator)
