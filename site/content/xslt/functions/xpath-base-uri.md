---
title: "base-uri()"
description: "Returns the base URI of a node as an xs:anyURI, combining the document's URI with any xml:base attributes in scope."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "node function"
syntax: "base-uri(node?)"
tags: ["xslt", "reference", "xpath", "xslt2"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSI-CiAgPHhzbDpvdXRwdXQgbWV0aG9kPSJ4bWwiIGluZGVudD0ieWVzIi8-CgogIDx4c2w6dGVtcGxhdGUgbWF0Y2g9Ii9yb290Ij4KICAgIDxiYXNlLXVyaXM-CiAgICAgIDxyb290LWJhc2U-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9ImJhc2UtdXJpKC4pIi8-PC9yb290LWJhc2U-CiAgICAgIDxjaGFwdGVyLWJhc2U-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9ImJhc2UtdXJpKGNoYXB0ZXIpIi8-PC9jaGFwdGVyLWJhc2U-CiAgICAgIDxzZWN0aW9uLWJhc2U-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9ImJhc2UtdXJpKGNoYXB0ZXIvc2VjdGlvbikiLz48L3NlY3Rpb24tYmFzZT4KICAgIDwvYmFzZS11cmlzPgogIDwveHNsOnRlbXBsYXRlPgo8L3hzbDpzdHlsZXNoZWV0Pg&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHJvb3QgeG1sOmJhc2U9Imh0dHA6Ly9leGFtcGxlLmNvbS9kb2NzLyI-CiAgPGNoYXB0ZXIgeG1sOmJhc2U9ImNoYXB0ZXIxLyI-CiAgICA8c2VjdGlvbj5JbnRyb2R1Y3Rpb248L3NlY3Rpb24-CiAgPC9jaGFwdGVyPgo8L3Jvb3Q-&version=2.0"
---

## Description

`base-uri()` returns the base URI of a node. The base URI is determined by combining the document URI (from where the document was loaded) with any `xml:base` attributes present on ancestor elements. It follows the XML Base specification (RFC 3986 resolution).

When called without an argument, the context node is used. If the argument is the empty sequence, the empty sequence is returned. If no base URI can be determined, the empty sequence is returned.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `node` | node()? | No | The node whose base URI is requested. Defaults to the context node. |

## Return value

`xs:anyURI?` — the base URI of the node, or the empty sequence if no base URI is available.

## Examples

### Report base URIs of elements with xml:base

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<root xml:base="http://example.com/docs/">
  <chapter xml:base="chapter1/">
    <section>Introduction</section>
  </chapter>
</root>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/root">
    <base-uris>
      <root-base><xsl:value-of select="base-uri(.)"/></root-base>
      <chapter-base><xsl:value-of select="base-uri(chapter)"/></chapter-base>
      <section-base><xsl:value-of select="base-uri(chapter/section)"/></section-base>
    </base-uris>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<base-uris>
  <root-base>http://example.com/docs/</root-base>
  <chapter-base>http://example.com/docs/chapter1/</chapter-base>
  <section-base>http://example.com/docs/chapter1/</section-base>
</base-uris>
```

### Use base-uri to resolve relative links

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/doc">
    <links>
      <xsl:for-each select="link">
        <resolved>
          <xsl:value-of select="resolve-uri(@href, base-uri(.))"/>
        </resolved>
      </xsl:for-each>
    </links>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- If the document was parsed from a string (without a known URI), `base-uri()` may return the empty sequence.
- `base-uri()` is affected by `xml:base` attributes anywhere in the ancestor chain. The effective base URI is the result of resolving each `xml:base` relative to the one above.
- To get the base URI of the stylesheet module itself, use `static-base-uri()`.
- To get the URI of the root document node (ignoring `xml:base`), use `document-uri()`.

## See also

- [document-uri()](../xpath-document-uri)
- [static-base-uri()](../xpath-static-base-uri)
