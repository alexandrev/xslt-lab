---
title: "xsl:strip-space"
description: "Removes whitespace-only text nodes from the specified source elements before the transformation begins processing them."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "element"
syntax: '<xsl:strip-space elements="names"/>'
tags: ["xslt", "reference", "xslt1"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjEuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnN0cmlwLXNwYWNlIGVsZW1lbnRzPSJyZXBvcnQgaXRlbXMiLz4KCiAgPHhzbDp0ZW1wbGF0ZSBtYXRjaD0iQCp8bm9kZSgpIj4KICAgIDx4c2w6Y29weT4KICAgICAgPHhzbDphcHBseS10ZW1wbGF0ZXMgc2VsZWN0PSJAKnxub2RlKCkiLz4KICAgIDwveHNsOmNvcHk-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPG1lbnU-CiAgPHNlY3Rpb24-CiAgICA8aXRlbT5Tb3VwPC9pdGVtPgogICAgPGl0ZW0-U2FsYWQ8L2l0ZW0-CiAgPC9zZWN0aW9uPgo8L21lbnU-&version=1.0"
---

## Description

`xsl:strip-space` instructs the XSLT processor to discard text nodes that consist entirely of whitespace characters from the specified source elements. This affects the source tree built before any templates run; stripped nodes are never seen by the transformation.

The most common form is `<xsl:strip-space elements="*"/>`, which removes all whitespace-only text nodes from every element in the source document. This is useful when the source XML was indented for human readability and the whitespace carries no meaning — the strip rule prevents these invisible text nodes from appearing in `position()` counts, triggering built-in text templates, or otherwise interfering with the transformation.

The `elements` attribute accepts a whitespace-separated list of element name tests or the wildcard `*`. `xsl:preserve-space` can override `xsl:strip-space` for specific elements where whitespace is significant.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `elements` | whitespace-separated NameTests | Yes | Elements from which whitespace-only text nodes are removed. Use `*` for all. |

## Examples

### Stripping indentation whitespace

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<menu>
  <section>
    <item>Soup</item>
    <item>Salad</item>
  </section>
</menu>
```

**Stylesheet without strip-space** (produces extra whitespace text nodes):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>

  <xsl:template match="/menu">
    <xsl:for-each select="section/item">
      <xsl:value-of select="position()"/>
      <xsl:text>: </xsl:text>
      <xsl:value-of select="."/>
      <xsl:text>&#10;</xsl:text>
    </xsl:for-each>
  </xsl:template>
</xsl:stylesheet>
```

**Stylesheet with strip-space** (clean numbering):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>
  <xsl:strip-space elements="*"/>

  <xsl:template match="/menu">
    <xsl:for-each select="section/item">
      <xsl:value-of select="position()"/>
      <xsl:text>: </xsl:text>
      <xsl:value-of select="."/>
      <xsl:text>&#10;</xsl:text>
    </xsl:for-each>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```
1: Soup
2: Salad
```

### Selective stripping

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<report>
  <summary>  Total: 5  </summary>
  <items>
    <item>A</item>
    <item>B</item>
  </items>
</report>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:strip-space elements="report items"/>

  <xsl:template match="@*|node()">
    <xsl:copy>
      <xsl:apply-templates select="@*|node()"/>
    </xsl:copy>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<report>
  <summary>  Total: 5  </summary>
  <items>
    <item>A</item>
    <item>B</item>
  </items>
</report>
```

## Notes

- Stripping only removes text nodes that are **entirely** whitespace. Mixed-content text nodes containing non-whitespace characters are never affected.
- The `xml:space="preserve"` attribute in the source document prevents stripping for that element and all its descendants, even if `xsl:strip-space` targets them.
- Whitespace stripping is applied after the XML parser builds the source tree, before any template processing starts. It cannot be applied conditionally during transformation.
- When `xsl:strip-space elements="*"` and `xsl:preserve-space elements="pre"` are both present, `xsl:preserve-space` wins for `pre` elements because it is more specific.

## See also

- [xsl:preserve-space](../xsl-preserve-space)
- [xsl:output](../xsl-output)
