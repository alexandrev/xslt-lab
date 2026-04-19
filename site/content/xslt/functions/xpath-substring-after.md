---
title: "substring-after()"
description: "Returns the part of a string that appears after the first occurrence of a given separator substring."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "string function"
syntax: "substring-after(string, separator)"
tags: ["xslt", "reference", "xpath", "xslt1"]
---

## Description

`substring-after()` finds the first occurrence of `separator` in `string` and returns everything that follows it. If `separator` is not found, the function returns the empty string `""`. If `separator` is the empty string, the function returns the entire `string`.

Both arguments are converted to strings before processing. The search is case-sensitive.

`substring-after()` is the complement of `substring-before()` and together they provide the XPath 1.0 way to split a delimited string: extract the domain from an email address, the value from a `key=value` pair, or the path from a `scheme://authority/path` URI.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `string` | xs:string | Yes | The string to search within. |
| `separator` | xs:string | Yes | The delimiter to search for. |

## Return value

`xs:string` — the portion of `string` after the first occurrence of `separator`, or `""` if not found.

## Examples

### Extract the domain from an email address

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<users>
  <user email="alice@example.com"/>
  <user email="bob@company.org"/>
</users>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/users">
    <domains>
      <xsl:for-each select="user">
        <domain><xsl:value-of select="substring-after(@email, '@')"/></domain>
      </xsl:for-each>
    </domains>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<domains>
  <domain>example.com</domain>
  <domain>company.org</domain>
</domains>
```

### Extract a path segment after a known prefix

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urls>
  <url>https://api.example.com/v1/users</url>
  <url>https://api.example.com/v1/products</url>
</urls>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/urls">
    <paths>
      <xsl:for-each select="url">
        <path>
          <xsl:value-of select="substring-after(., 'https://api.example.com')"/>
        </path>
      </xsl:for-each>
    </paths>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<paths>
  <path>/v1/users</path>
  <path>/v1/products</path>
</paths>
```

## Notes

- If `separator` is not found in `string`, the result is `""` — not the original string. Use `contains()` first if you need to handle the not-found case differently.
- Only the **first** occurrence of `separator` is used. To extract the portion after the last occurrence, nest `substring-after()` calls or use a recursive named template in XSLT 1.0.
- `substring-after($s, '')` returns the full string `$s` (the empty string is found at position zero, so everything after it is the whole input).
- In XSLT 2.0+, `tokenize()` splits a string into a sequence and is generally more convenient for repeated splitting.

## See also

- [substring-before()](../xpath-substring-before)
- [starts-with()](../xpath-starts-with)
- [contains()](../xpath-contains)
- [substring()](../xpath-substring)
