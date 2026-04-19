---
title: "normalize-unicode()"
description: "Applies Unicode normalization (NFC, NFD, NFKC, NFKD, or FULLY-NORMALIZED) to a string, ensuring a canonical character representation."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "string function"
syntax: "normalize-unicode(string, normalization-form?)"
tags: ["xslt", "reference", "xslt2", "xpath"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvc3RyaW5ncyI-CiAgICA8bm9ybWFsaXplZD4KICAgICAgPHhzbDpmb3ItZWFjaCBzZWxlY3Q9InMiPgogICAgICAgIDwhLS0gRW5zdXJlIE5GQyBiZWZvcmUgY29tcGFyaXNvbiBvciBzdG9yYWdlIC0tPgogICAgICAgIDxzPjx4c2w6dmFsdWUtb2Ygc2VsZWN0PSJub3JtYWxpemUtdW5pY29kZSguLCAnTkZDJykiLz48L3M-CiAgICAgIDwveHNsOmZvci1lYWNoPgogICAgPC9ub3JtYWxpemVkPgogIDwveHNsOnRlbXBsYXRlPgo8L3hzbDpzdHlsZXNoZWV0Pg&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGRhdGE-CiAgPCEtLSBDb250YWlucyDvrIEgbGlnYXR1cmUgKFUrRkIwMSkgYW5kIMKyIHN1cGVyc2NyaXB0IChVKzAwQjIpIC0tPgogIDx2YWx1ZT7vrIFsZcKyPC92YWx1ZT4KPC9kYXRhPg&version=2.0"
---

## Description

`normalize-unicode()` converts a string to a specified Unicode normalization form. Different normalization forms control whether composed or decomposed character representations are used, and whether compatibility equivalents are collapsed.

The most common use case is ensuring consistent string comparison when data may come from different systems that represent the same character differently — for example, the letter `é` can be stored as a single precomposed codepoint (U+00E9) or as `e` followed by a combining accent (U+0065 U+0301).

Normalization forms:

| Form | Name | Description |
|------|------|-------------|
| `NFC` | Canonical Decomposition + Canonical Composition | Precomposed form (default, most common) |
| `NFD` | Canonical Decomposition | Fully decomposed; base characters followed by combining marks |
| `NFKC` | Compatibility Decomposition + Canonical Composition | Collapses compatibility variants (e.g., ligatures, width variants) |
| `NFKD` | Compatibility Decomposition | Decomposed compatibility form |
| `FULLY-NORMALIZED` | W3C XML extension | NFC with additional normalization of initial combining marks |

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `string` | xs:string? | Yes | The string to normalize. |
| `normalization-form` | xs:string | No | One of `NFC`, `NFD`, `NFKC`, `NFKD`, `FULLY-NORMALIZED`. Defaults to `NFC`. |

## Return value

`xs:string` — the input string in the requested normalization form. Returns `""` if `string` is an empty sequence.

## Examples

### Normalizing to NFC for consistent comparison

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/strings">
    <normalized>
      <xsl:for-each select="s">
        <!-- Ensure NFC before comparison or storage -->
        <s><xsl:value-of select="normalize-unicode(., 'NFC')"/></s>
      </xsl:for-each>
    </normalized>
  </xsl:template>
</xsl:stylesheet>
```

### Collapsing compatibility variants with NFKC

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<data>
  <!-- Contains ﬁ ligature (U+FB01) and ² superscript (U+00B2) -->
  <value>ﬁle²</value>
</data>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/data">
    <result>
      <!-- NFKC: ﬁ → fi, ² → 2 -->
      <xsl:value-of select="normalize-unicode(value, 'NFKC')"/>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>file2</result>
```

## Notes

- NFC is the recommended normalization for most XML and web applications; it is the form used in HTML5 and most web APIs.
- NFKC is useful for search and indexing where compatibility equivalents should be treated identically (e.g., full-width vs. half-width letters, ligatures).
- NFD is mainly useful for low-level text processing or font rendering.
- The normalization form argument is case-insensitive; `"nfc"` and `"NFC"` are equivalent.
- If the argument is `""` (empty string), the NFC form (default) is applied.

## See also

- [upper-case()](../xpath-upper-case)
- [lower-case()](../xpath-lower-case)
- [codepoints-to-string()](../xpath-codepoints-to-string)
- [string-to-codepoints()](../xpath-string-to-codepoints)
