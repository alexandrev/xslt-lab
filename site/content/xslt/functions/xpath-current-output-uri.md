---
title: "current-output-uri()"
description: "Returns the URI of the current result document being written inside an xsl:result-document instruction."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "node function"
syntax: "current-output-uri()"
tags: ["xslt", "reference", "xpath", "xslt2"]
---

## Description

`current-output-uri()` returns the URI of the result document currently being written — the `href` value of the enclosing `<xsl:result-document>` instruction. Outside an `xsl:result-document`, it returns the empty sequence.

This is useful for embedding a document's own URI as metadata within itself, logging which file is being generated, or constructing relative cross-references between generated documents.

## Parameters

This function takes no parameters.

## Return value

`xs:anyURI?` — the URI of the current result document, or the empty sequence when called outside `xsl:result-document`.

## Examples

### Embed the output URI in each generated document

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<chapters>
  <chapter id="ch1" title="Introduction"/>
  <chapter id="ch2" title="Getting Started"/>
</chapters>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/chapters">
    <xsl:for-each select="chapter">
      <xsl:result-document href="{@id}.xml">
        <chapter id="{@id}"
                 self-uri="{current-output-uri()}">
          <title><xsl:value-of select="@title"/></title>
        </chapter>
      </xsl:result-document>
    </xsl:for-each>
  </xsl:template>
</xsl:stylesheet>
```

**Output (ch1.xml):**
```xml
<chapter id="ch1" self-uri="ch1.xml">
  <title>Introduction</title>
</chapter>
```

### Log generated file names to the principal output

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/chapters">
    <manifest>
      <xsl:for-each select="chapter">
        <xsl:result-document href="{@id}.xml">
          <chapter/>
        </xsl:result-document>
        <file><xsl:value-of select="concat(@id, '.xml')"/></file>
      </xsl:for-each>
    </manifest>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- Returns the empty sequence when called in the principal result tree (outside any `xsl:result-document`).
- The returned URI is the value of the `href` attribute of the enclosing `xsl:result-document`, resolved against the static base URI if it is relative.
- Useful for generating self-referential metadata in split-document outputs.

## See also

- [static-base-uri()](../xpath-static-base-uri)
- [document-uri()](../xpath-document-uri)
