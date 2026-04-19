---
title: "current-output-uri()"
description: "Returns the URI of the current result document being written inside an xsl:result-document instruction."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "node function"
syntax: "current-output-uri()"
tags: ["xslt", "reference", "xpath", "xslt2"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSI-CiAgPHhzbDpvdXRwdXQgbWV0aG9kPSJ4bWwiIGluZGVudD0ieWVzIi8-CgogIDx4c2w6dGVtcGxhdGUgbWF0Y2g9Ii9jaGFwdGVycyI-CiAgICA8eHNsOmZvci1lYWNoIHNlbGVjdD0iY2hhcHRlciI-CiAgICAgIDx4c2w6cmVzdWx0LWRvY3VtZW50IGhyZWY9IntAaWR9LnhtbCI-CiAgICAgICAgPGNoYXB0ZXIgaWQ9IntAaWR9IgogICAgICAgICAgICAgICAgIHNlbGYtdXJpPSJ7Y3VycmVudC1vdXRwdXQtdXJpKCl9Ij4KICAgICAgICAgIDx0aXRsZT48eHNsOnZhbHVlLW9mIHNlbGVjdD0iQHRpdGxlIi8-PC90aXRsZT4KICAgICAgICA8L2NoYXB0ZXI-CiAgICAgIDwveHNsOnJlc3VsdC1kb2N1bWVudD4KICAgIDwveHNsOmZvci1lYWNoPgogIDwveHNsOnRlbXBsYXRlPgo8L3hzbDpzdHlsZXNoZWV0Pg&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGNoYXB0ZXJzPgogIDxjaGFwdGVyIGlkPSJjaDEiIHRpdGxlPSJJbnRyb2R1Y3Rpb24iLz4KICA8Y2hhcHRlciBpZD0iY2gyIiB0aXRsZT0iR2V0dGluZyBTdGFydGVkIi8-CjwvY2hhcHRlcnM-&version=2.0"
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
