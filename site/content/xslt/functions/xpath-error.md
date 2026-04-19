---
title: "error()"
description: "Raises a dynamic error with an optional error code, description message, and error object."
date: 2026-04-19T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "node function"
syntax: "error(code?, description?, object?)"
tags: ["xslt", "reference", "xpath", "xslt2"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczp4cz0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvcmVxdWVzdCI-CiAgICA8eHNsOnZhcmlhYmxlIG5hbWU9ImFnZSIgc2VsZWN0PSJ4czppbnRlZ2VyKGFnZSkiLz4KICAgIDx4c2w6aWYgdGVzdD0iJGFnZSBsdCAwIj4KICAgICAgPHhzbDp2YWx1ZS1vZiBzZWxlY3Q9ImVycm9yKCgpLCBjb25jYXQoJ0FnZSBtdXN0IGJlIG5vbi1uZWdhdGl2ZSwgZ290OiAnLCAkYWdlKSkiLz4KICAgIDwveHNsOmlmPgogICAgPHJlc3VsdCBhZ2U9InskYWdlfSIvPgogIDwveHNsOnRlbXBsYXRlPgo8L3hzbDpzdHlsZXNoZWV0Pg&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHJlcXVlc3Q-CiAgPGFnZT4tNTwvYWdlPgo8L3JlcXVlc3Q-&version=2.0"
---

## Description

`error()` raises a dynamic error unconditionally when evaluated. The transformation is aborted unless the error is caught by an `xsl:try/xsl:catch` block (XSLT 3.0). The function is useful for asserting preconditions, documenting unreachable code branches, and raising structured errors with well-defined error codes.

All three arguments are optional. When called with no arguments, a generic error (`FOER0000`) is raised. When `code` is supplied it must be a `QName` such as `QName('http://example.com/errors', 'e:InvalidInput')`. The `description` is a human-readable string. The `object` is an arbitrary item sequence attached to the error for diagnostic purposes.

Because `error()` never returns a value, it can be used in any XPath context, including the middle of a conditional expression.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `code` | xs:QName? | No | A QName identifying the error type; defaults to `FOER0000`. |
| `description` | xs:string? | No | A human-readable description of the error. |
| `object` | item()* | No | Arbitrary diagnostic data attached to the error. |

## Return value

`error()` never returns; it always raises a dynamic error.

## Examples

### Guarding an invalid input

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<request>
  <age>-5</age>
</request>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/request">
    <xsl:variable name="age" select="xs:integer(age)"/>
    <xsl:if test="$age lt 0">
      <xsl:value-of select="error((), concat('Age must be non-negative, got: ', $age))"/>
    </xsl:if>
    <result age="{$age}"/>
  </xsl:template>
</xsl:stylesheet>
```

**Output (transformation aborted):**
```
Dynamic error: Age must be non-negative, got: -5
```

### Catching an error in XSLT 3.0

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:err="http://www.w3.org/2005/xqt-errors"
  xmlns:app="http://example.com/errors">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <result>
      <xsl:try>
        <xsl:value-of select="error(QName('http://example.com/errors','app:NotFound'), 'Resource missing')"/>
        <xsl:catch errors="app:NotFound">
          <warning code="{$err:code}"><xsl:value-of select="$err:description"/></warning>
        </xsl:catch>
      </xsl:try>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <warning code="app:NotFound">Resource missing</warning>
</result>
```

## Notes

- `error()` with no arguments raises `FOER0000`; this is the XPath equivalent of an unspecified runtime exception.
- In XSLT 1.0, `xsl:message terminate="yes"` is the closest equivalent since `error()` is not available.
- The `object` argument is accessible as `$err:value` inside an `xsl:catch` block in XSLT 3.0.
- `error()` is typed as returning `none`, which means it is type-compatible with any return type and can appear in the branch of an `if` expression without causing a type error.

## See also

- [xsl:message](../xsl-message)
- [trace()](../xpath-trace)
- [exactly-one()](../xpath-exactly-one)
