---
title: "xsl:for-each"
description: "Iterates over a node-set or sequence, applying the contained template body to each item in document order."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "element"
syntax: "<xsl:for-each select=\"node-set\">"
tags: ["xslt", "reference", "xslt1"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjEuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvY2F0YWxvZyI-CiAgICA8dWw-CiAgICAgIDx4c2w6Zm9yLWVhY2ggc2VsZWN0PSJpdGVtIj4KICAgICAgICA8bGk-CiAgICAgICAgICA8eHNsOnZhbHVlLW9mIHNlbGVjdD0ibmFtZSIvPgogICAgICAgICAgPHhzbDp0ZXh0PiDigJQgJDwveHNsOnRleHQ-CiAgICAgICAgICA8eHNsOnZhbHVlLW9mIHNlbGVjdD0icHJpY2UiLz4KICAgICAgICA8L2xpPgogICAgICA8L3hzbDpmb3ItZWFjaD4KICAgIDwvdWw-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGNhdGFsb2c-CiAgPGl0ZW0gaWQ9IjEiPjxuYW1lPldpZGdldDwvbmFtZT48cHJpY2U-OS45OTwvcHJpY2U-PC9pdGVtPgogIDxpdGVtIGlkPSIyIj48bmFtZT5HYWRnZXQ8L25hbWU-PHByaWNlPjI0Ljk5PC9wcmljZT48L2l0ZW0-CiAgPGl0ZW0gaWQ9IjMiPjxuYW1lPkRvb2hpY2tleTwvbmFtZT48cHJpY2U-NC40OTwvcHJpY2U-PC9pdGVtPgo8L2NhdGFsb2c-&version=1.0"
---

## Description

`xsl:for-each` selects a set of nodes (or, in XSLT 2.0+, a sequence of items) and processes each one in turn. Within the loop body, the **context node** changes to the current item, so XPath expressions are evaluated relative to it.

It is the standard way to iterate over child elements or any repeated node structure when you do not want to use recursive template matching. The loop body can contain any sequence of XSLT instructions: output elements, `xsl:value-of`, nested `xsl:for-each` calls, conditionals, and so on.

An optional `xsl:sort` child element placed immediately inside `xsl:for-each` (before any other content) changes the processing order without altering the source document.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `select` | XPath expression | Yes | Node-set or sequence to iterate over. |

### Child element: `xsl:sort`

Place one or more `xsl:sort` elements as the first children to sort the selected set before processing.

| Attribute | Description |
|-----------|-------------|
| `select` | XPath expression used as the sort key. |
| `order` | `"ascending"` (default) or `"descending"`. |
| `data-type` | `"text"` (default) or `"number"`. |

## Examples

### Iterate over child elements

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <item id="1"><name>Widget</name><price>9.99</price></item>
  <item id="2"><name>Gadget</name><price>24.99</price></item>
  <item id="3"><name>Doohickey</name><price>4.49</price></item>
</catalog>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/catalog">
    <ul>
      <xsl:for-each select="item">
        <li>
          <xsl:value-of select="name"/>
          <xsl:text> — $</xsl:text>
          <xsl:value-of select="price"/>
        </li>
      </xsl:for-each>
    </ul>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<ul>
  <li>Widget — $9.99</li>
  <li>Gadget — $24.99</li>
  <li>Doohickey — $4.49</li>
</ul>
```

### Sorted iteration

**Stylesheet (sort by price descending):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/catalog">
    <ul>
      <xsl:for-each select="item">
        <xsl:sort select="price" data-type="number" order="descending"/>
        <li>
          <xsl:value-of select="concat(name, ' — $', price)"/>
        </li>
      </xsl:for-each>
    </ul>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<ul>
  <li>Gadget — $24.99</li>
  <li>Widget — $9.99</li>
  <li>Doohickey — $4.49</li>
</ul>
```

## Notes

- `position()` and `last()` inside the loop refer to the position within the selected set, not the original document position.
- `current()` inside the loop returns the same node as `.` (the context node). It becomes useful when `current()` is called inside a predicate.
- For grouping scenarios (e.g., group items by category) prefer `xsl:for-each-group` (XSLT 2.0+) over the Muenchian method with `xsl:for-each`.
- Template rules (`xsl:apply-templates`) are generally more flexible and reusable than `xsl:for-each`; use `xsl:for-each` when the transformation logic is short and self-contained.

## See also

- [xsl:for-each-group](../xsl-for-each-group)
- [position()](../xpath-position)
- [last()](../xpath-last)
