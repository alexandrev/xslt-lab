---
title: "xsl:transform"
description: "Synonym for xsl:stylesheet — the root element of an XSLT stylesheet, interchangeable in every respect."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "element"
syntax: '<xsl:transform version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">'
tags: ["xslt", "reference", "xslt1"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDp0cmFuc2Zvcm0gdmVyc2lvbj0iMS4wIiB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSI-CiAgPHhzbDpvdXRwdXQgbWV0aG9kPSJ0ZXh0Ii8-CgogIDx4c2w6dGVtcGxhdGUgbWF0Y2g9Ii9ib29rIj4KICAgIDx4c2w6dmFsdWUtb2Ygc2VsZWN0PSJ0aXRsZSIvPgogICAgPHhzbDp0ZXh0PiBieSA8L3hzbDp0ZXh0PgogICAgPHhzbDp2YWx1ZS1vZiBzZWxlY3Q9ImF1dGhvciIvPgogIDwveHNsOnRlbXBsYXRlPgo8L3hzbDp0cmFuc2Zvcm0-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGJvb2s-CiAgPHRpdGxlPlhTTFQgUGF0dGVybnM8L3RpdGxlPgogIDxhdXRob3I-SmFuZSBEb2U8L2F1dGhvcj4KPC9ib29rPg&version=1.0"
---

## Description

`xsl:transform` is a direct synonym for `xsl:stylesheet`. The XSLT 1.0 specification allows either name as the document element of a stylesheet, and conforming processors must accept both. All attributes, allowed child elements, and semantics are identical.

In practice, `xsl:stylesheet` is used by the vast majority of published stylesheets because it was the name used in early drafts and became the de-facto convention. `xsl:transform` occasionally appears in generated or tool-produced stylesheets, and some authors prefer it because the word "transform" more directly describes what the document does.

There is no technical reason to choose one over the other. If a project or team has adopted a consistent convention, follow it; otherwise, `xsl:stylesheet` is the safer choice for readability and tooling compatibility.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `version` | `"1.0"` / `"2.0"` / `"3.0"` | Yes | XSLT version governing this stylesheet. |
| `id` | ID | No | Unique identifier for the element. |
| `extension-element-prefixes` | whitespace-separated prefixes | No | Prefixes treated as extension element namespaces. |
| `exclude-result-prefixes` | whitespace-separated prefixes | No | Prefixes excluded from the result tree. |

## Examples

### Using xsl:transform as root element

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<book>
  <title>XSLT Patterns</title>
  <author>Jane Doe</author>
</book>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:transform version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>

  <xsl:template match="/book">
    <xsl:value-of select="title"/>
    <xsl:text> by </xsl:text>
    <xsl:value-of select="author"/>
  </xsl:template>
</xsl:transform>
```

**Output:**
```
XSLT Patterns by Jane Doe
```

### Equivalent xsl:stylesheet version

**Stylesheet (identical result, different root name):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>

  <xsl:template match="/book">
    <xsl:value-of select="title"/>
    <xsl:text> by </xsl:text>
    <xsl:value-of select="author"/>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```
XSLT Patterns by Jane Doe
```

## Notes

- The two names are specified as synonyms in the XSLT 1.0 Recommendation, section 2.2. No processor may accept one but reject the other.
- Mixing them — e.g., opening with `<xsl:transform>` and closing with `</xsl:stylesheet>` — is a well-formedness error in XML, not an XSLT issue.
- Schema validators for XSLT documents (such as the official XSLT schema) list both names in the content model.

## See also

- [xsl:stylesheet](../xsl-stylesheet)
- [xsl:template](../xsl-template)
- [xsl:output](../xsl-output)
