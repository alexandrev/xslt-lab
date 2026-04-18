---
title: "concat()"
description: "Concatenates two or more strings into a single string, accepting any number of arguments."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "string function"
syntax: "concat(str1, str2, ...)"
tags: ["xslt", "reference", "xslt1", "xpath"]
---

## Description

`concat()` joins two or more string arguments into a single string, in the order they are provided. Each argument is converted to a string using the XPath string-value rules before concatenation.

It requires **at least two arguments** but accepts any number. Arguments that are not strings (numbers, booleans, nodes) are automatically cast to their string representation.

`concat()` is the standard way to build dynamic attribute values, filenames, URIs, or any computed string in XSLT 1.0. In XSLT 2.0+, `string-join()` is often more readable when the separator is uniform.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `str1` | xs:anyAtomicType | Yes | First string (or value convertible to string). |
| `str2` | xs:anyAtomicType | Yes | Second string. |
| `...` | xs:anyAtomicType | No | Additional strings; at least two arguments are required. |

## Return value

`xs:string` — all arguments concatenated in order, with no separator.

## Examples

### Build a full name

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<person>
  <first>Jane</first>
  <last>Smith</last>
</person>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>

  <xsl:template match="/person">
    <xsl:value-of select="concat(first, ' ', last)"/>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```
Jane Smith
```

### Dynamic attribute value

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/person">
    <a href="{concat('/profile/', first, '-', last)}">
      <xsl:value-of select="concat(first, ' ', last)"/>
    </a>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<a href="/profile/Jane-Smith">Jane Smith</a>
```

### Concatenate node values and literals

```xml
<!-- Compose a greeting -->
<xsl:value-of select="concat('Hello, ', /person/first, '! You have ', count(//message), ' messages.')"/>
```

## Notes

- `concat()` does not add any separator between arguments. To join with a separator, either include the separator as a literal argument or use `string-join()` (XSLT 2.0+).
- Unlike `string-join()`, `concat()` does not accept a sequence; each argument must be a single value.
- Attribute value templates `{expression}` are a shorthand alternative for simple cases and can call `concat()` inside them.
- Numbers are converted to their canonical string form: `concat(1.0, 'x')` produces `"1x"` not `"1.0x"` (the exact output depends on the XPath string conversion rules).

## See also

- [string-join()](../xpath-string-join)
- [contains()](../xpath-contains)
