---
title: "function-lookup()"
description: "Returns a function item identified by its QName and arity, or the empty sequence if no such function is available."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "higher-order function"
syntax: "function-lookup(name, arity)"
tags: ["xslt", "reference", "xpath", "xslt3"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczp4cz0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiCiAgeG1sbnM6bWF0aD0iaHR0cDovL3d3dy53My5vcmcvMjAwNS94cGF0aC1mdW5jdGlvbnMvbWF0aCI-CgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvIj4KICAgIDxyZXN1bHQ-CiAgICAgIDx4c2w6dmFyaWFibGUgbmFtZT0ic3FydCIgc2VsZWN0PSJmdW5jdGlvbi1sb29rdXAoeHM6UU5hbWUoJ21hdGg6c3FydCcpLCAxKSIvPgogICAgICA8eHNsOmNob29zZT4KICAgICAgICA8eHNsOndoZW4gdGVzdD0iZXhpc3RzKCRzcXJ0KSI-CiAgICAgICAgICA8dmFsdWU-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9IiRzcXJ0KDE2KSIvPjwvdmFsdWU-CiAgICAgICAgPC94c2w6d2hlbj4KICAgICAgICA8eHNsOm90aGVyd2lzZT4KICAgICAgICAgIDx2YWx1ZT5tYXRoOnNxcnQgbm90IGF2YWlsYWJsZTwvdmFsdWU-CiAgICAgICAgPC94c2w6b3RoZXJ3aXNlPgogICAgICA8L3hzbDpjaG9vc2U-CiAgICA8L3Jlc3VsdD4KICA8L3hzbDp0ZW1wbGF0ZT4KPC94c2w6c3R5bGVzaGVldD4&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHJvb3QvPg&version=3.0"
---

## Description

`function-lookup()` looks up a function by its expanded QName and arity (number of parameters) in the static context. If found, it returns the function as a function item; if no such function exists, it returns the empty sequence. This enables optional feature detection and dynamic dispatch patterns.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | xs:QName | Yes | The expanded QName of the function to look up. |
| `arity` | xs:integer | Yes | The number of arguments (arity) the function accepts. |

## Return value

`function(*)?` — the matching function item, or the empty sequence if not found.

## Examples

### Safe lookup before calling

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:math="http://www.w3.org/2005/xpath-functions/math">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <result>
      <xsl:variable name="sqrt" select="function-lookup(xs:QName('math:sqrt'), 1)"/>
      <xsl:choose>
        <xsl:when test="exists($sqrt)">
          <value><xsl:value-of select="$sqrt(16)"/></value>
        </xsl:when>
        <xsl:otherwise>
          <value>math:sqrt not available</value>
        </xsl:otherwise>
      </xsl:choose>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <value>4</value>
</result>
```

### Building a function dispatch table

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="dispatch" select="map{
      'upper': function-lookup(xs:QName('upper-case'), 1),
      'lower': function-lookup(xs:QName('lower-case'), 1),
      'norm':  function-lookup(xs:QName('normalize-space'), 1)
    }"/>
    <results>
      <xsl:for-each select="('upper', 'lower', 'norm')">
        <xsl:variable name="fn" select="map:get($dispatch, .)"/>
        <item op="{.}">
          <xsl:value-of select="if (exists($fn)) then $fn('  Hello World  ') else 'N/A'"/>
        </item>
      </xsl:for-each>
    </results>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<results>
  <item op="upper">  HELLO WORLD  </item>
  <item op="lower">  hello world  </item>
  <item op="norm">Hello World</item>
</results>
```

## Notes

- The `name` argument must be an `xs:QName` created with `xs:QName()` or a namespace-aware constructor.
- For built-in XPath functions, the namespace URI is `http://www.w3.org/2005/xpath-functions`.
- Returns the empty sequence (not an error) when the function is not found, making it safe for feature detection.
- User-defined functions declared with `xsl:function` are also accessible via `function-lookup()`.

## See also

- [apply()](../xpath-apply)
- [function-name()](../xpath-function-name)
- [function-arity()](../xpath-function-arity)
- [for-each()](../xpath-for-each)
