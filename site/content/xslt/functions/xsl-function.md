---
title: "xsl:function"
description: "Defines a named, callable stylesheet function available in XPath expressions throughout the stylesheet."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "element"
syntax: '<xsl:function name="prefix:name" as="return-type">'
tags: ["xslt", "reference", "xslt2", "xpath"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczpmbj0iaHR0cDovL2V4YW1wbGUuY29tL2Z1bmN0aW9ucyIKICB4bWxuczp4cz0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiCiAgZXhjbHVkZS1yZXN1bHQtcHJlZml4ZXM9ImZuIHhzIj4KCiAgPCEtLSBDdXN0b20gZnVuY3Rpb246IGNhcGl0YWxpc2UgdGhlIGZpcnN0IGxldHRlciBvZiBhIHN0cmluZyAtLT4KICA8eHNsOmZ1bmN0aW9uIG5hbWU9ImZuOmNhcGl0YWxpemUiIGFzPSJ4czpzdHJpbmciPgogICAgPHhzbDpwYXJhbSBuYW1lPSJpbnB1dCIgYXM9InhzOnN0cmluZyIvPgogICAgPHhzbDpzZXF1ZW5jZSBzZWxlY3Q9ImNvbmNhdCh1cHBlci1jYXNlKHN1YnN0cmluZygkaW5wdXQsIDEsIDEpKSwgc3Vic3RyaW5nKCRpbnB1dCwgMikpIi8-CiAgPC94c2w6ZnVuY3Rpb24-CgogIDx4c2w6dGVtcGxhdGUgbWF0Y2g9Ii9uYW1lcyI-CiAgICA8eHNsOm91dHB1dCBtZXRob2Q9InhtbCIgaW5kZW50PSJ5ZXMiLz4KICAgIDxyZXN1bHQ-CiAgICAgIDx4c2w6Zm9yLWVhY2ggc2VsZWN0PSJuYW1lIj4KICAgICAgICA8aXRlbT48eHNsOnZhbHVlLW9mIHNlbGVjdD0iZm46Y2FwaXRhbGl6ZSguKSIvPjwvaXRlbT4KICAgICAgPC94c2w6Zm9yLWVhY2g-CiAgICA8L3Jlc3VsdD4KICA8L3hzbDp0ZW1wbGF0ZT4KPC94c2w6c3R5bGVzaGVldD4&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPG5hbWVzPgogIDxuYW1lPmFsaWNlPC9uYW1lPgogIDxuYW1lPmJvYjwvbmFtZT4KICA8bmFtZT5jYXJvbDwvbmFtZT4KPC9uYW1lcz4&version=2.0"
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
