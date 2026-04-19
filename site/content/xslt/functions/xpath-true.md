---
title: "true()"
description: "Returns the boolean value true. Used in XPath expressions and xsl:if tests where an unconditional true value is needed."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "boolean function"
syntax: "true()"
tags: ["xslt", "reference", "xpath", "xslt1"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjEuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvaXRlbXMiPgogICAgPHJlc3VsdD4KICAgICAgPHhzbDpmb3ItZWFjaCBzZWxlY3Q9Iml0ZW0iPgogICAgICAgIDx4c2w6Y2hvb3NlPgogICAgICAgICAgPHhzbDp3aGVuIHRlc3Q9IkB0eXBlID0gJ0EnIj4KICAgICAgICAgICAgPHByaW1hcnk-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9Ii4iLz48L3ByaW1hcnk-CiAgICAgICAgICA8L3hzbDp3aGVuPgogICAgICAgICAgPHhzbDp3aGVuIHRlc3Q9IkB0eXBlID0gJ0InIj4KICAgICAgICAgICAgPHNlY29uZGFyeT48eHNsOnZhbHVlLW9mIHNlbGVjdD0iLiIvPjwvc2Vjb25kYXJ5PgogICAgICAgICAgPC94c2w6d2hlbj4KICAgICAgICAgIDx4c2w6d2hlbiB0ZXN0PSJ0cnVlKCkiPgogICAgICAgICAgICA8b3RoZXI-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9Ii4iLz48L290aGVyPgogICAgICAgICAgPC94c2w6d2hlbj4KICAgICAgICA8L3hzbDpjaG9vc2U-CiAgICAgIDwveHNsOmZvci1lYWNoPgogICAgPC9yZXN1bHQ-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGl0ZW1zPgogIDxpdGVtIHR5cGU9IkEiPkFscGhhPC9pdGVtPgogIDxpdGVtIHR5cGU9IkIiPkJldGE8L2l0ZW0-CiAgPGl0ZW0gdHlwZT0iQyI-R2FtbWE8L2l0ZW0-CjwvaXRlbXM-&version=1.0"
---

## Description

`true()` returns the boolean literal `true`. It takes no arguments and exists because XPath 1.0 has no boolean literal syntax — unlike languages such as Java or Python, you cannot write the bare word `true` in an XPath expression and expect it to be interpreted as a boolean.

The most common use is comparing attribute values that represent boolean flags (e.g. `@enabled = 'true'`), or setting a default condition in `xsl:when` using `<xsl:when test="true()">` as a fallback branch that is always matched.

`true()` is also useful when passing a boolean parameter to a template or evaluating a condition in a variable: `<xsl:variable name="always" select="true()"/>`.

## Parameters

This function takes no parameters.

## Return value

`xs:boolean` — always returns `true`.

## Examples

### Use true() as a catch-all xsl:when branch

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<items>
  <item type="A">Alpha</item>
  <item type="B">Beta</item>
  <item type="C">Gamma</item>
</items>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/items">
    <result>
      <xsl:for-each select="item">
        <xsl:choose>
          <xsl:when test="@type = 'A'">
            <primary><xsl:value-of select="."/></primary>
          </xsl:when>
          <xsl:when test="@type = 'B'">
            <secondary><xsl:value-of select="."/></secondary>
          </xsl:when>
          <xsl:when test="true()">
            <other><xsl:value-of select="."/></other>
          </xsl:when>
        </xsl:choose>
      </xsl:for-each>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <primary>Alpha</primary>
  <secondary>Beta</secondary>
  <other>Gamma</other>
</result>
```

### Assign a boolean variable

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<report>
  <title>Sales Q1</title>
</report>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:variable name="includeHeader" select="true()"/>

  <xsl:template match="/report">
    <output>
      <xsl:if test="$includeHeader">
        <header><xsl:value-of select="title"/></header>
      </xsl:if>
      <body>Report body here.</body>
    </output>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<output>
  <header>Sales Q1</header>
  <body>Report body here.</body>
</output>
```

## Notes

- XPath 1.0 has no bare boolean literals. You must use `true()` and `false()` as function calls.
- Using `<xsl:when test="true()">` is a valid (though verbose) alternative to `<xsl:otherwise>`. Prefer `<xsl:otherwise>` for readability in most cases.
- Comparing a string attribute like `@flag = 'true'` performs string comparison, not a boolean conversion. If you need the attribute value interpreted as boolean, use `boolean(@flag = 'true')` explicitly.
- In XSLT 2.0+ you can use `xs:boolean('true')` for schema-aware processing, but `true()` remains valid.

## See also

- [false()](../xpath-false)
- [boolean()](../xpath-boolean)
- [not()](../xpath-not)
