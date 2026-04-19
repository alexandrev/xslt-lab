---
title: "xsl:output-character"
description: "Specifies a single character-to-string substitution within an xsl:character-map, applied by the serializer when writing output."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "element"
syntax: '<xsl:output-character character="&amp;" string="&amp;amp;"/>'
tags: ["xslt", "reference", "xslt2"]
---

## Description

`xsl:output-character` is a child element of `xsl:character-map`. It maps a single Unicode character to a replacement string that the serializer writes literally in the output — bypassing normal XML escaping. Each `xsl:output-character` handles exactly one character.

The `character` attribute must be a single XML character (specified as a literal character or a character reference such as `&#160;`). The `string` attribute is the text string written to the output in its place — including any markup or entity references you want to appear literally.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `character` | Single XML character | Yes | The Unicode character to intercept during serialization. |
| `string` | xs:string | Yes | The string to write in place of the character. |

## Return value

No output. This declaration is used only by the serializer when the enclosing `xsl:character-map` is active.

## Examples

### Common HTML entity mappings

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:character-map name="html5-entities">
    <xsl:output-character character="&#160;"  string="&amp;nbsp;"/>
    <xsl:output-character character="&#169;"  string="&amp;copy;"/>
    <xsl:output-character character="&#174;"  string="&amp;reg;"/>
    <xsl:output-character character="&#8226;" string="&amp;bull;"/>
    <xsl:output-character character="&#8212;" string="&amp;mdash;"/>
    <xsl:output-character character="&#8211;" string="&amp;ndash;"/>
  </xsl:character-map>

  <xsl:output method="html" use-character-maps="html5-entities"/>

  <xsl:template match="/content">
    <p><xsl:value-of select="."/></p>
  </xsl:template>
</xsl:stylesheet>
```

If the input contains `©` (U+00A9) and `—` (U+2014), the output will contain `&copy;` and `&mdash;` literally.

### Escaping special characters for legacy systems

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <!-- Replace curly quotes with straight quotes for legacy system compatibility -->
  <xsl:character-map name="straighten-quotes">
    <xsl:output-character character="&#8216;" string="'"/>
    <xsl:output-character character="&#8217;" string="'"/>
    <xsl:output-character character="&#8220;" string='"'/>
    <xsl:output-character character="&#8221;" string='"'/>
  </xsl:character-map>

  <xsl:output method="text" use-character-maps="straighten-quotes"/>

  <xsl:template match="/">
    <xsl:value-of select="/text"/>
  </xsl:template>
</xsl:stylesheet>
```

**Input text:** `He said &#8220;hello&#8221; and she replied &#8216;hi&#8217;.`
**Output text:** `He said "hello" and she replied 'hi'.`

## Notes

- The `character` attribute must contain exactly one XML character. Strings are not supported; use one `xsl:output-character` per character.
- The `string` attribute value is written verbatim. If it contains characters that would normally be escaped by the serializer, the character map takes precedence.
- A character can appear in only one `xsl:output-character` within the combined set of active character maps.
- This element has no effect on the internal XDM tree; it only affects the serialized text output.

## See also

- [xsl:character-map](../xsl-character-map)
- [xsl:output](../xsl-output)
