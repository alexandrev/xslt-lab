---
title: "local-name-from-QName()"
description: "Returns the local part of an xs:QName value as an xs:NCName."
date: 2026-04-19T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "QName function"
syntax: "local-name-from-QName(qname)"
tags: ["xslt", "reference", "xpath", "xslt2"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczp4cz0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvIj4KICAgIDxuYW1lcz4KICAgICAgPGxvY2FsPjx4c2w6dmFsdWUtb2Ygc2VsZWN0PSJsb2NhbC1uYW1lLWZyb20tUU5hbWUoUU5hbWUoJ2h0dHA6Ly9leGFtcGxlLmNvbScsICdleDpwcm9kdWN0JykpIi8-PC9sb2NhbD4KICAgICAgPGxvY2FsPjx4c2w6dmFsdWUtb2Ygc2VsZWN0PSJsb2NhbC1uYW1lLWZyb20tUU5hbWUoUU5hbWUoJycsICdzaW1wbGUnKSkiLz48L2xvY2FsPgogICAgPC9uYW1lcz4KICA8L3hzbDp0ZW1wbGF0ZT4KPC94c2w6c3R5bGVzaGVldD4&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPG5zOnJvb3QgeG1sbnM6bnM9Imh0dHA6Ly9leGFtcGxlLmNvbSI-CiAgPG5zOmNoaWxkPnRleHQ8L25zOmNoaWxkPgo8L25zOnJvb3Q-&version=2.0"
---

## Description

`local-name-from-QName()` extracts the local part of an `xs:QName` value. The local name is the part after the colon in a prefixed name, or the entire name when no prefix is present. The result is an `xs:NCName` (a non-colonized name), which is a subtype of `xs:string`.

This function works with `xs:QName` values — typed values produced by `QName()`, `resolve-QName()`, or schema-validated content — not raw string representations of names. If the argument is the empty sequence, the empty sequence is returned.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `qname` | xs:QName? | Yes | The QName from which to extract the local name. |

## Return value

`xs:NCName?` — the local part of the QName, or the empty sequence if the argument is empty.

## Examples

### Extracting local names from constructed QNames

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <names>
      <local><xsl:value-of select="local-name-from-QName(QName('http://example.com', 'ex:product'))"/></local>
      <local><xsl:value-of select="local-name-from-QName(QName('', 'simple'))"/></local>
    </names>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<names>
  <local>product</local>
  <local>simple</local>
</names>
```

### Using with node-name()

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<ns:root xmlns:ns="http://example.com">
  <ns:child>text</ns:child>
</ns:root>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/ns:root" xmlns:ns="http://example.com">
    <result>
      <xsl:for-each select="*">
        <element local="{local-name-from-QName(node-name(.))}"/>
      </xsl:for-each>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <element local="child"/>
</result>
```

## Notes

- `local-name-from-QName()` operates on typed `xs:QName` values, not on string representations. To get the local name of a node, use `local-name()` instead.
- The result is identical to `local-name()` on a node whose expanded name matches the QName.
- When working with dynamically constructed QNames, this function is the companion to `namespace-uri-from-QName()` and `prefix-from-QName()`.

## See also

- [namespace-uri-from-QName()](../xpath-namespace-uri-from-qname)
- [prefix-from-QName()](../xpath-prefix-from-qname)
- [resolve-QName()](../xpath-resolve-qname)
- [QName()](../xpath-qname)
