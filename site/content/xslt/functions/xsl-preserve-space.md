---
title: "xsl:preserve-space"
description: "Explicitly preserves whitespace-only text nodes in the named source elements, counteracting xsl:strip-space rules."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "element"
syntax: '<xsl:preserve-space elements="names"/>'
tags: ["xslt", "reference", "xslt1"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjEuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9Im5vIi8-CgogIDx4c2w6c3RyaXAtc3BhY2UgZWxlbWVudHM9IioiLz4KICA8eHNsOnByZXNlcnZlLXNwYWNlIGVsZW1lbnRzPSJwcmUiLz4KCiAgPHhzbDp0ZW1wbGF0ZSBtYXRjaD0iQCp8bm9kZSgpIj4KICAgIDx4c2w6Y29weT4KICAgICAgPHhzbDphcHBseS10ZW1wbGF0ZXMgc2VsZWN0PSJAKnxub2RlKCkiLz4KICAgIDwveHNsOmNvcHk-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGRvYz4KICA8cGFyYT4gICBUaGlzIHBhcmFncmFwaCBoYXMgbGVhZGluZyBzcGFjZXMuICAgPC9wYXJhPgogIDxwcmU-CiAgICBsaW5lIG9uZQogICAgbGluZSB0d28KICA8L3ByZT4KPC9kb2M-&version=1.0"
---

## Description

`xsl:preserve-space` is a top-level declaration that instructs the XSLT processor to keep whitespace-only text nodes in the specified source elements when building the source tree. By default, without any whitespace directives, all whitespace-only text nodes in the source document are preserved.

Its primary use is as an exception to `xsl:strip-space`. When a stylesheet has a broad `xsl:strip-space elements="*"` rule that removes all whitespace-only text nodes, `xsl:preserve-space` can carve out specific elements where whitespace is significant and must not be touched.

The `elements` attribute takes a whitespace-separated list of element names or the wildcard `*`. Element names may be namespace-qualified. Import precedence applies: if `xsl:strip-space` and `xsl:preserve-space` both match the same element at the same import precedence, a conflict error is raised.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `elements` | whitespace-separated NameTests | Yes | Elements in which whitespace-only text nodes should be preserved. Use `*` for all elements. |

## Examples

### Preserving whitespace in code blocks

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<doc>
  <para>   This paragraph has leading spaces.   </para>
  <pre>
    line one
    line two
  </pre>
</doc>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="no"/>

  <xsl:strip-space elements="*"/>
  <xsl:preserve-space elements="pre"/>

  <xsl:template match="@*|node()">
    <xsl:copy>
      <xsl:apply-templates select="@*|node()"/>
    </xsl:copy>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<doc><para>This paragraph has leading spaces.</para><pre>
    line one
    line two
  </pre></doc>
```

### Selective preservation in a mixed document

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<root>
  <text>   spaced   </text>
  <code>   preserved   </code>
</root>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:strip-space elements="root text"/>
  <xsl:preserve-space elements="code"/>

  <xsl:template match="@*|node()">
    <xsl:copy>
      <xsl:apply-templates select="@*|node()"/>
    </xsl:copy>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<root>
  <text>   spaced   </text>
  <code>   preserved   </code>
</root>
```

## Notes

- `xsl:preserve-space` only affects **whitespace-only** text nodes in source elements. Text nodes that contain non-whitespace characters are never stripped regardless of any directive.
- The `xml:space="preserve"` attribute in the source document also prevents stripping, regardless of `xsl:strip-space` directives.
- These directives affect the source tree built from the primary input document and from documents loaded with the `document()` function.
- Whitespace stripping happens before pattern matching; it does not remove whitespace-only text nodes from the result tree.

## See also

- [xsl:strip-space](../xsl-strip-space)
- [xsl:output](../xsl-output)
