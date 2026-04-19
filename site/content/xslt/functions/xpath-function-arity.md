---
title: "function-arity()"
description: "Returns the number of arguments (arity) that a function item accepts."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "higher-order function"
syntax: "function-arity(function)"
tags: ["xslt", "reference", "xpath", "xslt3"]
---

## Description

`function-arity()` returns the arity — the number of parameters — of a function item. This is useful when working with higher-order functions to validate that a function accepts the expected number of arguments before calling it, or when building generic utilities that inspect function items.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `function` | function(*) | Yes | The function item whose arity is to be returned. |

## Return value

`xs:integer` — the number of parameters the function accepts.

## Examples

### Checking arity before apply()

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <result>
      <xsl:variable name="fn" select="upper-case#1"/>
      <arity><xsl:value-of select="function-arity($fn)"/></arity>
      <xsl:if test="function-arity($fn) = 1">
        <output><xsl:value-of select="apply($fn, ['hello'])"/></output>
      </xsl:if>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <arity>1</arity>
  <output>HELLO</output>
</result>
```

### Introspecting a list of functions

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="fns" select="(
      upper-case#1,
      substring#2,
      substring#3,
      function($a, $b) { $a + $b }
    )"/>
    <functions>
      <xsl:for-each select="$fns">
        <fn>
          <name><xsl:value-of select="(function-name(.), 'anonymous')[1]"/></name>
          <arity><xsl:value-of select="function-arity(.)"/></arity>
        </fn>
      </xsl:for-each>
    </functions>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<functions>
  <fn><name>fn:upper-case</name><arity>1</arity></fn>
  <fn><name>fn:substring</name><arity>2</arity></fn>
  <fn><name>fn:substring</name><arity>3</arity></fn>
  <fn><name>anonymous</name><arity>2</arity></fn>
</functions>
```

## Notes

- Partial function application (e.g., `substring(?, 1, 3)`) reduces the arity by the number of bound arguments.
- `function-arity()` never returns the empty sequence; it always returns a non-negative integer.
- A zero-arity function (`function() { ... }`) returns `0`.

## See also

- [function-name()](../xpath-function-name)
- [function-lookup()](../xpath-function-lookup)
- [apply()](../xpath-apply)
