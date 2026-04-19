---
title: "not()"
description: "Returns true if its boolean argument is false, and false if it is true — the logical negation of a boolean expression."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "boolean function"
syntax: "not(boolean)"
tags: ["xslt", "reference", "xpath", "xslt1"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjEuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvcHJvZHVjdHMiPgogICAgPHByaWNlZD4KICAgICAgPHhzbDpmb3ItZWFjaCBzZWxlY3Q9InByb2R1Y3Rbbm90KEBwcmljZSldIj4KICAgICAgICA8bWlzc2luZyBpZD0ie0BpZH0iPjx4c2w6dmFsdWUtb2Ygc2VsZWN0PSJAbmFtZSIvPjwvbWlzc2luZz4KICAgICAgPC94c2w6Zm9yLWVhY2g-CiAgICA8L3ByaWNlZD4KICA8L3hzbDp0ZW1wbGF0ZT4KPC94c2w6c3R5bGVzaGVldD4&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHByb2R1Y3RzPgogIDxwcm9kdWN0IGlkPSIxIiBuYW1lPSJXaWRnZXQiIHByaWNlPSI5Ljk5Ii8-CiAgPHByb2R1Y3QgaWQ9IjIiIG5hbWU9IkdhZGdldCIvPgogIDxwcm9kdWN0IGlkPSIzIiBuYW1lPSJEb29oaWNrZXkiIHByaWNlPSI0LjQ5Ii8-CjwvcHJvZHVjdHM-&version=1.0"
---

## Description

`not()` returns the logical negation of its argument. The argument is first converted to a boolean using the same rules as `boolean()`, and the result is the opposite value.

It is one of the most frequently used functions in XPath predicates and `xsl:if` conditions, allowing you to express "if this node does not exist", "if this string is empty", or "if this condition does not hold".

Because `not()` accepts any type and coerces it to boolean, you can negate node-set tests, string emptiness checks, and numeric comparisons in a single, readable expression.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `boolean` | any | Yes | The value to negate. Converted to boolean before negation. |

## Return value

`xs:boolean` — `true` if the argument converts to `false`, `false` if it converts to `true`.

## Examples

### Skip elements without a required attribute

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<products>
  <product id="1" name="Widget" price="9.99"/>
  <product id="2" name="Gadget"/>
  <product id="3" name="Doohickey" price="4.49"/>
</products>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/products">
    <priced>
      <xsl:for-each select="product[not(@price)]">
        <missing id="{@id}"><xsl:value-of select="@name"/></missing>
      </xsl:for-each>
    </priced>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<priced>
  <missing id="2">Gadget</missing>
</priced>
```

### Conditional output based on element absence

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<order>
  <item>Book</item>
  <item>Pen</item>
</order>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/order">
    <result>
      <xsl:if test="not(discount)">
        <message>No discount applied.</message>
      </xsl:if>
      <xsl:for-each select="item">
        <line><xsl:value-of select="."/></line>
      </xsl:for-each>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <message>No discount applied.</message>
  <line>Book</line>
  <line>Pen</line>
</result>
```

## Notes

- `not(condition)` is equivalent to writing `condition = false()` but is more idiomatic and concise.
- To negate a compound condition, combine `not()` with `and`/`or`: `not(a or b)` means neither `a` nor `b` is true.
- `not()` cannot be used as a shorthand for inequality (`!=`). Use `@attr != 'value'` rather than `not(@attr = 'value')` when comparing against multiple nodes, because the semantics differ for node-sets with more than one node.
- In XSLT 2.0+ the function works identically; the argument may also be an empty sequence (which converts to `false`, so `not(())` returns `true`).

## See also

- [boolean()](../xpath-boolean)
- [true()](../xpath-true)
- [false()](../xpath-false)
