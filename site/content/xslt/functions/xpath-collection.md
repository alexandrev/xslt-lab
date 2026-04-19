---
title: "collection()"
description: "Returns a sequence of nodes from a named collection, enabling batch processing of multiple XML documents."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "node function"
syntax: "collection(uri?)"
tags: ["xslt", "reference", "xpath", "xslt2"]
---

## Description

`collection()` returns a sequence of nodes from a **collection** identified by a URI. A collection is a processor-defined set of nodes — typically a set of XML documents. The most common use in Saxon is to pass a directory URI, which the processor expands to all XML files in that directory.

When called without an argument (or with the empty sequence), the **default collection** is returned. The default collection may be set programmatically via the processor's API.

The exact semantics of the URI are implementation-defined.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uri` | xs:string? | No | URI identifying the collection. Omit or pass the empty sequence for the default collection. |

## Return value

`node()*` — a sequence of nodes from the collection, typically document nodes.

## Examples

### Process all XML files in a directory (Saxon)

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <catalog>
      <xsl:for-each select="collection('file:///data/books/?select=*.xml')">
        <book uri="{document-uri(.)}">
          <title><xsl:value-of select="*/title"/></title>
        </book>
      </xsl:for-each>
    </catalog>
  </xsl:template>
</xsl:stylesheet>
```

**Output (example with two files):**
```xml
<catalog>
  <book uri="file:///data/books/book1.xml">
    <title>Learning XSLT</title>
  </book>
  <book uri="file:///data/books/book2.xml">
    <title>XPath in Practice</title>
  </book>
</catalog>
```

### Merge elements from all collected documents

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <merged>
      <xsl:for-each select="collection('file:///data/reports/?select=*.xml')/report/entry">
        <xsl:copy-of select="."/>
      </xsl:for-each>
    </merged>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- The URI syntax for directory collections is Saxon-specific: `file:///path/?select=*.xml` selects XML files; `recurse=yes` enables recursive directory traversal.
- Saxon also supports catalog-style collection documents (an XML file listing URIs).
- The order of nodes in the returned sequence is implementation-defined.
- For a sequence of URIs rather than document nodes, use `uri-collection()`.

## See also

- [uri-collection()](../xpath-uri-collection)
- [document-uri()](../xpath-document-uri)
