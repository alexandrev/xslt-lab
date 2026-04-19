---
title: "type-available()"
description: "Returns true if the schema type named by the argument is available in the static context."
date: 2026-04-19T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "node function"
syntax: "type-available(type-name)"
tags: ["xslt", "reference", "xpath", "xslt2"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczp4cz0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvZGF0YSI-CiAgICA8cmVzdWx0PgogICAgICA8eHNsOmNob29zZT4KICAgICAgICA8eHNsOndoZW4gdGVzdD0idHlwZS1hdmFpbGFibGUoJ3hzOmludGVnZXInKSI-CiAgICAgICAgICA8dHlwZWQ-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9InhzOmludGVnZXIodmFsdWUpICogMiIvPjwvdHlwZWQ-CiAgICAgICAgPC94c2w6d2hlbj4KICAgICAgICA8eHNsOm90aGVyd2lzZT4KICAgICAgICAgIDx1bnR5cGVkPjx4c2w6dmFsdWUtb2Ygc2VsZWN0PSJ2YWx1ZSAqIDIiLz48L3VudHlwZWQ-CiAgICAgICAgPC94c2w6b3RoZXJ3aXNlPgogICAgICA8L3hzbDpjaG9vc2U-CiAgICA8L3Jlc3VsdD4KICA8L3hzbDp0ZW1wbGF0ZT4KPC94c2w6c3R5bGVzaGVldD4&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGRhdGE-CiAgPHZhbHVlPjQyPC92YWx1ZT4KPC9kYXRhPg&version=2.0"
---

## Description

`type-available()` tests whether a named XML Schema type is known to the processor in the current static context. The argument is a string containing the lexical QName of the type, resolved against the in-scope namespace bindings. The function returns `true` if the type exists and can be used for casting, instance-of tests, or schema validation; otherwise it returns `false`.

This function is used in conjunction with `xsl:if` or `xsl:when` to write portable stylesheets that adapt their behavior based on which schema types have been imported. Built-in schema types from the `xs:` namespace are always available. User-defined types from imported schemas are available only when schema-awareness is active.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type-name` | xs:string | Yes | The lexical QName of the schema type to test, resolved in the current namespace context. |

## Return value

`xs:boolean` — `true` if the named type is available, `false` otherwise.

## Examples

### Conditional behavior based on schema type availability

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<data>
  <value>42</value>
</data>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/data">
    <result>
      <xsl:choose>
        <xsl:when test="type-available('xs:integer')">
          <typed><xsl:value-of select="xs:integer(value) * 2"/></typed>
        </xsl:when>
        <xsl:otherwise>
          <untyped><xsl:value-of select="value * 2"/></untyped>
        </xsl:otherwise>
      </xsl:choose>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <typed>84</typed>
</result>
```

### Checking for a user-defined type

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:app="http://example.com/schema">
  <xsl:output method="text"/>

  <xsl:template match="/">
    <xsl:choose>
      <xsl:when test="type-available('app:ProductCode')">
        <xsl:text>User-defined type is available</xsl:text>
      </xsl:when>
      <xsl:otherwise>
        <xsl:text>Running without schema import</xsl:text>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
</xsl:stylesheet>
```

**Output (without schema import):**
```
Running without schema import
```

## Notes

- All types in the `xs:` namespace are available in any XSLT 2.0 or later processor that supports the XML Schema built-in types, regardless of whether any schema has been imported.
- User-defined types must be imported with `xsl:import-schema` before they are recognized by `type-available()`.
- `type-available()` tests availability at runtime, but type names must still be resolved at compile time using in-scope namespaces.
- The analogous functions `function-available()` and `element-available()` test for XSLT extension functions and elements respectively.

## See also

- [function-available()](../xpath-function-available)
- [element-available()](../xpath-element-available)
- [xsl:import-schema](../xsl-import-schema)
