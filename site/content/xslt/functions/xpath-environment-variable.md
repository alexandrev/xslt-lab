---
title: "environment-variable()"
description: "Returns the value of the named environment variable as a string, or the empty sequence if unavailable."
date: 2026-04-19T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "node function"
syntax: "environment-variable(name)"
tags: ["xslt", "reference", "xpath", "xslt3"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSI-CiAgPHhzbDpvdXRwdXQgbWV0aG9kPSJ4bWwiIGluZGVudD0ieWVzIi8-CgogIDx4c2w6dGVtcGxhdGUgbWF0Y2g9Ii9jb25maWciPgogICAgPHhzbDp2YXJpYWJsZSBuYW1lPSJob21lIiBzZWxlY3Q9ImVudmlyb25tZW50LXZhcmlhYmxlKCdIT01FJykiLz4KICAgIDxzZXR0aW5ncz4KICAgICAgPGhvbWU-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9IigkaG9tZSwgJ3Vua25vd24nKVsxXSIvPjwvaG9tZT4KICAgICAgPHVzZXI-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9IihlbnZpcm9ubWVudC12YXJpYWJsZSgnVVNFUicpLCAnYW5vbnltb3VzJylbMV0iLz48L3VzZXI-CiAgICA8L3NldHRpbmdzPgogIDwveHNsOnRlbXBsYXRlPgo8L3hzbDpzdHlsZXNoZWV0Pg&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGNvbmZpZy8-&version=3.0"
---

## Description

`environment-variable()` retrieves the value of a named operating-system or processor-defined environment variable. The function returns the value as a string if the variable is set and accessible, or the empty sequence if it is not available.

Processors are not required to expose any particular environment variables, and they may choose to expose none at all for security reasons. Use `available-environment-variables()` to discover which variables are accessible before calling this function. The function raises no error when a variable is absent — it simply returns the empty sequence, which can be tested with `exists()` or `empty()`.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | xs:string | Yes | The name of the environment variable to retrieve. |

## Return value

`xs:string?` — the value of the environment variable, or the empty sequence if the variable is not set or not accessible.

## Examples

### Using an environment variable as a default

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<config/>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/config">
    <xsl:variable name="home" select="environment-variable('HOME')"/>
    <settings>
      <home><xsl:value-of select="($home, 'unknown')[1]"/></home>
      <user><xsl:value-of select="(environment-variable('USER'), 'anonymous')[1]"/></user>
    </settings>
  </xsl:template>
</xsl:stylesheet>
```

**Output (on a Unix system):**
```xml
<settings>
  <home>/home/username</home>
  <user>username</user>
</settings>
```

### Checking availability before reading

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>

  <xsl:template match="/">
    <xsl:choose>
      <xsl:when test="exists(environment-variable('APP_ENV'))">
        Environment: <xsl:value-of select="environment-variable('APP_ENV')"/>
      </xsl:when>
      <xsl:otherwise>
        APP_ENV not set — using defaults
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```
APP_ENV not set — using defaults
```

## Notes

- Whether environment variables are accessible depends entirely on the processor implementation and security configuration. Saxon exposes OS environment variables by default, but this can be disabled.
- The function is read-only; there is no mechanism in XPath/XSLT to set environment variables.
- Environment variable names are case-sensitive on Unix-like systems and case-insensitive on Windows.
- For production stylesheets, prefer XSLT parameters (`xsl:param`) over environment variables, as parameters are more portable and explicit.

## See also

- [available-environment-variables()](../xpath-available-environment-variables)
