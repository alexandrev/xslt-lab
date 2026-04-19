---
title: "document()"
description: "Loads an external XML document by URI and returns its root node as a node-set, enabling multi-document transformations in XSLT 1.0."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "node function"
syntax: "document(uri, node?)"
tags: ["xslt", "reference", "xpath", "xslt1"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjEuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnZhcmlhYmxlIG5hbWU9ImNvbG9ycyIgc2VsZWN0PSJkb2N1bWVudCgnY29sb3JzLnhtbCcpL2NvbG9ycyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvaXRlbXMiPgogICAgPHJlc3VsdD4KICAgICAgPHhzbDpmb3ItZWFjaCBzZWxlY3Q9Iml0ZW0iPgogICAgICAgIDx4c2w6dmFyaWFibGUgbmFtZT0iY29kZSIgc2VsZWN0PSJAY29sb3IiLz4KICAgICAgICA8aXRlbSBjb2xvcj0ieyRjb2xvcnMvY29sb3JbQGNvZGU9JGNvZGVdfSI-CiAgICAgICAgICA8eHNsOnZhbHVlLW9mIHNlbGVjdD0iLiIvPgogICAgICAgIDwvaXRlbT4KICAgICAgPC94c2w6Zm9yLWVhY2g-CiAgICA8L3Jlc3VsdD4KICA8L3hzbDp0ZW1wbGF0ZT4KPC94c2w6c3R5bGVzaGVldD4&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGl0ZW1zPgogIDxpdGVtIGNvbG9yPSJSIj5BcHBsZTwvaXRlbT4KICA8aXRlbSBjb2xvcj0iRyI-TGVhZjwvaXRlbT4KICA8aXRlbSBjb2xvcj0iQiI-U2t5PC9pdGVtPgo8L2l0ZW1zPg&version=1.0"
---

## Description

`document()` retrieves an external XML document and returns it as a node-set containing the document root. This is the primary mechanism in XSLT 1.0 for accessing data from multiple sources within a single transformation.

The first argument can be:
- A **string** URI — the document at that URI is loaded and returned as a single-item node-set.
- A **node-set** — each node is converted to its string value (treated as a URI), the corresponding documents are loaded, and their root nodes are returned as a combined node-set.

The optional second argument is a node from which the base URI for resolving relative URIs is taken. If omitted, relative URIs are resolved against the base URI of the stylesheet.

Calling `document('')` is a special idiom: it returns the root of the **stylesheet document itself**, allowing stylesheet data to be embedded as XML and accessed from templates.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uri` | xs:string or node-set | Yes | URI of the external document, or a node-set of URI-valued nodes. |
| `node` | node-set | No | Node whose base URI is used to resolve relative URIs in the first argument. |

## Return value

`node-set` — the root nodes of the loaded document(s).

## Examples

### Load an external lookup document

**External file: `colors.xml`**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<colors>
  <color code="R">Red</color>
  <color code="G">Green</color>
  <color code="B">Blue</color>
</colors>
```

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<items>
  <item color="R">Apple</item>
  <item color="G">Leaf</item>
  <item color="B">Sky</item>
</items>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:variable name="colors" select="document('colors.xml')/colors"/>

  <xsl:template match="/items">
    <result>
      <xsl:for-each select="item">
        <xsl:variable name="code" select="@color"/>
        <item color="{$colors/color[@code=$code]}">
          <xsl:value-of select="."/>
        </item>
      </xsl:for-each>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <item color="Red">Apple</item>
  <item color="Green">Leaf</item>
  <item color="Blue">Sky</item>
</result>
```

### Embed data in the stylesheet using document('')

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <!-- Embedded lookup table -->
  <lookup xmlns="">
    <entry key="1" label="One"/>
    <entry key="2" label="Two"/>
    <entry key="3" label="Three"/>
  </lookup>

  <xsl:variable name="lookup" select="document('')/*/lookup"/>

  <xsl:template match="/data">
    <labels>
      <xsl:for-each select="item">
        <label><xsl:value-of select="$lookup/entry[@key=current()/@id]/@label"/></label>
      </xsl:for-each>
    </labels>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- The behavior when the referenced document cannot be found is processor-specific: some processors raise a fatal error, others return an empty node-set. Check processor documentation.
- `document('')` returns the stylesheet document; combine with an XPath expression to navigate to embedded data elements.
- Relative URIs are resolved against the **stylesheet** base URI by default, not the source document URI. Use the second argument to change the base.
- In XSLT 2.0+, `document()` is superseded by the `fn:doc()` and `fn:collection()` functions, which integrate with XPath 2.0's type system.

## See also

- [xsl:import](../xsl-import)
- [xsl:include](../xsl-include)
