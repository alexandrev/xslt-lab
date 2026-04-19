---
title: "xsl:result-document"
description: "Writes transformation output to a secondary result document at a specified URI, enabling a single stylesheet to produce multiple output files."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "element"
syntax: '<xsl:result-document href="uri" method="xml" indent="yes">'
tags: ["xslt", "reference", "xslt2"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0iaHRtbCIgaW5kZW50PSJ5ZXMiLz4KCiAgPHhzbDp0ZW1wbGF0ZSBtYXRjaD0iL2Jvb2siPgogICAgPCEtLSBQcmltYXJ5IG91dHB1dDogaW5kZXggcGFnZSAtLT4KICAgIDxodG1sPgogICAgICA8Ym9keT4KICAgICAgICA8aDE-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9IkB0aXRsZSIvPjwvaDE-CiAgICAgICAgPHVsPgogICAgICAgICAgPHhzbDpmb3ItZWFjaCBzZWxlY3Q9ImNoYXB0ZXIiPgogICAgICAgICAgICA8bGk-PGEgaHJlZj0ie0BpZH0uaHRtbCI-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9IkB0aXRsZSIvPjwvYT48L2xpPgogICAgICAgICAgPC94c2w6Zm9yLWVhY2g-CiAgICAgICAgPC91bD4KICAgICAgPC9ib2R5PgogICAgPC9odG1sPgogICAgPCEtLSBTZWNvbmRhcnkgb3V0cHV0czogb25lIGZpbGUgcGVyIGNoYXB0ZXIgLS0-CiAgICA8eHNsOmZvci1lYWNoIHNlbGVjdD0iY2hhcHRlciI-CiAgICAgIDx4c2w6cmVzdWx0LWRvY3VtZW50IGhyZWY9IntAaWR9Lmh0bWwiIG1ldGhvZD0iaHRtbCIgaW5kZW50PSJ5ZXMiPgogICAgICAgIDxodG1sPgogICAgICAgICAgPGJvZHk-CiAgICAgICAgICAgIDxoMT48eHNsOnZhbHVlLW9mIHNlbGVjdD0iQHRpdGxlIi8-PC9oMT4KICAgICAgICAgICAgPHA-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9Ii4iLz48L3A-CiAgICAgICAgICAgIDxhIGhyZWY9ImluZGV4Lmh0bWwiPkJhY2s8L2E-CiAgICAgICAgICA8L2JvZHk-CiAgICAgICAgPC9odG1sPgogICAgICA8L3hzbDpyZXN1bHQtZG9jdW1lbnQ-CiAgICA8L3hzbDpmb3ItZWFjaD4KICA8L3hzbDp0ZW1wbGF0ZT4KPC94c2w6c3R5bGVzaGVldD4&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGJvb2sgdGl0bGU9Ik15IEJvb2siPgogIDxjaGFwdGVyIGlkPSJjaDEiIHRpdGxlPSJJbnRyb2R1Y3Rpb24iPkNvbnRlbnQgb2YgY2hhcHRlciAxLjwvY2hhcHRlcj4KICA8Y2hhcHRlciBpZD0iY2gyIiB0aXRsZT0iQmFja2dyb3VuZCI-Q29udGVudCBvZiBjaGFwdGVyIDIuPC9jaGFwdGVyPgogIDxjaGFwdGVyIGlkPSJjaDMiIHRpdGxlPSJDb25jbHVzaW9uIj5Db250ZW50IG9mIGNoYXB0ZXIgMy48L2NoYXB0ZXI-CjwvYm9vaz4&version=2.0"
---

## Description

`xsl:result-document` creates a secondary result tree and writes it to a URI. The primary output of the transformation is produced normally; `xsl:result-document` adds one or more additional outputs. This is the XSLT 2.0 mechanism for splitting a single input document into multiple output files — for example, generating one HTML page per chapter of a book.

The `href` attribute names the destination URI. Relative URIs are resolved against the base output URI supplied by the calling application. If `href` is omitted, the instruction writes to the principal result tree (useful to override serialization settings for a section of output).

All serialization attributes available on `xsl:output` may also appear directly on `xsl:result-document` and override the named output format for that specific document.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `href` | URI (AVT) | No | Destination URI for the secondary document. |
| `format` | QName | No | Named output format (refers to an `xsl:output` name attribute). |
| `method` | `xml` \| `html` \| `text` \| `xhtml` | No | Serialization method. |
| `indent` | `yes` \| `no` | No | Whether to add indentation. |
| `encoding` | string | No | Character encoding, e.g. `UTF-8`. |
| `doctype-public` | string | No | DOCTYPE public identifier. |
| `doctype-system` | string | No | DOCTYPE system identifier. |
| `omit-xml-declaration` | `yes` \| `no` | No | Suppress the XML declaration. |
| `use-character-maps` | QNames | No | Apply named character maps on output. |

## Return value

Nothing is added to the current result tree. The content produced inside the element body is written to the secondary document.

## Examples

### Splitting chapters into separate files

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<book title="My Book">
  <chapter id="ch1" title="Introduction">Content of chapter 1.</chapter>
  <chapter id="ch2" title="Background">Content of chapter 2.</chapter>
  <chapter id="ch3" title="Conclusion">Content of chapter 3.</chapter>
</book>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" indent="yes"/>

  <xsl:template match="/book">
    <!-- Primary output: index page -->
    <html>
      <body>
        <h1><xsl:value-of select="@title"/></h1>
        <ul>
          <xsl:for-each select="chapter">
            <li><a href="{@id}.html"><xsl:value-of select="@title"/></a></li>
          </xsl:for-each>
        </ul>
      </body>
    </html>
    <!-- Secondary outputs: one file per chapter -->
    <xsl:for-each select="chapter">
      <xsl:result-document href="{@id}.html" method="html" indent="yes">
        <html>
          <body>
            <h1><xsl:value-of select="@title"/></h1>
            <p><xsl:value-of select="."/></p>
            <a href="index.html">Back</a>
          </body>
        </html>
      </xsl:result-document>
    </xsl:for-each>
  </xsl:template>
</xsl:stylesheet>
```

**Files produced:** `index.html`, `ch1.html`, `ch2.html`, `ch3.html`.

### Writing a plain-text log alongside XML output

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/data">
    <!-- Primary XML output -->
    <processed>
      <xsl:apply-templates select="record"/>
    </processed>
    <!-- Secondary plain-text log -->
    <xsl:result-document href="transform.log" method="text">
      <xsl:for-each select="record">
        <xsl:value-of select="concat('Processed: ', @id, '&#10;')"/>
      </xsl:for-each>
    </xsl:result-document>
  </xsl:template>

  <xsl:template match="record">
    <item id="{@id}"><xsl:value-of select="."/></item>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- Saxon supports `xsl:result-document` in both file-system and in-memory scenarios. In some processors (e.g., browser-based), writing to a file URI may not be permitted.
- `href` is an attribute value template (AVT), so dynamic URIs like `{@id}.html` are fully supported.
- Result documents must be **serialized independently**; they cannot reference nodes in other result documents.
- Nesting `xsl:result-document` inside another `xsl:result-document` is allowed and creates further secondary documents.
- In Saxon-EE, result documents can be written in parallel for performance.

## See also

- [xsl:output](../xsl-output)
- [xsl:sequence](../xsl-sequence)
- [xsl:character-map](../xsl-character-map)
