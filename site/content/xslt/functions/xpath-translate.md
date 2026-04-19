---
title: "translate()"
description: "Replaces characters in a string one-for-one using a from/to mapping, or removes characters that appear in 'from' but have no corresponding character in 'to'."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "string function"
syntax: "translate(string, from, to)"
tags: ["xslt", "reference", "xpath", "xslt1"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjEuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnZhcmlhYmxlIG5hbWU9InVwcGVyIiBzZWxlY3Q9IidBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWiciLz4KICA8eHNsOnZhcmlhYmxlIG5hbWU9Imxvd2VyIiBzZWxlY3Q9IidhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5eiciLz4KCiAgPHhzbDp0ZW1wbGF0ZSBtYXRjaD0iL2xhYmVscyI-CiAgICA8cmVzdWx0cz4KICAgICAgPHhzbDpmb3ItZWFjaCBzZWxlY3Q9ImxhYmVsIj4KICAgICAgICA8bG93ZXI-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9InRyYW5zbGF0ZSguLCAkdXBwZXIsICRsb3dlcikiLz48L2xvd2VyPgogICAgICA8L3hzbDpmb3ItZWFjaD4KICAgIDwvcmVzdWx0cz4KICA8L3hzbDp0ZW1wbGF0ZT4KPC94c2w6c3R5bGVzaGVldD4&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGxhYmVscz4KICA8bGFiZWw-SEVMTE8gV09STEQ8L2xhYmVsPgogIDxsYWJlbD5NaXhlZCBDYXNlIFRleHQ8L2xhYmVsPgo8L2xhYmVscz4&version=1.0"
---

## Description

`translate()` scans each character of `string` and replaces it according to a character mapping defined by `from` and `to`. For each character at position `i` in `from`, the corresponding character at position `i` in `to` is its replacement. If a character appears in `from` but `to` is shorter (i.e. there is no character at the same position in `to`), the character is **deleted** from the output.

Characters not present in `from` are copied unchanged.

This makes `translate()` the XPath 1.0 tool for:
- Converting case (e.g. uppercase to lowercase) without processor extensions.
- Removing unwanted characters (digits, punctuation, control characters).
- Simple one-to-one character substitutions.

For pattern-based replacement, use `replace()` in XSLT 2.0+.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `string` | xs:string | Yes | The input string to transform. |
| `from` | xs:string | Yes | Characters to match. Each character is a distinct entry in the mapping. |
| `to` | xs:string | Yes | Replacement characters. May be shorter than `from`; missing positions mean deletion. |

## Return value

`xs:string` — the transformed string with characters replaced or removed.

## Examples

### Convert to lowercase (ASCII only)

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<labels>
  <label>HELLO WORLD</label>
  <label>Mixed Case Text</label>
</labels>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:variable name="upper" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZ'"/>
  <xsl:variable name="lower" select="'abcdefghijklmnopqrstuvwxyz'"/>

  <xsl:template match="/labels">
    <results>
      <xsl:for-each select="label">
        <lower><xsl:value-of select="translate(., $upper, $lower)"/></lower>
      </xsl:for-each>
    </results>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<results>
  <lower>hello world</lower>
  <lower>mixed case text</lower>
</results>
```

### Remove non-numeric characters

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<phones>
  <phone>(555) 123-4567</phone>
  <phone>+1 800 555 0199</phone>
</phones>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/phones">
    <digits-only>
      <xsl:for-each select="phone">
        <phone>
          <xsl:value-of select="translate(., '() +-', '')"/>
        </phone>
      </xsl:for-each>
    </digits-only>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<digits-only>
  <phone>5551234567</phone>
  <phone>18005550199</phone>
</digits-only>
```

## Notes

- If a character appears more than once in `from`, the **first** occurrence defines the mapping; subsequent occurrences are ignored.
- When `to` is the empty string `""`, every character in `from` is deleted from the output.
- `translate()` operates on individual code points, not substrings. It cannot replace multi-character sequences. Use `replace()` (XSLT 2.0+) for substring replacement.
- The ASCII case-folding technique (`translate(., 'ABC...', 'abc...')`) does not handle accented or non-Latin characters. For full Unicode case conversion in XSLT 2.0+, use `lower-case()` or `upper-case()`.

## See also

- [normalize-space()](../xpath-normalize-space)
- [contains()](../xpath-contains)
- [replace()](../xpath-replace) — requires XSLT 2.0+
