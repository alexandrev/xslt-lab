---
title: "xsl:iterate"
description: "Processes a sequence item-by-item with carry-forward parameters, enabling efficient streaming and stateful iteration in XSLT 3.0."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "element"
syntax: "<xsl:iterate select=\"sequence\">"
tags: ["xslt", "reference", "xslt3"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iCiAgeG1sbnM6eHM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hIj4KICA8eHNsOm91dHB1dCBtZXRob2Q9InhtbCIgaW5kZW50PSJ5ZXMiLz4KCiAgPHhzbDp0ZW1wbGF0ZSBtYXRjaD0iL29yZGVycyI-CiAgICA8eHNsOml0ZXJhdGUgc2VsZWN0PSJvcmRlciI-CiAgICAgIDx4c2w6cGFyYW0gbmFtZT0idG90YWwiIGFzPSJ4czpkZWNpbWFsIiBzZWxlY3Q9IjAiLz4KICAgICAgPHhzbDpuZXh0LWl0ZXJhdGlvbj4KICAgICAgICA8eHNsOndpdGgtcGFyYW0gbmFtZT0idG90YWwiIHNlbGVjdD0iJHRvdGFsICsgeHM6ZGVjaW1hbChAYW1vdW50KSIvPgogICAgICA8L3hzbDpuZXh0LWl0ZXJhdGlvbj4KICAgICAgPHhzbDpvbi1jb21wbGV0aW9uPgogICAgICAgIDxzdW1tYXJ5PgogICAgICAgICAgPHRvdGFsPjx4c2w6dmFsdWUtb2Ygc2VsZWN0PSIkdG90YWwiLz48L3RvdGFsPgogICAgICAgIDwvc3VtbWFyeT4KICAgICAgPC94c2w6b24tY29tcGxldGlvbj4KICAgIDwveHNsOml0ZXJhdGU-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPG9yZGVycz4KICA8b3JkZXIgYW1vdW50PSIxMjAuMDAiLz4KICA8b3JkZXIgYW1vdW50PSI0NS41MCIvPgogIDxvcmRlciBhbW91bnQ9IjIwMC4wMCIvPgogIDxvcmRlciBhbW91bnQ9IjMzLjI1Ii8-Cjwvb3JkZXJzPg&version=3.0"
---

## Description

`xsl:iterate` is an XSLT 3.0 instruction that processes a sequence one item at a time, similar to `xsl:for-each`, but with two important additions:

1. **Carry-forward parameters** — declared with `xsl:param` inside the instruction, updated at the end of each iteration via `xsl:next-iteration`, and available in the final result via `xsl:on-completion`.
2. **Early termination** — `xsl:break` stops iteration before the end of the sequence, optionally emitting output at that point.

These features make `xsl:iterate` the right tool for running aggregations (cumulative totals, maximums, etc.), building state across items, or stopping as soon as a condition is met. It also works in **streaming mode** (`xsl:stream`) because it processes the sequence without needing to hold it all in memory simultaneously.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `select` | XPath expression | Yes | The sequence to iterate over. |

### Child elements

| Element | Description |
|---------|-------------|
| `xsl:param` | Declares a carry-forward parameter with an initial value. |
| `xsl:next-iteration` | Provides updated parameter values for the next iteration. Must be the last instruction in the body (or inside `xsl:break`). |
| `xsl:on-completion` | Body executed after the last item (or after `xsl:break`). Has access to the final carry-forward parameter values. |
| `xsl:break` | Terminates the iteration immediately; can contain `xsl:on-completion` inline. |

## Return value

The instruction produces the nodes/items written by its body instructions and by `xsl:on-completion`.

## Examples

### Running total

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<orders>
  <order amount="120.00"/>
  <order amount="45.50"/>
  <order amount="200.00"/>
  <order amount="33.25"/>
</orders>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/orders">
    <xsl:iterate select="order">
      <xsl:param name="total" as="xs:decimal" select="0"/>
      <xsl:next-iteration>
        <xsl:with-param name="total" select="$total + xs:decimal(@amount)"/>
      </xsl:next-iteration>
      <xsl:on-completion>
        <summary>
          <total><xsl:value-of select="$total"/></total>
        </summary>
      </xsl:on-completion>
    </xsl:iterate>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<summary>
  <total>398.75</total>
</summary>
```

### Stop at first match

**Stylesheet (find the first order over 100):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/orders">
    <xsl:iterate select="order">
      <xsl:choose>
        <xsl:when test="xs:decimal(@amount) gt 100">
          <xsl:break>
            <first-large-order amount="{@amount}"/>
          </xsl:break>
        </xsl:when>
      </xsl:choose>
    </xsl:iterate>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<first-large-order amount="120.00"/>
```

## Notes

- `xsl:iterate` requires XSLT 3.0. Use `xsl:for-each` for XSLT 1.0/2.0 iteration without carry-forward state.
- The `xsl:next-iteration` instruction must appear as the last step of the loop body; any instructions after it are not executed.
- `xsl:on-completion` sees the parameter values from the **last completed** iteration (or initial values if the sequence was empty).
- When used with `xsl:stream`, the select sequence can be a document node read in streaming fashion, processing arbitrarily large files in bounded memory.

## See also

- [xsl:for-each](../xsl-for-each)
