---
title: "xsl:namespace-alias"
description: "Maps a namespace prefix used in the stylesheet to a different prefix in the result tree, enabling stylesheets that generate XSLT."
date: 2026-04-19T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "element"
syntax: "<xsl:namespace-alias stylesheet-prefix=\"xsl\" result-prefix=\"out\"/>"
tags: ["xslt", "reference", "xpath", "xslt1"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjEuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczpvdXQ9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSI-CgogIDx4c2w6bmFtZXNwYWNlLWFsaWFzIHN0eWxlc2hlZXQtcHJlZml4PSJvdXQiIHJlc3VsdC1wcmVmaXg9InhzbCIvPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvZmllbGRzIj4KICAgIDxvdXQ6c3R5bGVzaGVldCB2ZXJzaW9uPSIxLjAiPgogICAgICA8b3V0OnRlbXBsYXRlIG1hdGNoPSIvIj4KICAgICAgICA8cm9vdD4KICAgICAgICAgIDx4c2w6Zm9yLWVhY2ggc2VsZWN0PSJmaWVsZCI-CiAgICAgICAgICAgIDxvdXQ6dmFsdWUtb2Ygc2VsZWN0PSJ7QG5hbWV9Ii8-CiAgICAgICAgICA8L3hzbDpmb3ItZWFjaD4KICAgICAgICA8L3Jvb3Q-CiAgICAgIDwvb3V0OnRlbXBsYXRlPgogICAgPC9vdXQ6c3R5bGVzaGVldD4KICA8L3hzbDp0ZW1wbGF0ZT4KPC94c2w6c3R5bGVzaGVldD4&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGZpZWxkcz4KICA8ZmllbGQgbmFtZT0idGl0bGUiLz4KICA8ZmllbGQgbmFtZT0iYXV0aG9yIi8-CjwvZmllbGRzPg&version=1.0"
---

## Description

`xsl:namespace-alias` solves the problem of writing an XSLT stylesheet whose output is itself an XSLT stylesheet. Normally, elements in the XSLT namespace are interpreted as instructions by the processor. By declaring an alias, you can use a substitute prefix in the stylesheet source while the processor emits the real XSLT namespace URI in the result.

The `stylesheet-prefix` is the stand-in prefix used inside the stylesheet. Any literal result element in that namespace is treated as a literal result element (not an XSLT instruction), and when serialized its namespace URI is replaced by the URI bound to `result-prefix`. Both prefixes must be declared in scope at the point the `xsl:namespace-alias` declaration appears.

This element must appear as a top-level child of `xsl:stylesheet`.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `stylesheet-prefix` | NCName or `#default` | Yes | The prefix used in the stylesheet source as a stand-in. Use `#default` for the default namespace. |
| `result-prefix` | NCName or `#default` | Yes | The prefix whose namespace URI should appear in the output. Use `#default` for the default namespace. |

## Return value

`xsl:namespace-alias` is a declaration; it produces no output.

## Examples

### Generating an XSLT stylesheet

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<fields>
  <field name="title"/>
  <field name="author"/>
</fields>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:out="http://www.w3.org/1999/XSL/Transform">

  <xsl:namespace-alias stylesheet-prefix="out" result-prefix="xsl"/>
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/fields">
    <out:stylesheet version="1.0">
      <out:template match="/">
        <root>
          <xsl:for-each select="field">
            <out:value-of select="{@name}"/>
          </xsl:for-each>
        </root>
      </out:template>
    </out:stylesheet>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:template match="/">
    <root>
      <xsl:value-of select="title"/>
      <xsl:value-of select="author"/>
    </root>
  </xsl:template>
</xsl:stylesheet>
```

### Aliasing to the default namespace

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:alias="http://www.w3.org/1999/XSL/Transform">

  <xsl:namespace-alias stylesheet-prefix="alias" result-prefix="#default"/>
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <alias:stylesheet version="1.0">
      <alias:template match="/">
        <output/>
      </alias:template>
    </alias:stylesheet>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<stylesheet version="1.0"
  xmlns="http://www.w3.org/1999/XSL/Transform">
  <template match="/">
    <output/>
  </template>
</stylesheet>
```

## Notes

- `xsl:namespace-alias` is primarily used when a stylesheet generates another stylesheet as its output.
- The aliased prefix namespace URI must not equal the stylesheet namespace URI `http://www.w3.org/1999/XSL/Transform` or the processor will reject the stylesheet.
- In XSLT 2.0 and later, the same technique works identically; there is no new syntax for this feature in later versions.
- Only namespace URIs are aliased, not prefix strings. The prefix appearing in the output depends on how the processor serializes namespace bindings.

## See also

- [xsl:output](../xsl-output)
- [xsl:import](../xsl-import)
