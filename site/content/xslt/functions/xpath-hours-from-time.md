---
title: "hours-from-time()"
description: "Extracts the hours component from an xs:time value as an xs:integer in the range 0–23."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "date function"
syntax: "hours-from-time(time)"
tags: ["xslt", "reference", "xpath", "xslt2"]
---

## Description

`hours-from-time()` returns the hours component of an `xs:time` value as an `xs:integer` between 0 and 23. If the argument is the empty sequence, the empty sequence is returned.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `time` | xs:time? | Yes | The time value from which to extract the hours. |

## Return value

`xs:integer?` — integer from 0 to 23, or the empty sequence if the argument is the empty sequence.

## Examples

### Classify times as morning, afternoon, or evening

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<schedule>
  <appointment time="09:30:00">Team standup</appointment>
  <appointment time="14:00:00">Client call</appointment>
  <appointment time="18:30:00">Dinner meeting</appointment>
</schedule>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/schedule">
    <schedule>
      <xsl:for-each select="appointment">
        <xsl:variable name="h" select="hours-from-time(xs:time(@time))"/>
        <appointment period="{if ($h lt 12) then 'morning' else if ($h lt 18) then 'afternoon' else 'evening'}">
          <xsl:value-of select="."/>
        </appointment>
      </xsl:for-each>
    </schedule>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<schedule>
  <appointment period="morning">Team standup</appointment>
  <appointment period="afternoon">Client call</appointment>
  <appointment period="evening">Dinner meeting</appointment>
</schedule>
```

### Extract hour from the current time

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>

  <xsl:template match="/">
    <xsl:value-of select="concat('Current hour: ', hours-from-time(current-time()))"/>
  </xsl:template>
</xsl:stylesheet>
```

**Output (example):**
```
Current hour: 14
```

## Notes

- The argument must be typed as `xs:time`. Cast string values with `xs:time(@attr)`.
- Returns values in the 24-hour clock range (0–23).
- For `xs:dateTime` values, use `hours-from-dateTime()`.

## See also

- [minutes-from-time()](../xpath-minutes-from-time)
- [seconds-from-time()](../xpath-seconds-from-time)
- [current-time()](../xpath-current-time)
