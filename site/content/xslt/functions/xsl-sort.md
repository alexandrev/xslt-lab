---
title: "xsl:sort"
description: "Specifies a sort key for xsl:apply-templates or xsl:for-each, controlling the order in which nodes are processed."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "element"
syntax: '<xsl:sort select="expression" order="ascending|descending" data-type="text|number"/>'
tags: ["xslt", "reference", "xslt1"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjEuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvcHJvZHVjdHMiPgogICAgPHNvcnRlZD4KICAgICAgPHhzbDphcHBseS10ZW1wbGF0ZXMgc2VsZWN0PSJwcm9kdWN0Ij4KICAgICAgICA8eHNsOnNvcnQgc2VsZWN0PSJAcHJpY2UiIGRhdGEtdHlwZT0ibnVtYmVyIiBvcmRlcj0iYXNjZW5kaW5nIi8-CiAgICAgIDwveHNsOmFwcGx5LXRlbXBsYXRlcz4KICAgIDwvc29ydGVkPgogIDwveHNsOnRlbXBsYXRlPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSJwcm9kdWN0Ij4KICAgIDxpdGVtIHByaWNlPSJ7QHByaWNlfSI-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9Ii4iLz48L2l0ZW0-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHByb2R1Y3RzPgogIDxwcm9kdWN0IHByaWNlPSIyNC45OSI-R2FkZ2V0PC9wcm9kdWN0PgogIDxwcm9kdWN0IHByaWNlPSI5Ljk5Ij5XaWRnZXQ8L3Byb2R1Y3Q-CiAgPHByb2R1Y3QgcHJpY2U9IjQ5Ljk5Ij5EZXZpY2U8L3Byb2R1Y3Q-CiAgPHByb2R1Y3QgcHJpY2U9IjQuNDkiPkJvbHQ8L3Byb2R1Y3Q-CjwvcHJvZHVjdHM-&version=1.0"
---

## Description

`xsl:sort` is placed as an immediate child of `xsl:apply-templates` or `xsl:for-each` to define the sort order for node processing. It does not alter the source document; it only changes the sequence in which the processor visits the selected nodes.

Multiple `xsl:sort` elements can be nested to define compound sort keys: the first `xsl:sort` is the primary key, the second is the secondary key (used when the primary values are equal), and so on.

The `select` attribute is an XPath expression evaluated against each candidate node to produce its sort key. Omitting `select` defaults to the string value of the context node (equivalent to `select="."`). The `data-type` attribute controls whether comparison is lexicographic (`text`, the default) or numeric (`number`). When sorting numerically, the key is converted to a number; non-numeric strings sort as `NaN`, which typically appears first in ascending order.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `select` | XPath expression | No | Sort key expression. Defaults to `.` (string value of context node). |
| `order` | `ascending` / `descending` | No | Sort direction. Default is `ascending`. |
| `data-type` | `text` / `number` / QName | No | Comparison type. Default is `text`. |
| `case-order` | `upper-first` / `lower-first` | No | Case ordering for text comparisons. Processor-defined default. |
| `lang` | language code | No | Language for locale-sensitive collation. |

## Examples

### Sort by numeric attribute

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<products>
  <product price="24.99">Gadget</product>
  <product price="9.99">Widget</product>
  <product price="49.99">Device</product>
  <product price="4.49">Bolt</product>
</products>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/products">
    <sorted>
      <xsl:apply-templates select="product">
        <xsl:sort select="@price" data-type="number" order="ascending"/>
      </xsl:apply-templates>
    </sorted>
  </xsl:template>

  <xsl:template match="product">
    <item price="{@price}"><xsl:value-of select="."/></item>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<sorted>
  <item price="4.49">Bolt</item>
  <item price="9.99">Widget</item>
  <item price="24.99">Gadget</item>
  <item price="49.99">Device</item>
</sorted>
```

### Multi-key sort: last name then first name

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<people>
  <person first="Alice" last="Smith"/>
  <person first="Bob" last="Jones"/>
  <person first="Anna" last="Smith"/>
  <person first="Carol" last="Jones"/>
</people>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/people">
    <sorted>
      <xsl:for-each select="person">
        <xsl:sort select="@last"/>
        <xsl:sort select="@first"/>
        <person><xsl:value-of select="concat(@first, ' ', @last)"/></person>
      </xsl:for-each>
    </sorted>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<sorted>
  <person>Bob Jones</person>
  <person>Carol Jones</person>
  <person>Alice Smith</person>
  <person>Anna Smith</person>
</sorted>
```

## Notes

- `xsl:sort` elements must appear before any other content inside `xsl:for-each` or `xsl:apply-templates`. Placing them after output instructions is a schema error.
- When `data-type="number"`, the sort key is converted to a floating-point number. Values that cannot be converted become `NaN`; in ascending order, `NaN` values typically sort before any numeric value, but this is implementation-defined.
- Text sorting is locale-sensitive in theory, but XSLT 1.0 has limited collation support. Use the `lang` attribute or processor-specific collation URIs for reliable locale-aware sorting.
- The `position()` function inside a sorted `xsl:for-each` reflects the sorted position, not the original document position.

## See also

- [xsl:for-each](../xsl-for-each)
- [xsl:apply-templates](../xsl-apply-templates)
- [xsl:number](../xsl-number)
