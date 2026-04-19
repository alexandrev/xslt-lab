---
title: "document-uri()"
description: "Returns the URI of the document node that contains the given node, as an xs:anyURI."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "node function"
syntax: "document-uri(node?)"
tags: ["xslt", "reference", "xpath", "xslt2"]
---

## Description

`document-uri()` returns the URI used to load the document containing the given node. Unlike `base-uri()`, it returns the URI of the **document node** itself and is not affected by `xml:base` attributes on descendant elements.

When called without an argument, the context node is used. If the argument is the empty sequence or the node has no document URI (e.g., it was constructed in memory), the empty sequence is returned.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `node` | node()? | No | The node whose document URI is requested. Defaults to the context node. |

## Return value

`xs:anyURI?` — the URI of the document node, or the empty sequence if no URI is available.

## Examples

### Report the document URI of a loaded document

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <info>
      <source-uri><xsl:value-of select="document-uri(.)"/></source-uri>
    </info>
  </xsl:template>
</xsl:stylesheet>
```

**Output (example):**
```xml
<info>
  <source-uri>file:///data/input.xml</source-uri>
</info>
```

### Load and track multiple documents

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/catalog">
    <sources>
      <xsl:for-each select="item/@href">
        <xsl:variable name="doc" select="document(.)"/>
        <source uri="{document-uri($doc)}">
          <xsl:value-of select="$doc/*/title"/>
        </source>
      </xsl:for-each>
    </sources>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- `document-uri()` returns the URI of the **document root**, not an element's base URI. For the effective base URI (considering `xml:base`), use `base-uri()`.
- For nodes created via `parse-xml()` or result tree fragments, the document URI is typically absent (empty sequence).
- The function was introduced in XPath 2.0 and is not available in XSLT 1.0.

## See also

- [base-uri()](../xpath-base-uri)
- [static-base-uri()](../xpath-static-base-uri)
- [parse-xml()](../xpath-parse-xml)
