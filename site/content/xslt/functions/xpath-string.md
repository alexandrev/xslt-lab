---
title: "string()"
description: "Converts a node-set, number, or boolean to its XPath string value, or returns the string value of the context node when called with no argument."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "string function"
syntax: "string(object?)"
tags: ["xslt", "reference", "xpath", "xslt1"]
---

## Description

`string()` converts its argument to a string using XPath 1.0 string-value rules:

- **Node-set:** returns the string value of the first node in document order. For element nodes, this is the concatenation of all text-node descendants; for attribute nodes, the attribute value; for the document node, the concatenation of all text descendants.
- **Number:** returns the canonical decimal representation. `NaN` becomes `"NaN"`, infinity becomes `"Infinity"`.
- **Boolean:** `true` becomes `"true"`, `false` becomes `"false"`.
- **String:** returned unchanged.

When called with no arguments, `string()` returns the string value of the context node, equivalent to `string(.)`.

`string()` is used to extract the textual content of complex elements (flattening all descendant text nodes into one string), to convert numbers or booleans for string comparison, or to force a node-set to a scalar string value.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `object` | any | No | Value to convert. Defaults to the context node when omitted. |

## Return value

`xs:string` — the string representation of the argument.

## Examples

### Extract concatenated text content of an element

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<article>
  <body>
    <p>First paragraph.</p>
    <p>Second <em>paragraph</em>.</p>
  </body>
</article>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/article">
    <text>
      <xsl:value-of select="string(body)"/>
    </text>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<text>
    First paragraph.
    Second paragraph.
  </text>
```

### Convert numbers and booleans to strings

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<data>
  <count>5</count>
</data>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/data">
    <results>
      <num-as-string><xsl:value-of select="string(count)"/></num-as-string>
      <bool-true><xsl:value-of select="string(true())"/></bool-true>
      <bool-false><xsl:value-of select="string(false())"/></bool-false>
      <nan><xsl:value-of select="string(number('abc'))"/></nan>
    </results>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<results>
  <num-as-string>5</num-as-string>
  <bool-true>true</bool-true>
  <bool-false>false</bool-false>
  <nan>NaN</nan>
</results>
```

## Notes

- For a node-set with multiple nodes, `string()` only returns the value of the **first node** in document order. To concatenate all nodes, use `string-join()` (XSLT 2.0+) or iterate with `xsl:for-each`.
- Calling `string()` on an element that contains mixed content (text and child elements) returns all descendant text nodes joined together, with no separators.
- `string(0)` returns `"0"`, `string(-0)` returns `"0"` (negative zero is normalised).
- In XSLT 2.0+, `string()` behaves similarly but the argument may be a sequence; if the sequence has more than one item, an error is raised unless using the XPath 2.0 `data()` or `string-join()` function instead.

## See also

- [string-length()](../xpath-string-length)
- [normalize-space()](../xpath-normalize-space)
- [concat()](../xpath-concat)
