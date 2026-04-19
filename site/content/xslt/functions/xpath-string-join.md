---
title: "string-join()"
description: "Joins a sequence of strings into a single string with a specified separator between each item."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "string function"
syntax: "string-join(sequence, separator?)"
tags: ["xslt", "reference", "xslt2", "xpath"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0idGV4dCIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvdGFncyI-CiAgICA8eHNsOnZhbHVlLW9mIHNlbGVjdD0ic3RyaW5nLWpvaW4odGFnLCAnLCAnKSIvPgogIDwveHNsOnRlbXBsYXRlPgo8L3hzbDpzdHlsZXNoZWV0Pg&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHRhZ3M-CiAgPHRhZz54c2x0PC90YWc-CiAgPHRhZz54bWw8L3RhZz4KICA8dGFnPnhwYXRoPC90YWc-CiAgPHRhZz50cmFuc2Zvcm1hdGlvbjwvdGFnPgo8L3RhZ3M-&version=2.0"
---

## Description

`string-join()` takes a sequence of strings and concatenates them into a single string, placing the separator between each consecutive pair of items. If the sequence contains only one item, no separator is added. If the sequence is empty, an empty string is returned.

The `separator` argument is optional in XPath 3.1; when omitted it defaults to an empty string (items are concatenated with no separator). In XPath 2.0 the separator argument is required.

`string-join()` is the idiomatic XSLT 2.0+ replacement for the XSLT 1.0 pattern of iterating with `xsl:for-each` and manually appending separators using `position() != last()`. It works on any sequence of atomic values (each is converted to a string) and on element text content via paths like `element/string()`.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sequence` | xs:string* | Yes | The sequence of strings to join. Non-string items are converted to strings. |
| `separator` | xs:string | No (XPath 3.1+) / Yes (XPath 2.0) | The string inserted between each pair of adjacent items. |

## Return value

`xs:string` — all items in the sequence joined by the separator.

## Examples

### Join element values with a comma

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<tags>
  <tag>xslt</tag>
  <tag>xml</tag>
  <tag>xpath</tag>
  <tag>transformation</tag>
</tags>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>

  <xsl:template match="/tags">
    <xsl:value-of select="string-join(tag, ', ')"/>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```
xslt, xml, xpath, transformation
```

### Build a pipe-delimited list in an attribute

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/tags">
    <index keywords="{string-join(tag, '|')}"/>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<index keywords="xslt|xml|xpath|transformation"/>
```

### Join string values from a sequence expression

```xml
<!-- Join all unique category values found in a product catalog -->
<xsl:value-of select="string-join(distinct-values(//product/category), ' / ')"/>
```

## Notes

- `string-join()` requires XSLT 2.0 or later. In XSLT 1.0, replicate the behaviour with `xsl:for-each` and a `position() != last()` conditional separator.
- The function does not add a leading or trailing separator — only between items.
- Non-string items in the sequence (numbers, booleans) are cast to `xs:string` before joining.
- To join node string values, use the path expression directly: `string-join(item, ', ')` extracts each `item` element's text content automatically.

## See also

- [tokenize()](../xpath-tokenize)
- [concat()](../xpath-concat)
