---
title: "hours-from-time()"
description: "Extracts the hours component from an xs:time value as an xs:integer in the range 0–23."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "date function"
syntax: "hours-from-time(time)"
tags: ["xslt", "reference", "xpath", "xslt2"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczp4cz0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvc2NoZWR1bGUiPgogICAgPHNjaGVkdWxlPgogICAgICA8eHNsOmZvci1lYWNoIHNlbGVjdD0iYXBwb2ludG1lbnQiPgogICAgICAgIDx4c2w6dmFyaWFibGUgbmFtZT0iaCIgc2VsZWN0PSJob3Vycy1mcm9tLXRpbWUoeHM6dGltZShAdGltZSkpIi8-CiAgICAgICAgPGFwcG9pbnRtZW50IHBlcmlvZD0ie2lmICgkaCBsdCAxMikgdGhlbiAnbW9ybmluZycgZWxzZSBpZiAoJGggbHQgMTgpIHRoZW4gJ2FmdGVybm9vbicgZWxzZSAnZXZlbmluZyd9Ij4KICAgICAgICAgIDx4c2w6dmFsdWUtb2Ygc2VsZWN0PSIuIi8-CiAgICAgICAgPC9hcHBvaW50bWVudD4KICAgICAgPC94c2w6Zm9yLWVhY2g-CiAgICA8L3NjaGVkdWxlPgogIDwveHNsOnRlbXBsYXRlPgo8L3hzbDpzdHlsZXNoZWV0Pg&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHNjaGVkdWxlPgogIDxhcHBvaW50bWVudCB0aW1lPSIwOTozMDowMCI-VGVhbSBzdGFuZHVwPC9hcHBvaW50bWVudD4KICA8YXBwb2ludG1lbnQgdGltZT0iMTQ6MDA6MDAiPkNsaWVudCBjYWxsPC9hcHBvaW50bWVudD4KICA8YXBwb2ludG1lbnQgdGltZT0iMTg6MzA6MDAiPkRpbm5lciBtZWV0aW5nPC9hcHBvaW50bWVudD4KPC9zY2hlZHVsZT4&version=2.0"
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
