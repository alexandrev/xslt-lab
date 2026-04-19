---
title: "unparsed-text-lines()"
description: "Reads a text file from a URI and returns its lines as a sequence of strings, one item per line."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "node function"
syntax: "unparsed-text-lines(uri, encoding?)"
tags: ["xslt", "reference", "xpath", "xslt2"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSI-CiAgPHhzbDpvdXRwdXQgbWV0aG9kPSJ0ZXh0Ii8-CgogIDx4c2w6dGVtcGxhdGUgbWF0Y2g9Ii8iPgogICAgPHhzbDp2YWx1ZS1vZiBzZWxlY3Q9ImNvdW50KHVucGFyc2VkLXRleHQtbGluZXMoJ3JlYWRtZS50eHQnKVtub3JtYWxpemUtc3BhY2UoKV0pIi8-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHJvb3QvPg&version=2.0"
---

## Description

`unparsed-text-lines()` retrieves a text resource and returns each line as a separate `xs:string` item in a sequence. Line endings (`\r\n`, `\n`, `\r`) are removed from each item. An empty trailing line produced by a final newline is not included.

This is more convenient than `unparsed-text()` followed by `tokenize()` when you want to iterate over lines directly.

This function is part of XPath 3.0 but is supported by Saxon 9.x+ with XSLT 2.0 stylesheets.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uri` | xs:string? | Yes | The URI of the text resource. |
| `encoding` | xs:string | No | Character encoding (e.g., `"UTF-8"`). |

## Return value

`xs:string*` — a sequence of strings, one per line, or the empty sequence if the URI argument is the empty sequence.

## Examples

### Parse a CSV file line by line

**Stylesheet (reads data.csv):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <table>
      <xsl:for-each select="unparsed-text-lines('data.csv')[position() gt 1]">
        <xsl:variable name="fields" select="tokenize(., ',')"/>
        <row>
          <id><xsl:value-of select="$fields[1]"/></id>
          <name><xsl:value-of select="$fields[2]"/></name>
          <value><xsl:value-of select="$fields[3]"/></value>
        </row>
      </xsl:for-each>
    </table>
  </xsl:template>
</xsl:stylesheet>
```

**Output (for data.csv with header + 2 rows):**
```xml
<table>
  <row><id>1</id><name>alpha</name><value>100</value></row>
  <row><id>2</id><name>beta</name><value>200</value></row>
</table>
```

### Count non-empty lines in a file

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>

  <xsl:template match="/">
    <xsl:value-of select="count(unparsed-text-lines('readme.txt')[normalize-space()])"/>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- Line endings are stripped from each returned string.
- Unlike `tokenize(unparsed-text(...), '\n')`, a trailing newline does not produce a spurious empty item.
- Use `unparsed-text-available()` first if the file may not exist.
- Formally part of XPath 3.0; available in Saxon 9.x+ with XSLT 2.0 stylesheets.

## See also

- [unparsed-text()](../xpath-unparsed-text)
- [unparsed-text-available()](../xpath-unparsed-text-available)
