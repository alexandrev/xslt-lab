---
title: "unparsed-text-available()"
description: "Returns true if unparsed-text() would succeed for the given URI and encoding, allowing safe guarded file reads."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "node function"
syntax: "unparsed-text-available(uri, encoding?)"
tags: ["xslt", "reference", "xpath", "xslt2"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSI-CiAgPHhzbDpvdXRwdXQgbWV0aG9kPSJ4bWwiIGluZGVudD0ieWVzIi8-CgogIDx4c2w6dGVtcGxhdGUgbWF0Y2g9Ii8iPgogICAgPHJlc3VsdD4KICAgICAgPHhzbDpjaG9vc2U-CiAgICAgICAgPHhzbDp3aGVuIHRlc3Q9InVucGFyc2VkLXRleHQtYXZhaWxhYmxlKCdub3Rlcy50eHQnKSI-CiAgICAgICAgICA8bm90ZXM-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9InVucGFyc2VkLXRleHQoJ25vdGVzLnR4dCcpIi8-PC9ub3Rlcz4KICAgICAgICA8L3hzbDp3aGVuPgogICAgICAgIDx4c2w6b3RoZXJ3aXNlPgogICAgICAgICAgPG5vdGVzLz4KICAgICAgICA8L3hzbDpvdGhlcndpc2U-CiAgICAgIDwveHNsOmNob29zZT4KICAgIDwvcmVzdWx0PgogIDwveHNsOnRlbXBsYXRlPgo8L3hzbDpzdHlsZXNoZWV0Pg&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHJvb3QvPg&version=2.0"
---

## Description

`unparsed-text-available()` checks whether a call to `unparsed-text()` with the same arguments would succeed. It returns `true` if the resource exists and can be read with the specified encoding, and `false` otherwise — without raising an error.

Use it as a guard before calling `unparsed-text()` or `unparsed-text-lines()` when the resource may not always be present.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uri` | xs:string? | Yes | The URI of the text resource to test. |
| `encoding` | xs:string | No | Character encoding to test (e.g., `"UTF-8"`). |

## Return value

`xs:boolean` — `true` if the resource is available, `false` if it is not (or if the argument is the empty sequence).

## Examples

### Conditionally include a text file

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <result>
      <xsl:choose>
        <xsl:when test="unparsed-text-available('notes.txt')">
          <notes><xsl:value-of select="unparsed-text('notes.txt')"/></notes>
        </xsl:when>
        <xsl:otherwise>
          <notes/>
        </xsl:otherwise>
      </xsl:choose>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

### Load optional configuration files

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>
  <xsl:param name="config-uri" select="'config.txt'"/>

  <xsl:template match="/">
    <xsl:variable name="config"
      select="if (unparsed-text-available($config-uri))
              then unparsed-text($config-uri)
              else ''"/>
    <document config-loaded="{$config != ''}">
      <xsl:apply-templates/>
    </document>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- The function should be called with the same arguments you intend to pass to `unparsed-text()` to guarantee the guard matches.
- Even if `unparsed-text-available()` returns `true`, the subsequent `unparsed-text()` call might still fail in rare race conditions (e.g., the file was deleted in between). This is unlikely in batch transformations.
- Available in Saxon 9.x+ with XSLT 2.0 stylesheets; formally part of XPath 3.0.

## See also

- [unparsed-text()](../xpath-unparsed-text)
- [unparsed-text-lines()](../xpath-unparsed-text-lines)
