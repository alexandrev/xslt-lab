---
title: "sum()"
description: "Returns the sum of the numeric values in a node-set or sequence, or a specified zero value for empty sequences."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "numeric function"
syntax: "sum(node-set)"
tags: ["xslt", "reference", "xslt1", "xpath"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjEuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0idGV4dCIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvaW52b2ljZSI-CiAgICA8eHNsOnRleHQ-VG90YWw6IDwveHNsOnRleHQ-CiAgICA8eHNsOnZhbHVlLW9mIHNlbGVjdD0ic3VtKGxpbmUvQGFtb3VudCkiLz4KICA8L3hzbDp0ZW1wbGF0ZT4KPC94c2w6c3R5bGVzaGVldD4&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGludm9pY2U-CiAgPGxpbmUgYW1vdW50PSIyOS45OSIvPgogIDxsaW5lIGFtb3VudD0iMTQuNTAiLz4KICA8bGluZSBhbW91bnQ9IjUuMDAiLz4KPC9pbnZvaWNlPg&version=1.0"
---

## Description

`sum()` converts each node in a node-set to a number (using the XPath `number()` rules) and returns their total as a double. If any node cannot be converted to a number, its value is treated as `NaN`, and the entire result is `NaN`.

In XSLT 2.0+, `sum()` accepts any sequence of atomic values that can be added together. A second argument may be provided as a **zero value** to return when the sequence is empty (in XPath 1.0, `sum()` on an empty node-set returns `0`).

`sum()` is the standard way to compute totals over repeated elements, such as order amounts, quantities, or scores, without writing an explicit loop.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `node-set` | node-set / sequence | Yes | The nodes or items to sum. Each is converted to a number. |
| `zero` | atomic value | No | Value to return if the sequence is empty (XPath 2.0+). Defaults to `0`. |

## Return value

`xs:double` (XPath 1.0) or the type matching the input sequence (XPath 2.0+) — the numeric sum of all items.

## Examples

### Sum all child element values

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<invoice>
  <line amount="29.99"/>
  <line amount="14.50"/>
  <line amount="5.00"/>
</invoice>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>

  <xsl:template match="/invoice">
    <xsl:text>Total: </xsl:text>
    <xsl:value-of select="sum(line/@amount)"/>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```
Total: 49.49
```

### Conditional sum (sum filtered values)

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<sales>
  <sale region="North" amount="100"/>
  <sale region="South" amount="250"/>
  <sale region="North" amount="175"/>
  <sale region="South" amount="80"/>
</sales>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/sales">
    <totals>
      <north><xsl:value-of select="sum(sale[@region='North']/@amount)"/></north>
      <south><xsl:value-of select="sum(sale[@region='South']/@amount)"/></south>
    </totals>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<totals>
  <north>275</north>
  <south>330</south>
</totals>
```

### Empty sequence with fallback (XSLT 2.0)

```xml
<!-- Returns 0 when there are no discount elements -->
<xsl:value-of select="sum(discount/@value, 0)"/>
```

## Notes

- Nodes that cannot be converted to a number (e.g., text like `"N/A"`) produce `NaN`, which propagates through the sum. Validate data or use `number()` with a fallback before summing.
- `sum()` on an empty node-set returns `0` in XPath 1.0. In XPath 2.0+, the second argument controls this behaviour.
- For an average, there is no built-in `avg()` in XPath 1.0. Compute it as `sum(nodes) div count(nodes)`. XPath 2.0+ provides `avg()`.
- `sum()` works on attribute nodes as well as element text nodes; the path `sum(items/item/@qty)` is valid.

## See also

- [count()](../xpath-count)
