---
title: "uri-collection()"
description: "Returns a sequence of xs:anyURI values from a named collection, giving the URIs of the contained documents."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "node function"
syntax: "uri-collection(uri?)"
tags: ["xslt", "reference", "xpath", "xslt2"]
---

## Description

`uri-collection()` returns a sequence of `xs:anyURI` values — the URIs of documents in a collection — rather than the documents themselves. It is the URI counterpart of `collection()`: instead of loading each document, it gives you the URIs so you can decide how and when to load them.

This is useful when you want to inspect, filter, or log available URIs before loading, or when you want to load documents selectively.

Formally part of XPath 3.0; supported by Saxon 9.x+ with XSLT 2.0 stylesheets.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uri` | xs:string? | No | URI identifying the collection. Omit for the default collection. |

## Return value

`xs:anyURI*` — a sequence of URIs of the documents in the collection.

## Examples

### List available XML files in a directory

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <file-list>
      <xsl:for-each select="uri-collection('file:///data/books/?select=*.xml')">
        <file><xsl:value-of select="."/></file>
      </xsl:for-each>
    </file-list>
  </xsl:template>
</xsl:stylesheet>
```

**Output (example):**
```xml
<file-list>
  <file>file:///data/books/book1.xml</file>
  <file>file:///data/books/book2.xml</file>
</file-list>
```

### Selectively load large files based on URI pattern

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <result>
      <!-- Only load files whose name starts with 'report-' -->
      <xsl:for-each select="uri-collection('file:///data/?select=*.xml')
                            [matches(., 'report-')]">
        <xsl:variable name="doc" select="doc(.)"/>
        <entry uri="{.}">
          <title><xsl:value-of select="$doc/*/title"/></title>
        </entry>
      </xsl:for-each>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- The URI syntax follows the same Saxon-specific conventions as `collection()`: `file:///path/?select=*.xml`.
- `uri-collection()` does not load the documents; use `doc()` or `document()` to load them individually.
- Formally part of XPath 3.0; available in Saxon 9.x+ with XSLT 2.0 stylesheets.

## See also

- [collection()](../xpath-collection)
- [document-uri()](../xpath-document-uri)
