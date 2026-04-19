---
title: "function-name()"
description: "Returns the QName of a named function item, or the empty sequence if the function is anonymous."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "higher-order function"
syntax: "function-name(function)"
tags: ["xslt", "reference", "xpath", "xslt3"]
---

## Description

`function-name()` inspects a function item and returns its QName if the function has a name. For anonymous inline functions (created with `function(...)` expressions), it returns the empty sequence. This is useful for logging, debugging, and dynamic function inspection.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `function` | function(*) | Yes | The function item to inspect. |

## Return value

`xs:QName?` — the QName of the function, or the empty sequence for anonymous functions.

## Examples

### Inspecting named and anonymous functions

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:f="http://example.com/fn">

  <xsl:output method="xml" indent="yes"/>

  <xsl:function name="f:double" as="xs:integer">
    <xsl:param name="x" as="xs:integer"/>
    <xsl:sequence select="$x * 2"/>
  </xsl:function>

  <xsl:template match="/">
    <result>
      <named>
        <xsl:value-of select="function-name(f:double#1)"/>
      </named>
      <anonymous>
        <xsl:variable name="fn" select="function($x) { $x * 2 }"/>
        <xsl:value-of select="(function-name($fn), 'anonymous')[1]"/>
      </anonymous>
      <builtin>
        <xsl:value-of select="function-name(upper-case#1)"/>
      </builtin>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <named>f:double</named>
  <anonymous>anonymous</anonymous>
  <builtin>fn:upper-case</builtin>
</result>
```

### Logging function calls in a dispatch table

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="fns" select="(upper-case#1, lower-case#1, normalize-space#1)"/>
    <log>
      <xsl:for-each select="$fns">
        <entry>
          <name><xsl:value-of select="function-name(.)"/></name>
          <arity><xsl:value-of select="function-arity(.)"/></arity>
        </entry>
      </xsl:for-each>
    </log>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<log>
  <entry><name>fn:upper-case</name><arity>1</arity></entry>
  <entry><name>fn:lower-case</name><arity>1</arity></entry>
  <entry><name>fn:normalize-space</name><arity>1</arity></entry>
</log>
```

## Notes

- Anonymous functions created with inline `function(...)` syntax return the empty sequence.
- For built-in functions, the local name is the function name without the `fn:` prefix, but `function-name()` returns the fully expanded QName.
- Use `local-name-from-QName()` and `namespace-uri-from-QName()` to decompose the returned QName.

## See also

- [function-arity()](../xpath-function-arity)
- [function-lookup()](../xpath-function-lookup)
- [apply()](../xpath-apply)
