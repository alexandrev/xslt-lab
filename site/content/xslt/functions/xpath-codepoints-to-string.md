---
title: "codepoints-to-string()"
description: "Constructs a string from a sequence of Unicode codepoint integers, enabling programmatic string assembly from character codes."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "string function"
syntax: "codepoints-to-string(sequence)"
tags: ["xslt", "reference", "xslt2", "xpath"]
---

## Description

`codepoints-to-string()` takes a sequence of integer Unicode codepoints and returns the string formed by the corresponding characters in that order. It is the inverse of `string-to-codepoints()`.

This function is useful when you need to:
- Construct strings containing characters that are hard to type or embed in XML.
- Build strings programmatically from computed character codes.
- Round-trip through codepoint manipulation (e.g., ROT-13, Caesar cipher).

If the sequence is empty, the function returns an empty string. An error is raised if any integer in the sequence is not a valid XML character codepoint (e.g., codepoints in the surrogate range U+D800–U+DFFF).

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sequence` | xs:integer* | Yes | A sequence of Unicode codepoint integers. |

## Return value

`xs:string` — the string formed by concatenating the characters for each codepoint in order.

## Examples

### Building a string from codepoints

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <results>
      <!-- Codepoints for 'Hello' -->
      <word><xsl:value-of select="codepoints-to-string((72, 101, 108, 108, 111))"/></word>
      <!-- Tab character (U+0009) -->
      <tab-char><xsl:value-of select="codepoints-to-string(9)"/></tab-char>
      <!-- Copyright sign (U+00A9) -->
      <copyright><xsl:value-of select="codepoints-to-string(169)"/></copyright>
    </results>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<results>
  <word>Hello</word>
  <tab-char>	</tab-char>
  <copyright>©</copyright>
</results>
```

### Applying a simple character shift (Caesar cipher)

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<messages>
  <msg>Hello</msg>
</messages>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:function name="my:rot13" as="xs:string" xmlns:my="http://example.com/my">
    <xsl:param name="s" as="xs:string"/>
    <xsl:value-of select="codepoints-to-string(
      for $cp in string-to-codepoints($s) return
        if ($cp ge 65 and $cp le 90)  then (($cp - 65 + 13) mod 26) + 65
        else if ($cp ge 97 and $cp le 122) then (($cp - 97 + 13) mod 26) + 97
        else $cp
    )"/>
  </xsl:function>

  <xsl:template match="/messages">
    <encoded>
      <xsl:for-each select="msg">
        <msg><xsl:value-of select="my:rot13(.)"/></msg>
      </xsl:for-each>
    </encoded>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<encoded>
  <msg>Uryyb</msg>
</encoded>
```

## Notes

- Codepoints must be valid XML characters. Codepoints 0 (except in some contexts), and the range U+D800–U+DFFF (surrogates) are not valid and will cause a dynamic error.
- The function accepts a single integer or a sequence of integers interchangeably.
- Combining with `string-to-codepoints()` enables low-level string transformations without regular expressions.
- Codepoint 32 is a space, 10 is a newline (`&#10;`), 9 is a tab (`&#9;`).

## See also

- [string-to-codepoints()](../xpath-string-to-codepoints)
- [normalize-unicode()](../xpath-normalize-unicode)
- [compare()](../xpath-compare)
