---
title: "substring-before()"
description: "Returns the part of a string that appears before the first occurrence of a given separator substring."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "string function"
syntax: "substring-before(string, separator)"
tags: ["xslt", "reference", "xpath", "xslt1"]
---

## Description

`substring-before()` finds the first occurrence of `separator` in `string` and returns everything that precedes it. If `separator` is not found, the function returns the empty string `""`. If `separator` is the empty string, the function also returns `""`.

Both arguments are converted to strings before processing. The search is case-sensitive.

`substring-before()` is the XPath 1.0 way to split a delimited string and extract the left-hand portion: usernames from `user@host` addresses, keys from `key=value` pairs, or path segments from URIs.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `string` | xs:string | Yes | The string to search within. |
| `separator` | xs:string | Yes | The delimiter to search for. |

## Return value

`xs:string` — the portion of `string` before the first occurrence of `separator`, or `""` if not found.

## Examples

### Extract username from an email address

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<users>
  <user email="alice@example.com"/>
  <user email="bob.smith@company.org"/>
</users>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/users">
    <usernames>
      <xsl:for-each select="user">
        <username><xsl:value-of select="substring-before(@email, '@')"/></username>
      </xsl:for-each>
    </usernames>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<usernames>
  <username>alice</username>
  <username>bob.smith</username>
</usernames>
```

### Extract key from a key=value pair

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<params>
  <param>color=blue</param>
  <param>size=large</param>
  <param>weight=1.5kg</param>
</params>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/params">
    <parsed>
      <xsl:for-each select="param">
        <entry>
          <key><xsl:value-of select="substring-before(., '=')"/></key>
          <value><xsl:value-of select="substring-after(., '=')"/></value>
        </entry>
      </xsl:for-each>
    </parsed>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<parsed>
  <entry><key>color</key><value>blue</value></entry>
  <entry><key>size</key><value>large</value></entry>
  <entry><key>weight</key><value>1.5kg</value></entry>
</parsed>
```

## Notes

- If `separator` does not appear in `string`, `substring-before()` returns `""` — not the original string. Use `contains()` first if you need to distinguish the "not found" case.
- Only the **first** occurrence of `separator` is used. To split on the last occurrence, combine `substring-before()` with `substring-after()` and recursive templates or iterate with the `translate()` trick in XSLT 1.0.
- `substring-before($s, '')` returns `""` as specified; this is a common source of confusion.
- In XSLT 2.0+, `tokenize()` provides a cleaner way to split strings on delimiters, including regex-based separators.

## See also

- [substring-after()](../xpath-substring-after)
- [starts-with()](../xpath-starts-with)
- [contains()](../xpath-contains)
- [substring()](../xpath-substring)
