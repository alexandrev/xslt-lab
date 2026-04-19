---
title: "starts-with()"
description: "Returns true if the first string begins with the second string as an exact prefix, performing a case-sensitive comparison."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "string function"
syntax: "starts-with(string, prefix)"
tags: ["xslt", "reference", "xpath", "xslt1"]
---

## Description

`starts-with()` tests whether `string` begins with `prefix` and returns a boolean. Both arguments are converted to strings before the comparison, which is **case-sensitive** and based on Unicode code points.

If `prefix` is the empty string `""`, the function always returns `true`, because every string (including the empty string) starts with the empty string.

`starts-with()` is commonly used in predicates to select elements or attributes that share a naming convention, a URL scheme prefix, or any other known leading text. It is simpler and faster than the equivalent `substring()` comparison.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `string` | xs:string | Yes | The string to test. |
| `prefix` | xs:string | Yes | The expected prefix. |

## Return value

`xs:boolean` — `true` if `string` starts with `prefix`, `false` otherwise.

## Examples

### Filter elements by attribute prefix

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<links>
  <link href="https://example.com/page1">Page 1</link>
  <link href="http://example.com/page2">Page 2</link>
  <link href="https://example.com/page3">Page 3</link>
  <link href="ftp://files.example.com">Files</link>
</links>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/links">
    <secure-links>
      <xsl:for-each select="link[starts-with(@href, 'https://')]">
        <a href="{@href}"><xsl:value-of select="."/></a>
      </xsl:for-each>
    </secure-links>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<secure-links>
  <a href="https://example.com/page1">Page 1</a>
  <a href="https://example.com/page3">Page 3</a>
</secure-links>
```

### Conditional processing based on prefix

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<codes>
  <code>ERR-001</code>
  <code>OK-202</code>
  <code>ERR-403</code>
</codes>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/codes">
    <report>
      <xsl:for-each select="code">
        <xsl:if test="starts-with(., 'ERR')">
          <error><xsl:value-of select="."/></error>
        </xsl:if>
      </xsl:for-each>
    </report>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<report>
  <error>ERR-001</error>
  <error>ERR-403</error>
</report>
```

## Notes

- The comparison is **case-sensitive**: `starts-with('Hello', 'he')` returns `false`. For case-insensitive prefix matching in XSLT 2.0+, use `starts-with(lower-case($s), 'he')`.
- `starts-with($s, '')` always returns `true`.
- XPath 1.0 has no `ends-with()` function. To test a suffix, use `substring($s, string-length($s) - string-length($suffix) + 1) = $suffix`, or use `ends-with()` in XSLT 2.0+.
- `starts-with()` is equivalent to `substring($s, 1, string-length($prefix)) = $prefix` but far more readable.

## See also

- [contains()](../xpath-contains)
- [substring-before()](../xpath-substring-before)
- [substring-after()](../xpath-substring-after)
