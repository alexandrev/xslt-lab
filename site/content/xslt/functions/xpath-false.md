---
title: "false()"
description: "Returns the boolean value false. Used in XPath expressions where an explicit boolean false literal is required."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "boolean function"
syntax: "false()"
tags: ["xslt", "reference", "xpath", "xslt1"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjEuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnZhcmlhYmxlIG5hbWU9ImRlYnVnTW9kZSIgc2VsZWN0PSJmYWxzZSgpIi8-CgogIDx4c2w6dGVtcGxhdGUgbWF0Y2g9Ii9yZXBvcnQiPgogICAgPG91dHB1dD4KICAgICAgPHhzbDppZiB0ZXN0PSIkZGVidWdNb2RlIj4KICAgICAgICA8ZGVidWc-RGVidWcgb3V0cHV0IGhlcmU8L2RlYnVnPgogICAgICA8L3hzbDppZj4KICAgICAgPHRpdGxlPjx4c2w6dmFsdWUtb2Ygc2VsZWN0PSJ0aXRsZSIvPjwvdGl0bGU-CiAgICAgIDx4c2w6Zm9yLWVhY2ggc2VsZWN0PSJzZWN0aW9uIj4KICAgICAgICA8c2VjdGlvbj48eHNsOnZhbHVlLW9mIHNlbGVjdD0iLiIvPjwvc2VjdGlvbj4KICAgICAgPC94c2w6Zm9yLWVhY2g-CiAgICA8L291dHB1dD4KICA8L3hzbDp0ZW1wbGF0ZT4KPC94c2w6c3R5bGVzaGVldD4&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHJlcG9ydD4KICA8dGl0bGU-QW5udWFsIFJlcG9ydDwvdGl0bGU-CiAgPHNlY3Rpb24-SW50cm9kdWN0aW9uPC9zZWN0aW9uPgo8L3JlcG9ydD4&version=1.0"
---

## Description

`false()` returns the boolean literal `false`. Like `true()`, it exists because XPath 1.0 has no bare boolean keyword syntax — the word `false` alone in an expression would be interpreted as an element name or QName, not as a boolean constant.

Practical uses include: initialising boolean variables to a known `false` state, writing conditions that are intentionally disabled during development, and comparing the result of boolean expressions against a known `false` value.

In most production stylesheets, `false()` appears less often than `true()` because conditions in `xsl:if` and predicates are already negated with `not()`, but it is occasionally needed in parameter defaults or variable declarations.

## Parameters

This function takes no parameters.

## Return value

`xs:boolean` — always returns `false`.

## Examples

### Disable a branch during development

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<report>
  <title>Annual Report</title>
  <section>Introduction</section>
</report>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:variable name="debugMode" select="false()"/>

  <xsl:template match="/report">
    <output>
      <xsl:if test="$debugMode">
        <debug>Debug output here</debug>
      </xsl:if>
      <title><xsl:value-of select="title"/></title>
      <xsl:for-each select="section">
        <section><xsl:value-of select="."/></section>
      </xsl:for-each>
    </output>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<output>
  <title>Annual Report</title>
  <section>Introduction</section>
</output>
```

### Compare the result of a boolean expression

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<settings>
  <feature name="export" enabled="no"/>
  <feature name="import" enabled="yes"/>
</settings>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/settings">
    <status>
      <xsl:for-each select="feature">
        <xsl:variable name="active" select="@enabled = 'yes'"/>
        <feature name="{@name}" active="{$active}">
          <xsl:if test="$active = false()">
            <note>This feature is off.</note>
          </xsl:if>
        </feature>
      </xsl:for-each>
    </status>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<status>
  <feature name="export" active="false">
    <note>This feature is off.</note>
  </feature>
  <feature name="import" active="true"/>
</status>
```

## Notes

- XPath 1.0 has no bare boolean literals; `false()` and `true()` are the canonical way to represent boolean constants.
- `$var = false()` is equivalent to `not($var)` when `$var` holds a boolean, but the intent can be clearer with the explicit comparison.
- When outputting `false()` via `xsl:value-of`, the result is the string `"false"`, not the empty string.
- In XSLT 2.0+ the function is unchanged; it remains a zero-argument function returning `xs:boolean`.

## See also

- [true()](../xpath-true)
- [boolean()](../xpath-boolean)
- [not()](../xpath-not)
