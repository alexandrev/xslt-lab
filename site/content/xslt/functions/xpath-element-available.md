---
title: "element-available()"
description: "Returns true if the named XSLT instruction or extension element is supported by the processor, enabling portable fallback branches."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "node function"
syntax: "element-available(name)"
tags: ["xslt", "reference", "xpath", "xslt1"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjEuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvZGF0YSI-CiAgICA8aW5mbz4KICAgICAgPGZvci1lYWNoLWF2YWlsYWJsZT4KICAgICAgICA8eHNsOnZhbHVlLW9mIHNlbGVjdD0iZWxlbWVudC1hdmFpbGFibGUoJ3hzbDpmb3ItZWFjaCcpIi8-CiAgICAgIDwvZm9yLWVhY2gtYXZhaWxhYmxlPgogICAgICA8bm9uZXhpc3RlbnQtYXZhaWxhYmxlPgogICAgICAgIDx4c2w6dmFsdWUtb2Ygc2VsZWN0PSJlbGVtZW50LWF2YWlsYWJsZSgneHNsOm5vbmV4aXN0ZW50JykiLz4KICAgICAgPC9ub25leGlzdGVudC1hdmFpbGFibGU-CiAgICA8L2luZm8-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGRhdGE-PGl0ZW0-QTwvaXRlbT48aXRlbT5CPC9pdGVtPjwvZGF0YT4&version=1.0"
---

## Description

`element-available()` tests whether the XSLT processor supports a named instruction element and returns a boolean. The argument is a string containing a QName; if the QName is in the `xsl:` namespace, it tests for a standard XSLT instruction. If it is in another namespace, it tests for a processor-specific extension element.

The function is intended for use inside `xsl:choose`/`xsl:when` or `xsl:if` to branch between implementations depending on what the current processor supports. Combined with `xsl:fallback`, it provides a portable way to use extension elements with graceful degradation.

Only elements that appear as **children of the stylesheet** (i.e. XSLT instructions and extension elements, not result elements) are tested. Testing for an arbitrary user-defined element name that is not an instruction always returns `false`.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | xs:string | Yes | A QName string naming the element to test. The namespace prefix must be in scope. |

## Return value

`xs:boolean` — `true` if the element is available, `false` otherwise.

## Examples

### Test for a standard XSLT instruction

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<data><item>A</item><item>B</item></data>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/data">
    <info>
      <for-each-available>
        <xsl:value-of select="element-available('xsl:for-each')"/>
      </for-each-available>
      <nonexistent-available>
        <xsl:value-of select="element-available('xsl:nonexistent')"/>
      </nonexistent-available>
    </info>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<info>
  <for-each-available>true</for-each-available>
  <nonexistent-available>false</nonexistent-available>
</info>
```

### Guard use of an extension element

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:ext="http://exslt.org/common"
  extension-element-prefixes="ext">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/data">
    <result>
      <xsl:choose>
        <xsl:when test="element-available('ext:document')">
          <!-- Use EXSLT extension to write multiple output files -->
          <message>Multi-document output supported.</message>
        </xsl:when>
        <xsl:otherwise>
          <message>Multi-document output not supported; writing single file.</message>
        </xsl:otherwise>
      </xsl:choose>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- `element-available()` only tests **XSLT instructions** and **extension elements**. It does not test for result element names (elements in no namespace or a non-XSLT namespace that become part of the output tree).
- The prefix in the QName string must be declared in the stylesheet's namespace context; otherwise the function raises an error.
- Standard XSLT 1.0 instructions (e.g. `xsl:for-each`, `xsl:if`, `xsl:choose`) always return `true` in a conformant XSLT 1.0 processor.
- In XSLT 2.0+, the function is unchanged. It can be used to test for XSLT 2.0 instructions (e.g. `xsl:for-each-group`) when running under a processor that may be in XSLT 1.0 compatibility mode.

## See also

- [function-available()](../xpath-function-available)
- [system-property()](../xpath-system-property)
- [xsl:fallback](../xsl-fallback)
