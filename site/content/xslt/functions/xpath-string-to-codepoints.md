---
title: "string-to-codepoints()"
description: "Returns a sequence of integers representing the Unicode codepoints of each character in a string."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "string function"
syntax: "string-to-codepoints(string)"
tags: ["xslt", "reference", "xslt2", "xpath"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvIj4KICAgIDxjb2RlcG9pbnRzPgogICAgICA8eHNsOmZvci1lYWNoIHNlbGVjdD0ic3RyaW5nLXRvLWNvZGVwb2ludHMoJ0hlbGxvIScpIj4KICAgICAgICA8Y3AgdmFsdWU9InsufSIvPgogICAgICA8L3hzbDpmb3ItZWFjaD4KICAgIDwvY29kZXBvaW50cz4KICA8L3hzbDp0ZW1wbGF0ZT4KPC94c2w6c3R5bGVzaGVldD4&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHRleHRzPgogIDx0ZXh0PkjDqWxsbyBXw7ZybGQ8L3RleHQ-CiAgPHRleHQ-UGxhaW4gQVNDSUkgb25seTwvdGV4dD4KPC90ZXh0cz4&version=2.0"
---

## Description

`string-to-codepoints()` decomposes a string into its individual Unicode characters and returns their integer codepoints as a sequence of `xs:integer` values. The sequence length equals the number of Unicode characters (codepoints) in the string, which may differ from the byte length in UTF-8 or UTF-16 encodings.

It is the inverse of `codepoints-to-string()` and enables character-level manipulation — inspecting, filtering, or transforming individual characters by their numeric values.

If the argument is an empty sequence or an empty string, the function returns an empty sequence.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `string` | xs:string? | Yes | The string to decompose into codepoints. |

## Return value

`xs:integer*` — a sequence of Unicode codepoint integers, one per character.

## Examples

### Inspecting character codepoints

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <codepoints>
      <xsl:for-each select="string-to-codepoints('Hello!')">
        <cp value="{.}"/>
      </xsl:for-each>
    </codepoints>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<codepoints>
  <cp value="72"/>
  <cp value="101"/>
  <cp value="108"/>
  <cp value="108"/>
  <cp value="111"/>
  <cp value="33"/>
</codepoints>
```

### Filtering non-ASCII characters

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<texts>
  <text>Héllo Wörld</text>
  <text>Plain ASCII only</text>
</texts>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/texts">
    <analysis>
      <xsl:for-each select="text">
        <xsl:variable name="cps" select="string-to-codepoints(.)"/>
        <text ascii-only="{if (every $cp in $cps satisfies $cp le 127) then 'yes' else 'no'}">
          <xsl:value-of select="."/>
        </text>
      </xsl:for-each>
    </analysis>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<analysis>
  <text ascii-only="no">Héllo Wörld</text>
  <text ascii-only="yes">Plain ASCII only</text>
</analysis>
```

## Notes

- Each item in the returned sequence is the codepoint of one Unicode character, not one byte. For multi-byte UTF-8 characters (e.g., `©` is 2 bytes) the function still returns one integer.
- Surrogate pairs as used in UTF-16 are presented as their actual codepoint (e.g., U+1F600 emoji returns `128512`, not two surrogate integers).
- Combining with `codepoints-to-string()` allows lossless character-by-character transformations.
- `count(string-to-codepoints($s))` gives the number of Unicode characters, equivalent to `string-length($s)`.

## See also

- [codepoints-to-string()](../xpath-codepoints-to-string)
- [string-length()](../xpath-string-length)
- [normalize-unicode()](../xpath-normalize-unicode)
