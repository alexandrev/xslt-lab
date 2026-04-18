---
title: "xsl:function"
description: "Defines a named, callable stylesheet function available in XPath expressions throughout the stylesheet."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "element"
syntax: '<xsl:function name="prefix:name" as="return-type">'
tags: ["xslt", "reference", "xslt2", "xpath"]
---

## Description

`xsl:function` lets you define reusable functions directly inside a stylesheet. Once declared, the function can be called from any XPath expression in the same stylesheet — in `select` attributes, predicates, pattern expressions, or attribute value templates.

Functions must have a **namespace-qualified name** (a prefix other than `xsl:`). The `as` attribute declares the return type using an XPath sequence type such as `xs:string`, `xs:integer`, `element()`, or `xs:string*`. Parameters are declared with `xsl:param` child elements, each optionally carrying an `as` type constraint.

Unlike named templates (`xsl:call-template`), stylesheet functions return a value and can be used inline inside XPath expressions. They cannot produce result-tree nodes as a side effect — the function body must evaluate to a sequence that becomes the return value.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | QName | Yes | The qualified name of the function (must include a non-`xsl:` namespace prefix). |
| `as` | SequenceType | No | Declared return type. Saxon enforces type checking when specified. |
| `visibility` | `"public"` \| `"private"` \| `"final"` \| `"abstract"` | No | Controls visibility in package/module scenarios (XSLT 3.0). Defaults to `"private"`. |
| `override` | `"yes"` \| `"no"` | No | XSLT 2.0 only: whether this function overrides an imported function with the same name and arity. |

### Child elements

| Element | Description |
|---------|-------------|
| `xsl:param` | Declares a parameter. Add one per argument in signature order. |
| *(body instructions)* | Any XSLT instructions whose final evaluated result is the function's return value. |

## Return value

The return value is whatever the last instruction in the function body evaluates to, or whatever is returned by `xsl:sequence`. The type is validated against the `as` attribute if present.

## Examples

### String utility function

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:fn="http://example.com/functions"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  exclude-result-prefixes="fn xs">

  <!-- Custom function: capitalise the first letter of a string -->
  <xsl:function name="fn:capitalize" as="xs:string">
    <xsl:param name="input" as="xs:string"/>
    <xsl:sequence select="concat(upper-case(substring($input, 1, 1)), substring($input, 2))"/>
  </xsl:function>

  <xsl:template match="/names">
    <xsl:output method="xml" indent="yes"/>
    <result>
      <xsl:for-each select="name">
        <item><xsl:value-of select="fn:capitalize(.)"/></item>
      </xsl:for-each>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<names>
  <name>alice</name>
  <name>bob</name>
  <name>carol</name>
</names>
```

**Output:**
```xml
<result>
  <item>Alice</item>
  <item>Bob</item>
  <item>Carol</item>
</result>
```

### Function using string-join

**Stylesheet (join a sequence with a custom delimiter):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:util="http://example.com/util"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  exclude-result-prefixes="util xs">

  <xsl:function name="util:join-tags" as="xs:string">
    <xsl:param name="items" as="xs:string*"/>
    <xsl:sequence select="string-join($items, ' | ')"/>
  </xsl:function>

  <xsl:template match="/article">
    <xsl:output method="text"/>
    <xsl:value-of select="util:join-tags(tags/tag/string())"/>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- Function names must use a non-empty namespace prefix. `xsl:function name="myFunc"` is invalid.
- Recursive calls are supported and commonly used for tree-walking functions.
- XSLT 3.0 introduces higher-order functions — `xsl:function` can be referenced as a value with `function-lookup()` or passed as an argument.
- Type annotations (`as` on `xsl:param` and `xsl:function`) improve both performance and early error detection in Saxon.

## See also

- [string-join()](../xpath-string-join)
