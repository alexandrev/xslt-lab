---
title: "upper-case()"
description: "Converts every character of a string to its Unicode uppercase equivalent using locale-independent Unicode case mapping."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "string function"
syntax: "upper-case(string)"
tags: ["xslt", "reference", "xslt2", "xpath"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvbWVzc2FnZXMiPgogICAgPHVwcGVyPgogICAgICA8eHNsOmZvci1lYWNoIHNlbGVjdD0ibXNnIj4KICAgICAgICA8bXNnPjx4c2w6dmFsdWUtb2Ygc2VsZWN0PSJ1cHBlci1jYXNlKC4pIi8-PC9tc2c-CiAgICAgIDwveHNsOmZvci1lYWNoPgogICAgPC91cHBlcj4KICA8L3hzbDp0ZW1wbGF0ZT4KPC94c2w6c3R5bGVzaGVldD4&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPG1lc3NhZ2VzPgogIDxtc2c-SGVsbG8sIFdvcmxkITwvbXNnPgogIDxtc2c-eHNsdCBpcyBwb3dlcmZ1bDwvbXNnPgogIDxtc2c-w4RyZ2VyIG1pdCDDnDwvbXNnPgo8L21lc3NhZ2VzPg&version=2.0"
---

## Description

`upper-case()` returns a copy of the input string with every character converted to uppercase according to Unicode case mappings. The conversion is locale-independent and uses the Unicode default case folding rules — it does not consider language-specific rules (e.g., Turkish dotless-i). For language-sensitive uppercasing, a collation-aware approach or custom extension function is needed.

If the argument is an empty sequence, the function returns the empty string `""`.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `string` | xs:string? | Yes | The string to convert. |

## Return value

`xs:string` — the input string with all characters mapped to uppercase.

## Examples

### Basic uppercase conversion

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<messages>
  <msg>Hello, World!</msg>
  <msg>xslt is powerful</msg>
  <msg>Ärger mit Ü</msg>
</messages>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/messages">
    <upper>
      <xsl:for-each select="msg">
        <msg><xsl:value-of select="upper-case(.)"/></msg>
      </xsl:for-each>
    </upper>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<upper>
  <msg>HELLO, WORLD!</msg>
  <msg>XSLT IS POWERFUL</msg>
  <msg>ÄRGER MIT Ü</msg>
</upper>
```

### Case-insensitive comparison

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/catalog">
    <!-- Select items regardless of how 'active' is cased in the data -->
    <active-items>
      <xsl:for-each select="item[upper-case(@status) = 'ACTIVE']">
        <item><xsl:value-of select="name"/></item>
      </xsl:for-each>
    </active-items>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- `upper-case()` is not the same as the `i` flag on `matches()`. The function changes the string; the flag changes how matching works.
- For true locale-aware uppercasing (e.g., Turkish `i` → `İ`), use an extension function or a collation-aware approach.
- Numeric, punctuation, and whitespace characters are returned unchanged.
- Combining `upper-case()` with `normalize-unicode()` can help with Unicode normalization before comparison.

## See also

- [lower-case()](../xpath-lower-case)
- [normalize-unicode()](../xpath-normalize-unicode)
- [normalize-space()](../xpath-normalize-space)
