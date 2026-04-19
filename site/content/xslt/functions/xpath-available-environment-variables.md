---
title: "available-environment-variables()"
description: "Returns a sequence of strings naming the environment variables that are available to the processor."
date: 2026-04-19T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "node function"
syntax: "available-environment-variables()"
tags: ["xslt", "reference", "xpath", "xslt3"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSI-CiAgPHhzbDpvdXRwdXQgbWV0aG9kPSJ4bWwiIGluZGVudD0ieWVzIi8-CgogIDx4c2w6dGVtcGxhdGUgbWF0Y2g9Ii8iPgogICAgPGVudi12YXJzPgogICAgICA8eHNsOmZvci1lYWNoIHNlbGVjdD0ic29ydChhdmFpbGFibGUtZW52aXJvbm1lbnQtdmFyaWFibGVzKCkpIj4KICAgICAgICA8dmFyIG5hbWU9InsufSIvPgogICAgICA8L3hzbDpmb3ItZWFjaD4KICAgIDwvZW52LXZhcnM-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHJvb3QvPg&version=3.0"
---

## Description

`available-environment-variables()` returns a sequence of strings, each being the name of an environment variable that the processor is willing to expose. The order of the returned sequence is implementation-defined. If the processor exposes no environment variables, the function returns the empty sequence.

This function is used as a companion to `environment-variable()`: first call `available-environment-variables()` to discover what is exposed, then call `environment-variable()` with a specific name to retrieve its value. This pattern avoids relying on the empty-sequence return from `environment-variable()` as the sole indicator of absence.

The set of available variables may differ between development and production environments. Processors may restrict exposure for security or sandboxing reasons.

## Parameters

This function takes no parameters.

## Return value

`xs:string*` — a sequence of environment variable names that the processor exposes, in implementation-defined order.

## Examples

### Listing available variables

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <env-vars>
      <xsl:for-each select="sort(available-environment-variables())">
        <var name="{.}"/>
      </xsl:for-each>
    </env-vars>
  </xsl:template>
</xsl:stylesheet>
```

**Output (varies by environment):**
```xml
<env-vars>
  <var name="HOME"/>
  <var name="PATH"/>
  <var name="USER"/>
</env-vars>
```

### Checking whether a specific variable is exposed

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>

  <xsl:template match="/">
    <xsl:choose>
      <xsl:when test="'APP_MODE' = available-environment-variables()">
        Mode: <xsl:value-of select="environment-variable('APP_MODE')"/>
      </xsl:when>
      <xsl:otherwise>APP_MODE not available</xsl:otherwise>
    </xsl:choose>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```
APP_MODE not available
```

## Notes

- The result of `available-environment-variables()` may be an empty sequence even when the OS has environment variables set, if the processor has disabled access.
- The function is particularly useful in test harnesses that need to adapt behavior based on the current environment without hard-coding variable names.
- `available-environment-variables()` is a pure function: it has no side effects and returns the same result for repeated calls within a single transformation.
- In Saxon, this function returns all OS-level environment variables by default. Use Saxon's `-feature` flag to restrict access if needed.

## See also

- [environment-variable()](../xpath-environment-variable)
