---
title: "xsl:value-of"
description: "Outputs the string value of an XPath expression as a text node in the result tree."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "element"
syntax: '<xsl:value-of select="expression" disable-output-escaping="no"/>'
tags: ["xslt", "reference", "xslt1"]
---

## Description

`xsl:value-of` evaluates an XPath expression and writes its string value as a text node into the result tree. It is one of the most frequently used XSLT instructions and the primary way to copy data from the source XML into the output.

When the `select` expression returns a node-set, only the string value of the **first** node is used in XSLT 1.0. In XSLT 2.0 and later the result is a sequence, and all items are concatenated with a single space separator by default (or with the separator specified by the `separator` attribute).

The optional `disable-output-escaping` attribute, when set to `yes`, writes the text without escaping characters like `<` and `&`. This is rarely needed and can produce invalid XML; avoid it unless you have a specific requirement such as injecting pre-built HTML markup.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `select` | XPath expression | Yes | Expression whose string value is written to the output. |
| `disable-output-escaping` | `"yes"` \| `"no"` | No | Defaults to `"no"`. When `"yes"`, special characters are not escaped. Use with care. |
| `separator` | string (XSLT 2.0+) | No | String placed between items when the sequence contains more than one item. Defaults to a single space. |

## Return value

Produces a text node in the result tree. The instruction itself has no XPath return value.

## Examples

### Output a single element value

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<book>
  <title>Learning XSLT</title>
  <author>Jane Smith</author>
</book>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>

  <xsl:template match="/book">
    <xsl:value-of select="title"/>
    <xsl:text> by </xsl:text>
    <xsl:value-of select="author"/>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```
Learning XSLT by Jane Smith
```

### Concatenate all items (XSLT 2.0)

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<tags>
  <tag>xslt</tag>
  <tag>xml</tag>
  <tag>xpath</tag>
</tags>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>

  <xsl:template match="/tags">
    <xsl:value-of select="tag" separator=", "/>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```
xslt, xml, xpath
```

## Notes

- In XSLT 1.0, if `select` returns a node-set with multiple nodes, only the first node's string value is output. Use `xsl:for-each` to iterate all nodes.
- The `separator` attribute was introduced in XSLT 2.0 and is not available in 1.0 stylesheets.
- To produce an attribute value, use `xsl:attribute` with a value template `{expression}` instead of `xsl:value-of`.
- `xsl:copy-of` preserves nodes including their type; use it when you need to copy nodes rather than their string representation.

## See also

- [xsl:for-each](../xsl-for-each)
- [concat()](../xpath-concat)
