---
title: "xsl:character-map"
description: "Declares a named mapping of individual characters to output strings, applied during serialization to replace characters in the result."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "element"
syntax: '<xsl:character-map name="name" use-character-maps="names">'
tags: ["xslt", "reference", "xslt2"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgoKICA8eHNsOmNoYXJhY3Rlci1tYXAgbmFtZT0iaHRtbC1lbnRpdGllcyI-CiAgICA8eHNsOm91dHB1dC1jaGFyYWN0ZXIgY2hhcmFjdGVyPSImIzE2MDsiIHN0cmluZz0iJmFtcDtuYnNwOyIvPgogICAgPHhzbDpvdXRwdXQtY2hhcmFjdGVyIGNoYXJhY3Rlcj0iJiMxNjk7IiBzdHJpbmc9IiZhbXA7Y29weTsiLz4KICAgIDx4c2w6b3V0cHV0LWNoYXJhY3RlciBjaGFyYWN0ZXI9IiYjODIxMjsiIHN0cmluZz0iJmFtcDttZGFzaDsiLz4KICAgIDx4c2w6b3V0cHV0LWNoYXJhY3RlciBjaGFyYWN0ZXI9IiYjODIyMDsiIHN0cmluZz0iJmFtcDtsZHF1bzsiLz4KICAgIDx4c2w6b3V0cHV0LWNoYXJhY3RlciBjaGFyYWN0ZXI9IiYjODIyMTsiIHN0cmluZz0iJmFtcDtyZHF1bzsiLz4KICA8L3hzbDpjaGFyYWN0ZXItbWFwPgoKICA8eHNsOm91dHB1dCBtZXRob2Q9Imh0bWwiIHVzZS1jaGFyYWN0ZXItbWFwcz0iaHRtbC1lbnRpdGllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvcGFnZSI-CiAgICA8aHRtbD4KICAgICAgPGJvZHk-CiAgICAgICAgPHA-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9InRpdGxlIi8-JiMxNjA7JiMxNjk7IDIwMjY8L3A-CiAgICAgICAgPHA-JiM4MjIwOzx4c2w6dmFsdWUtb2Ygc2VsZWN0PSJib2R5Ii8-JiM4MjIxOzwvcD4KICAgICAgPC9ib2R5PgogICAgPC9odG1sPgogIDwveHNsOnRlbXBsYXRlPgo8L3hzbDpzdHlsZXNoZWV0Pg&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHJvb3QvPg&version=2.0"
---

## Description

`xsl:character-map` is a top-level declaration that defines a set of character substitutions applied during output serialization. Each substitution is specified by a child `xsl:output-character` element. When the serializer writes a character that appears in the map, it writes the mapped string instead — bypassing normal XML escaping rules.

This is essential for generating output that requires non-XML escape sequences, such as HTML entities (`&nbsp;`, `&copy;`), or for controlling how special characters appear in text or HTML output.

The map is activated by naming it in the `use-character-maps` attribute of `xsl:output` or `xsl:result-document`.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | QName | Yes | The name of the character map, referenced from `xsl:output`. |
| `use-character-maps` | QNames (space-separated) | No | Names of other character maps to include (compose maps). |

Child elements:

| Child | Description |
|-------|-------------|
| `xsl:output-character` | One or more character-to-string mappings. |

## Return value

No direct output. The map is applied by the serializer when activated via `use-character-maps`.

## Examples

### Outputting named HTML entities

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:character-map name="html-entities">
    <xsl:output-character character="&#160;" string="&amp;nbsp;"/>
    <xsl:output-character character="&#169;" string="&amp;copy;"/>
    <xsl:output-character character="&#8212;" string="&amp;mdash;"/>
    <xsl:output-character character="&#8220;" string="&amp;ldquo;"/>
    <xsl:output-character character="&#8221;" string="&amp;rdquo;"/>
  </xsl:character-map>

  <xsl:output method="html" use-character-maps="html-entities"/>

  <xsl:template match="/page">
    <html>
      <body>
        <p><xsl:value-of select="title"/>&#160;&#169; 2026</p>
        <p>&#8220;<xsl:value-of select="body"/>&#8221;</p>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
```

**Output (raw HTML):**
```html
<html>
  <body>
    <p>My Page&nbsp;&copy; 2026</p>
    <p>&ldquo;Some content here&rdquo;</p>
  </body>
</html>
```

### Composing character maps

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:character-map name="math-symbols">
    <xsl:output-character character="&#8804;" string="&amp;le;"/>
    <xsl:output-character character="&#8805;" string="&amp;ge;"/>
  </xsl:character-map>

  <!-- Composed map: includes html-entities plus math-symbols -->
  <xsl:character-map name="full" use-character-maps="html-entities math-symbols">
    <xsl:output-character character="&#215;" string="&amp;times;"/>
  </xsl:character-map>

  <xsl:output method="html" use-character-maps="full"/>

  <xsl:template match="/">
    <p>2 &#215; 3 &#8804; 10</p>
  </xsl:template>
</xsl:stylesheet>
```

**Output:** `<p>2&times;3&le;10</p>`

## Notes

- Character maps are applied **after** serialization escaping. The mapped string is written literally — the serializer does not re-escape it.
- Each character may appear in at most one active character map. If a character appears in multiple composed maps, behavior is processor-defined.
- Character maps do not affect text inside CDATA sections.
- They are a serialization feature — they have no effect on the XDM result tree inside the stylesheet; only on the final text output.

## See also

- [xsl:output-character](../xsl-output-character)
- [xsl:output](../xsl-output)
- [xsl:result-document](../xsl-result-document)
