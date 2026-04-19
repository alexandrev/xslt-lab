---
title: "string-length()"
description: "Returns the number of characters in a string, or the length of the context node's string value when called with no argument."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "string function"
syntax: "string-length(string?)"
tags: ["xslt", "reference", "xpath", "xslt1"]
---

## Description

`string-length()` returns the number of characters in its string argument. The argument is first converted to a string using `string()` rules. When called without an argument, it returns the character count of the context node's string value.

In XPath 1.0, "characters" means Unicode code points. Surrogate pairs and multi-byte UTF-8 sequences each count as however many code points they represent (a supplementary character represented by two UTF-16 code units may count as one or two depending on the processor).

`string-length()` is useful for validation (checking minimum or maximum field lengths), for computing substring offsets, and for filtering elements whose content exceeds or falls below a threshold.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `string` | xs:string | No | The string to measure. Defaults to the context node's string value. |

## Return value

`xs:double` — the number of characters in the string (a non-negative integer represented as a double).

## Examples

### Filter elements by content length

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<words>
  <word>hi</word>
  <word>hello</word>
  <word>extraordinary</word>
  <word>ok</word>
</words>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/words">
    <long-words>
      <xsl:for-each select="word[string-length(.) &gt; 4]">
        <item><xsl:value-of select="."/></item>
      </xsl:for-each>
    </long-words>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<long-words>
  <item>hello</item>
  <item>extraordinary</item>
</long-words>
```

### Report field lengths

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<form>
  <field name="username">alice</field>
  <field name="email">alice@example.com</field>
</form>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/form">
    <lengths>
      <xsl:for-each select="field">
        <field name="{@name}" length="{string-length(.)}"/>
      </xsl:for-each>
    </lengths>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<lengths>
  <field name="username" length="5"/>
  <field name="email" length="17"/>
</lengths>
```

## Notes

- `string-length('')` returns `0`. An empty element with no text children has `string-length()` of `0`.
- The return value is a number (double), not an integer, although it will always be a whole number in practice.
- `string-length()` counts the string value of the context node when called with no argument — for an element, that is all descendant text nodes concatenated.
- For computing a right-aligned substring (e.g. the last N characters), combine with `substring()`: `substring($s, string-length($s) - N + 1)`.
- In XSLT 2.0+, `fn:string-length()` operates identically but the argument must be a single string; passing a sequence of more than one item raises a type error.

## See also

- [string()](../xpath-string)
- [normalize-space()](../xpath-normalize-space)
- [substring()](../xpath-substring)
