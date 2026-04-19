---
title: "minutes-from-time()"
description: "Extracts the minutes component from an xs:time value as an xs:integer in the range 0–59."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "date function"
syntax: "minutes-from-time(time)"
tags: ["xslt", "reference", "xpath", "xslt2"]
---

## Description

`minutes-from-time()` returns the minutes component of an `xs:time` value as an `xs:integer` between 0 and 59. If the argument is the empty sequence, the empty sequence is returned.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `time` | xs:time? | Yes | The time value from which to extract the minutes. |

## Return value

`xs:integer?` — integer from 0 to 59, or the empty sequence if the argument is the empty sequence.

## Examples

### Format a time with zero-padded minutes

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<log>
  <entry time="08:05:00">System started</entry>
  <entry time="12:30:00">Lunch break</entry>
  <entry time="17:45:00">Shutdown</entry>
</log>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/log">
    <log>
      <xsl:for-each select="entry">
        <xsl:variable name="t" select="xs:time(@time)"/>
        <entry formatted="{hours-from-time($t)}h{format-number(minutes-from-time($t), '00')}">
          <xsl:value-of select="."/>
        </entry>
      </xsl:for-each>
    </log>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<log>
  <entry formatted="8h05">System started</entry>
  <entry formatted="12h30">Lunch break</entry>
  <entry formatted="17h45">Shutdown</entry>
</log>
```

### Check if an appointment is on the hour

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/schedule">
    <on-the-hour>
      <xsl:copy-of select="appointment[minutes-from-time(xs:time(@time)) = 0]"/>
    </on-the-hour>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- The argument must be typed as `xs:time`. Cast string values with `xs:time(@attr)`.
- Returns 0–59; does not include fractional minutes (those appear in the seconds component).
- For `xs:dateTime` values, use `minutes-from-dateTime()`.

## See also

- [hours-from-time()](../xpath-hours-from-time)
- [seconds-from-time()](../xpath-seconds-from-time)
- [current-time()](../xpath-current-time)
