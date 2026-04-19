---
title: "unparsed-text()"
description: "Reads a plain text file from a URI and returns its contents as an xs:string, with optional encoding specification."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "node function"
syntax: "unparsed-text(uri, encoding?)"
tags: ["xslt", "reference", "xpath", "xslt2"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSI-CiAgPHhzbDpvdXRwdXQgbWV0aG9kPSJ4bWwiIGluZGVudD0ieWVzIi8-CgogIDx4c2w6dGVtcGxhdGUgbWF0Y2g9Ii8iPgogICAgPHhzbDp2YXJpYWJsZSBuYW1lPSJjc3YiIHNlbGVjdD0idW5wYXJzZWQtdGV4dCgnZGF0YS5jc3YnKSIvPgogICAgPHJvd3M-CiAgICAgIDx4c2w6Zm9yLWVhY2ggc2VsZWN0PSJ0b2tlbml6ZSgkY3N2LCAnXG4nKVtub3JtYWxpemUtc3BhY2UoKV0iPgogICAgICAgIDxyb3c-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9Ii4iLz48L3Jvdz4KICAgICAgPC94c2w6Zm9yLWVhY2g-CiAgICA8L3Jvd3M-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHJvb3QvPg&version=2.0"
---

## Description

`unparsed-text()` retrieves the contents of a text resource at the given URI and returns it as a single `xs:string`. The resource is treated as plain text — no XML parsing is performed. This is useful for reading CSV files, plain-text templates, or any non-XML data that must be processed within an XSLT transformation.

If the URI argument is the empty sequence, the empty sequence is returned. The function raises an error if the resource cannot be retrieved or decoded.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uri` | xs:string? | Yes | The URI of the text resource. Relative URIs are resolved against the static base URI. |
| `encoding` | xs:string | No | The character encoding to use (e.g., `"UTF-8"`, `"ISO-8859-1"`). If omitted, the encoding is determined from the resource's BOM or defaults to UTF-8. |

## Return value

`xs:string?` — the text content of the resource as a single string, or the empty sequence if the URI argument is the empty sequence.

## Examples

### Read a CSV file and split into rows

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="csv" select="unparsed-text('data.csv')"/>
    <rows>
      <xsl:for-each select="tokenize($csv, '\n')[normalize-space()]">
        <row><xsl:value-of select="."/></row>
      </xsl:for-each>
    </rows>
  </xsl:template>
</xsl:stylesheet>
```

**Output (for a data.csv with three lines):**
```xml
<rows>
  <row>id,name,value</row>
  <row>1,alpha,100</row>
  <row>2,beta,200</row>
</rows>
```

### Embed a text file as a CDATA section

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes" cdata-section-elements="content"/>

  <xsl:template match="/">
    <document>
      <content><xsl:value-of select="unparsed-text('readme.txt', 'UTF-8')"/></content>
    </document>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- Use `unparsed-text-available()` to guard against missing files without raising an error.
- For processing line by line without constructing the full string first, use `unparsed-text-lines()`.
- Relative URIs are resolved against the **static base URI** of the stylesheet, not the source document.
- Line endings in the returned string are normalised to `&#10;` by the processor.

## See also

- [unparsed-text-lines()](../xpath-unparsed-text-lines)
- [unparsed-text-available()](../xpath-unparsed-text-available)
