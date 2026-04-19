---
title: "static-base-uri()"
description: "Returns the static base URI of the stylesheet module as an xs:anyURI, i.e., the URI of the XSLT file being executed."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "node function"
syntax: "static-base-uri()"
tags: ["xslt", "reference", "xpath", "xslt2"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSI-CiAgPHhzbDpvdXRwdXQgbWV0aG9kPSJ4bWwiIGluZGVudD0ieWVzIi8-CgogIDx4c2w6dGVtcGxhdGUgbWF0Y2g9Ii8iPgogICAgPG91dHB1dD4KICAgICAgPHhzbDphdHRyaWJ1dGUgbmFtZT0iZ2VuZXJhdGVkLWJ5Ij4KICAgICAgICA8eHNsOnZhbHVlLW9mIHNlbGVjdD0ic3RhdGljLWJhc2UtdXJpKCkiLz4KICAgICAgPC94c2w6YXR0cmlidXRlPgogICAgICA8eHNsOmFwcGx5LXRlbXBsYXRlcy8-CiAgICA8L291dHB1dD4KICA8L3hzbDp0ZW1wbGF0ZT4KPC94c2w6c3R5bGVzaGVldD4&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHJvb3QvPg&version=2.0"
---

## Description

`static-base-uri()` returns the **static base URI** of the stylesheet module — the URI of the XSLT file in which the expression appears. This is determined at compile time from the location of the stylesheet, not at runtime from the source document.

It is particularly useful for resolving relative URIs for resources (text files, secondary XML documents) that are located **relative to the stylesheet** rather than relative to the source document.

If the stylesheet has no known base URI (e.g., it was passed as a string without a URI), the empty sequence is returned.

## Parameters

This function takes no parameters.

## Return value

`xs:anyURI?` — the static base URI of the stylesheet module, or the empty sequence if no base URI is available.

## Examples

### Load a resource file relative to the stylesheet

**Stylesheet (located at `file:///xslt/report.xsl`):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <!-- Loads 'file:///xslt/header.xml' regardless of source document location -->
  <xsl:variable name="header" select="document(resolve-uri('header.xml', static-base-uri()))"/>

  <xsl:template match="/">
    <report>
      <xsl:copy-of select="$header/*"/>
      <xsl:apply-templates/>
    </report>
  </xsl:template>
</xsl:stylesheet>
```

### Log the stylesheet URI in the output

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <output>
      <xsl:attribute name="generated-by">
        <xsl:value-of select="static-base-uri()"/>
      </xsl:attribute>
      <xsl:apply-templates/>
    </output>
  </xsl:template>
</xsl:stylesheet>
```

**Output (example):**
```xml
<output generated-by="file:///xslt/report.xsl">
  ...
</output>
```

## Notes

- `static-base-uri()` differs from `base-uri()`, which returns the base URI of a **source node** (affected by `xml:base`).
- It differs from `document-uri()`, which returns the URI of a document node.
- In a stylesheet with `<xsl:include>` or `<xsl:import>`, each module has its own static base URI, so `static-base-uri()` returns the URI of the module where the expression is written — not the main stylesheet's URI.

## See also

- [base-uri()](../xpath-base-uri)
- [document-uri()](../xpath-document-uri)
