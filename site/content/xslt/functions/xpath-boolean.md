---
title: "boolean()"
description: "Converts any XPath value — node-set, string, number, or boolean — to a boolean according to XPath 1.0 rules."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "boolean function"
syntax: "boolean(object)"
tags: ["xslt", "reference", "xpath", "xslt1"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjEuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvY29uZmlnIj4KICAgIDxyZXN1bHRzPgogICAgICA8aGFzLWxhYmVsPjx4c2w6dmFsdWUtb2Ygc2VsZWN0PSJib29sZWFuKGxhYmVsKSIvPjwvaGFzLWxhYmVsPgogICAgICA8aGFzLWVtcHR5Pjx4c2w6dmFsdWUtb2Ygc2VsZWN0PSJib29sZWFuKGVtcHR5KSIvPjwvaGFzLWVtcHR5PgogICAgPC9yZXN1bHRzPgogIDwveHNsOnRlbXBsYXRlPgo8L3hzbDpzdHlsZXNoZWV0Pg&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGNvbmZpZz4KICA8bGFiZWw-YWN0aXZlPC9sYWJlbD4KICA8ZW1wdHk-PC9lbXB0eT4KPC9jb25maWc-&version=1.0"
---

## Description

`boolean()` converts its argument to a boolean value following the XPath 1.0 type-conversion rules. The result is always `true` or `false`.

The conversion rules depend on the type of the argument:

- **Node-set:** `true` if the node-set is non-empty, `false` otherwise.
- **String:** `true` if the string has a length greater than zero, `false` for the empty string `""`.
- **Number:** `true` if the number is not zero and not `NaN`, `false` for `0` and `NaN`.
- **Boolean:** returned unchanged.

In practice, most XPath predicates and `xsl:if/@test` expressions perform an implicit boolean conversion, so an explicit call to `boolean()` is needed only when you want to convert a value to a boolean for output or further processing.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `object` | any | Yes | The value to convert. Accepts node-set, string, number, or boolean. |

## Return value

`xs:boolean` — `true` or `false` according to the XPath 1.0 boolean conversion rules.

## Examples

### Convert a string to boolean

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<config>
  <label>active</label>
  <empty></empty>
</config>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/config">
    <results>
      <has-label><xsl:value-of select="boolean(label)"/></has-label>
      <has-empty><xsl:value-of select="boolean(empty)"/></has-empty>
    </results>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<results>
  <has-label>true</has-label>
  <has-empty>false</has-empty>
</results>
```

### Convert a number to boolean

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<data>
  <count>5</count>
  <zero>0</zero>
</data>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/data">
    <results>
      <count-bool><xsl:value-of select="boolean(number(count))"/></count-bool>
      <zero-bool><xsl:value-of select="boolean(number(zero))"/></zero-bool>
    </results>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<results>
  <count-bool>true</count-bool>
  <zero-bool>false</zero-bool>
</results>
```

## Notes

- An empty node-set, an empty string, the number `0`, and `NaN` all convert to `false`. Everything else converts to `true`.
- Calling `boolean()` explicitly is uncommon inside `xsl:if/@test` because XPath already evaluates the test expression as a boolean. Use it when you need to output the literal string `"true"` or `"false"`.
- `NaN` (produced by operations like `number('abc')`) converts to `false`, not an error.
- In XSLT 2.0+ the `xs:boolean()` constructor and the `fn:boolean()` function behave similarly but operate on sequences; an empty sequence returns `false`.

## See also

- [not()](../xpath-not)
- [true()](../xpath-true)
- [false()](../xpath-false)
