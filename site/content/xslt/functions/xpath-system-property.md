---
title: "system-property()"
description: "Returns the value of a named XSLT system property such as the XSLT version, vendor name, or vendor URL."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "node function"
syntax: "system-property(name)"
tags: ["xslt", "reference", "xpath", "xslt1"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjEuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvZG9jIj4KICAgIDxwcm9jZXNzb3ItaW5mbz4KICAgICAgPHZlcnNpb24-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9InN5c3RlbS1wcm9wZXJ0eSgneHNsOnZlcnNpb24nKSIvPjwvdmVyc2lvbj4KICAgICAgPHZlbmRvcj48eHNsOnZhbHVlLW9mIHNlbGVjdD0ic3lzdGVtLXByb3BlcnR5KCd4c2w6dmVuZG9yJykiLz48L3ZlbmRvcj4KICAgICAgPHZlbmRvci11cmw-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9InN5c3RlbS1wcm9wZXJ0eSgneHNsOnZlbmRvci11cmwnKSIvPjwvdmVuZG9yLXVybD4KICAgIDwvcHJvY2Vzc29yLWluZm8-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGRvYz48dGl0bGU-U3lzdGVtIEluZm88L3RpdGxlPjwvZG9jPg&version=1.0"
---

## Description

`system-property()` returns the value of a named system property from the XSLT processor. The argument is a QName that identifies the property. Properties in the `xsl:` namespace are defined by the XSLT specification; processor vendors may expose additional properties in their own namespaces.

The three standard XSLT 1.0 properties are:

| Property name | Type | Description |
|---|---|---|
| `xsl:version` | number | The XSLT version supported by the processor (e.g. `1` or `2`). |
| `xsl:vendor` | string | A string identifying the XSLT processor vendor. |
| `xsl:vendor-url` | string | A URL with more information about the vendor or processor. |

If an unknown property name is passed, `system-property()` returns an empty string.

The function is most commonly used for version detection: testing whether the processor supports XSLT 2.0 so that the stylesheet can adapt its behaviour accordingly.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | xs:QName | Yes | The name of the system property to retrieve. |

## Return value

`xs:string` or `xs:number` — the property value, or `""` for unknown properties.

## Examples

### Display processor information

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<doc><title>System Info</title></doc>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/doc">
    <processor-info>
      <version><xsl:value-of select="system-property('xsl:version')"/></version>
      <vendor><xsl:value-of select="system-property('xsl:vendor')"/></vendor>
      <vendor-url><xsl:value-of select="system-property('xsl:vendor-url')"/></vendor-url>
    </processor-info>
  </xsl:template>
</xsl:stylesheet>
```

**Output (Saxon example):**
```xml
<processor-info>
  <version>2</version>
  <vendor>Saxonica</vendor>
  <vendor-url>http://www.saxonica.com/</vendor-url>
</processor-info>
```

### Adapt behaviour based on XSLT version

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<data><value>3.14159</value></data>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/data">
    <result>
      <xsl:choose>
        <xsl:when test="system-property('xsl:version') &gt;= 2">
          <!-- XSLT 2.0+ features available -->
          <formatted><xsl:value-of select="format-number(value, '0.00')"/></formatted>
        </xsl:when>
        <xsl:otherwise>
          <!-- XSLT 1.0 fallback -->
          <formatted><xsl:value-of select="value"/></formatted>
        </xsl:otherwise>
      </xsl:choose>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <formatted>3.14</formatted>
</result>
```

## Notes

- `system-property('xsl:version')` returns a number, not a string. Use numeric comparison (`>= 2`) rather than string comparison (`= '2'`).
- For unknown property names, the return value is `""` (empty string), not an error.
- Vendor-specific properties must be referenced using a namespace prefix that maps to the vendor's extension namespace.
- In XSLT 2.0+, the same function is available with the same three standard properties. Processors may report `xsl:version` as `2` or higher. The XSLT 3.0 specification also defines this function identically.

## See also

- [element-available()](../xpath-element-available)
- [function-available()](../xpath-function-available)
