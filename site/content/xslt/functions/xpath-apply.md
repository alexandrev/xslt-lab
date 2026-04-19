---
title: "apply()"
description: "Calls a function item with arguments supplied as an array, enabling dynamic dispatch with a variable argument list."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "higher-order function"
syntax: "apply(function, array-of-args)"
tags: ["xslt", "reference", "xpath", "xslt3"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczp4cz0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiCiAgeG1sbnM6Zj0iaHR0cDovL2V4YW1wbGUuY29tL2Z1bmN0aW9ucyI-CgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOmZ1bmN0aW9uIG5hbWU9ImY6YWRkIiBhcz0ieHM6aW50ZWdlciI-CiAgICA8eHNsOnBhcmFtIG5hbWU9ImEiIGFzPSJ4czppbnRlZ2VyIi8-CiAgICA8eHNsOnBhcmFtIG5hbWU9ImIiIGFzPSJ4czppbnRlZ2VyIi8-CiAgICA8eHNsOnNlcXVlbmNlIHNlbGVjdD0iJGEgKyAkYiIvPgogIDwveHNsOmZ1bmN0aW9uPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvIj4KICAgIDxyZXN1bHQ-CiAgICAgIDwhLS0gQ2FsbCBmOmFkZCB3aXRoIGFyZ3VtZW50cyBbMywgN10gc3VwcGxpZWQgYXMgYW4gYXJyYXkgLS0-CiAgICAgIDx4c2w6dmFyaWFibGUgbmFtZT0iZm4iIHNlbGVjdD0iZjphZGQjMiIvPgogICAgICA8eHNsOnZhcmlhYmxlIG5hbWU9ImFyZ3MiIHNlbGVjdD0iWzMsIDddIi8-CiAgICAgIDx2YWx1ZT48eHNsOnZhbHVlLW9mIHNlbGVjdD0iYXBwbHkoJGZuLCAkYXJncykiLz48L3ZhbHVlPgogICAgPC9yZXN1bHQ-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPG9wZXJhdGlvbnM-CiAgPG9wIG5hbWU9InVwcGVyIiB2YWx1ZT0iaGVsbG8iLz4KICA8b3AgbmFtZT0ibG93ZXIiIHZhbHVlPSJXT1JMRCIvPgo8L29wZXJhdGlvbnM-&version=3.0"
---

## Description

`apply()` invokes a function item, passing its arguments as members of an array. This enables dynamic function calls where both the function and its argument list are determined at runtime. The number of array members must match the arity of the function, otherwise a type error is raised.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `function` | function(*) | Yes | The function item to invoke. |
| `array-of-args` | array(*) | Yes | An array whose members are the arguments to pass. Member count must equal the function arity. |

## Return value

`item()*` — the result returned by the invoked function.

## Examples

### Dynamic dispatch with apply()

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:f="http://example.com/functions">

  <xsl:output method="xml" indent="yes"/>

  <xsl:function name="f:add" as="xs:integer">
    <xsl:param name="a" as="xs:integer"/>
    <xsl:param name="b" as="xs:integer"/>
    <xsl:sequence select="$a + $b"/>
  </xsl:function>

  <xsl:template match="/">
    <result>
      <!-- Call f:add with arguments [3, 7] supplied as an array -->
      <xsl:variable name="fn" select="f:add#2"/>
      <xsl:variable name="args" select="[3, 7]"/>
      <value><xsl:value-of select="apply($fn, $args)"/></value>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <value>10</value>
</result>
```

### Applying a selected operation dynamically

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<operations>
  <op name="upper" value="hello"/>
  <op name="lower" value="WORLD"/>
</operations>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/operations">
    <results>
      <xsl:for-each select="op">
        <xsl:variable name="fn" select="
          if (@name = 'upper') then upper-case#1
          else lower-case#1"/>
        <result><xsl:value-of select="apply($fn, [string(@value)])"/></result>
      </xsl:for-each>
    </results>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<results>
  <result>HELLO</result>
  <result>world</result>
</results>
```

## Notes

- `apply()` is defined in XPath 3.0 / XSLT 3.0. It is not available in XSLT 2.0 or earlier.
- The function arity must exactly match the number of members in the array; a mismatch causes `err:FOAP0001`.
- `apply()` is the complement of inline function items and partial function application.
- Useful for implementing dispatch tables and strategy patterns in XSLT.

## See also

- [function-lookup()](../xpath-function-lookup)
- [function-name()](../xpath-function-name)
- [function-arity()](../xpath-function-arity)
- [for-each()](../xpath-for-each)
