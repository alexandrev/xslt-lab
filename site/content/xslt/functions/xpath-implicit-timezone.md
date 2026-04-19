---
title: "implicit-timezone()"
description: "Returns the processor's implicit timezone as an xs:dayTimeDuration, used when date/time values have no explicit timezone."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "date function"
syntax: "implicit-timezone()"
tags: ["xslt", "reference", "xpath", "xslt2"]
---

## Description

`implicit-timezone()` returns the implicit timezone of the XPath evaluation context as an `xs:dayTimeDuration`. This is the timezone assumed when comparing or formatting date/time values that do not carry an explicit timezone component.

The value is processor-defined but typically reflects the system's local timezone. It is expressed as a positive or negative duration relative to UTC (e.g., `PT1H` for UTC+1, `-PT5H` for UTC-5).

## Parameters

This function takes no parameters.

## Return value

`xs:dayTimeDuration` — the implicit timezone offset from UTC. The value is always a whole number of minutes.

## Examples

### Display the implicit timezone

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <context>
      <implicit-timezone><xsl:value-of select="implicit-timezone()"/></implicit-timezone>
    </context>
  </xsl:template>
</xsl:stylesheet>
```

**Output (example for UTC+1):**
```xml
<context>
  <implicit-timezone>PT1H</implicit-timezone>
</context>
```

### Normalize a timezone-free date to UTC

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/events">
    <events>
      <xsl:for-each select="event">
        <!-- adjust-dateTime-to-timezone moves the value to UTC (xs:dayTimeDuration('PT0S')) -->
        <event utc="{adjust-dateTime-to-timezone(xs:dateTime(@timestamp), xs:dayTimeDuration('PT0S'))}">
          <xsl:value-of select="."/>
        </event>
      </xsl:for-each>
    </events>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- `implicit-timezone()` is used internally by the processor when comparing date/time values that lack explicit timezone information.
- To retrieve the current date/time with the implicit timezone already applied, use `current-date()`, `current-time()`, or `current-dateTime()`.
- To convert values to a specific timezone, use the `adjust-date-to-timezone()`, `adjust-time-to-timezone()`, or `adjust-dateTime-to-timezone()` functions.
- The implicit timezone can be set programmatically in Saxon via the `Configuration` API, but is typically the JVM's default timezone.

## See also

- [current-date()](../xpath-current-date)
- [current-time()](../xpath-current-time)
- [current-dateTime()](../xpath-current-date-time)
