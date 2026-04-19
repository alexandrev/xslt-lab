---
title: "xsl:result-document"
description: "Writes transformation output to a secondary result document at a specified URI, enabling a single stylesheet to produce multiple output files."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "element"
syntax: '<xsl:result-document href="uri" method="xml" indent="yes">'
tags: ["xslt", "reference", "xslt2"]
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
