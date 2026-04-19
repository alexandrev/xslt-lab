---
title: "snapshot()"
description: "Returns a snapshot copy of the sequence, making streamed nodes available for multiple use."
date: 2026-04-19T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "node function"
syntax: "snapshot(sequence?)"
tags: ["xslt", "reference", "xpath", "xslt3"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSI-CiAgPHhzbDpvdXRwdXQgbWV0aG9kPSJ4bWwiIGluZGVudD0ieWVzIi8-CgogIDx4c2w6dGVtcGxhdGUgbWF0Y2g9Ii9vcmRlcnMiPgogICAgPCEtLSBzbmFwc2hvdCgpIGxldHMgdXMgdXNlIHRoZSBvcmRlcnMgbm9kZS1zZXQgdHdpY2UgLS0-CiAgICA8eHNsOnZhcmlhYmxlIG5hbWU9InNuYXAiIHNlbGVjdD0ic25hcHNob3Qob3JkZXIpIi8-CiAgICA8cmVwb3J0PgogICAgICA8Y291bnQ-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9ImNvdW50KCRzbmFwKSIvPjwvY291bnQ-CiAgICAgIDx0b3RhbD48eHNsOnZhbHVlLW9mIHNlbGVjdD0ic3VtKCRzbmFwL0BhbW91bnQpIi8-PC90b3RhbD4KICAgIDwvcmVwb3J0PgogIDwveHNsOnRlbXBsYXRlPgo8L3hzbDpzdHlsZXNoZWV0Pg&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPG9yZGVycz4KICA8b3JkZXIgaWQ9IjEiIGFtb3VudD0iMTAwIi8-CiAgPG9yZGVyIGlkPSIyIiBhbW91bnQ9IjIwMCIvPgogIDxvcmRlciBpZD0iMyIgYW1vdW50PSIxNTAiLz4KPC9vcmRlcnM-&version=3.0"
---

## Description

`snapshot()` returns a deep copy of its argument sequence, detached from the original document. Its primary purpose is in streaming mode: when a template is processing a streamed document, nodes are typically available only once and cannot be re-read. Calling `snapshot()` materializes those nodes into a persistent in-memory copy that can be used multiple times, stored in a variable, or passed to a function that requires grounded (non-streamed) nodes.

Outside of streaming mode, `snapshot()` behaves identically to `copy-of()` and produces deep copies of all node items. Atomic values in the sequence are returned unchanged.

When called without arguments in XSLT 3.0, the function snapshots the context item.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sequence` | item()* | No | The sequence to snapshot. Defaults to the context item if omitted. |

## Return value

`item()*` — a deep copy of the node items in the sequence; atomic values returned unchanged.

## Examples

### Capturing streamed nodes for reuse

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<orders>
  <order id="1" amount="100"/>
  <order id="2" amount="200"/>
  <order id="3" amount="150"/>
</orders>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/orders">
    <!-- snapshot() lets us use the orders node-set twice -->
    <xsl:variable name="snap" select="snapshot(order)"/>
    <report>
      <count><xsl:value-of select="count($snap)"/></count>
      <total><xsl:value-of select="sum($snap/@amount)"/></total>
    </report>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<report>
  <count>3</count>
  <total>450</total>
</report>
```

### Snapshot of the context item

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="order">
    <xsl:variable name="copy" select="snapshot()"/>
    <!-- $copy can be used multiple times -->
    <saved id="{$copy/@id}" amount="{$copy/@amount}"/>
  </xsl:template>

  <xsl:template match="/orders">
    <saved-orders>
      <xsl:apply-templates select="order"/>
    </saved-orders>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<saved-orders>
  <saved id="1" amount="100"/>
  <saved id="2" amount="200"/>
  <saved id="3" amount="150"/>
</saved-orders>
```

## Notes

- `snapshot()` is a no-op on atomic values; they are returned unchanged.
- In non-streaming mode, `snapshot()` and `copy-of()` produce equivalent results.
- Use `snapshot()` rather than `copy-of()` when the intent is specifically to escape the streaming constraint, as this communicates the purpose more clearly to readers.
- The function was added in XPath 3.0 specifically to support the XSLT 3.0 streaming model.

## See also

- [copy-of()](../xpath-copy-of)
- [accumulator-before()](../xpath-accumulator-before)
- [accumulator-after()](../xpath-accumulator-after)
