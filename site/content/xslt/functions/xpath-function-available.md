---
title: "function-available()"
description: "Returns true if the named function is available in the current XSLT processor, supporting portable use of extension functions."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "node function"
syntax: "function-available(name)"
tags: ["xslt", "reference", "xpath", "xslt1"]
---

## Description

`function-available()` tests whether the named function can be called in the current transformation context and returns a boolean. This includes core XPath functions, XSLT-specific functions (such as `document()`, `key()`, and `format-number()`), and any extension functions provided by the processor or bound via namespace declarations.

The argument is a string containing the QName of the function. If the QName is in no namespace or the `fn:` namespace, built-in XPath/XSLT functions are tested. If it is in another namespace, vendor or EXSLT extension functions are tested.

`function-available()` allows stylesheets to be written once and run on multiple processors, branching between native and extension implementations as needed. It is commonly paired with `element-available()` for comprehensive capability detection.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | xs:string | Yes | A QName string naming the function to test. |

## Return value

`xs:boolean` — `true` if the function is available and callable, `false` otherwise.

## Examples

### Test for core and extension functions

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<doc><value>3.14</value></doc>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:math="http://exslt.org/math">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/doc">
    <capabilities>
      <concat-available>
        <xsl:value-of select="function-available('concat')"/>
      </concat-available>
      <math-sqrt-available>
        <xsl:value-of select="function-available('math:sqrt')"/>
      </math-sqrt-available>
      <nonexistent>
        <xsl:value-of select="function-available('nonexistent-func')"/>
      </nonexistent>
    </capabilities>
  </xsl:template>
</xsl:stylesheet>
```

**Output (Saxon with EXSLT):**
```xml
<capabilities>
  <concat-available>true</concat-available>
  <math-sqrt-available>true</math-sqrt-available>
  <nonexistent>false</nonexistent>
</capabilities>
```

### Conditional use of an EXSLT function

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<items>
  <item>3</item>
  <item>1</item>
  <item>2</item>
</items>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:exsl="http://exslt.org/common">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/items">
    <result>
      <xsl:choose>
        <xsl:when test="function-available('exsl:node-set')">
          <method>exsl:node-set available</method>
        </xsl:when>
        <xsl:otherwise>
          <method>Fallback: no node-set conversion</method>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:for-each select="item">
        <value><xsl:value-of select="."/></value>
      </xsl:for-each>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- `function-available()` tests callable functions only — it does not test XSLT instruction elements. Use `element-available()` for that.
- The prefix in the QName string must be declared in the stylesheet for namespace-qualified function names; otherwise an error is raised.
- All standard XPath 1.0 core functions (`string()`, `number()`, `concat()`, etc.) always return `true` in a conformant processor.
- In XSLT 2.0+, `function-available()` remains available. It can optionally take a second argument specifying the arity (number of arguments) of the function to test.

## See also

- [element-available()](../xpath-element-available)
- [system-property()](../xpath-system-property)
