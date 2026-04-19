---
title: "format-time()"
description: "Formats an xs:time value into a human-readable string using a picture pattern, with optional locale and calendar support."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "date function"
syntax: "format-time(time, picture, language?, calendar?, place?)"
tags: ["xslt", "reference", "xpath", "xslt2"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczp4cz0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvc2NoZWR1bGUiPgogICAgPHNjaGVkdWxlPgogICAgICA8eHNsOmZvci1lYWNoIHNlbGVjdD0iYXBwb2ludG1lbnQiPgogICAgICAgIDxhcHBvaW50bWVudCBkaXNwbGF5PSJ7Zm9ybWF0LXRpbWUoeHM6dGltZShAdGltZSksICdbaF06W20wMV0gW1BdJyl9Ij4KICAgICAgICAgIDx4c2w6dmFsdWUtb2Ygc2VsZWN0PSIuIi8-CiAgICAgICAgPC9hcHBvaW50bWVudD4KICAgICAgPC94c2w6Zm9yLWVhY2g-CiAgICA8L3NjaGVkdWxlPgogIDwveHNsOnRlbXBsYXRlPgo8L3hzbDpzdHlsZXNoZWV0Pg&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHNjaGVkdWxlPgogIDxhcHBvaW50bWVudCB0aW1lPSIwOTozMDowMCI-VGVhbSBzdGFuZHVwPC9hcHBvaW50bWVudD4KICA8YXBwb2ludG1lbnQgdGltZT0iMTQ6MDA6MDAiPkNsaWVudCBjYWxsPC9hcHBvaW50bWVudD4KPC9zY2hlZHVsZT4&version=2.0"
---

## Description

`format-time()` converts an `xs:time` value into a formatted string using the same **picture pattern** syntax used by `format-date()` and `format-dateTime()`. Picture components are enclosed in square brackets.

Common time specifiers:

| Specifier | Meaning |
|-----------|---------|
| `[H]` | Hour, 24-hour clock (0–23) |
| `[h]` | Hour, 12-hour clock (1–12) |
| `[m]` | Minute (0–59) |
| `[s]` | Second (0–59) |
| `[f]` | Fractional seconds |
| `[P]` | AM/PM marker |

Width modifiers like `[H01]` add zero-padding (e.g., `07` instead of `7`).

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `time` | xs:time? | Yes | The time value to format. Returns an empty string for the empty sequence. |
| `picture` | xs:string | Yes | The picture pattern controlling the output format. |
| `language` | xs:string? | No | BCP 47 language tag (e.g., `"en"`, `"fr"`). |
| `calendar` | xs:string? | No | Calendar system identifier. Implementation-defined. |
| `place` | xs:string? | No | Place or timezone identifier. Implementation-defined. |

## Return value

`xs:string` — the formatted time string, or an empty string if `time` is the empty sequence.

## Examples

### Format appointment times

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<schedule>
  <appointment time="09:30:00">Team standup</appointment>
  <appointment time="14:00:00">Client call</appointment>
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
        <appointment display="{format-time(xs:time(@time), '[h]:[m01] [P]')}">
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
  <appointment display="9:30 am">Team standup</appointment>
  <appointment display="2:00 pm">Client call</appointment>
</schedule>
```

### Format the current time as HH:MM:SS

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>

  <xsl:template match="/">
    <xsl:value-of select="format-time(current-time(), '[H01]:[m01]:[s01]')"/>
  </xsl:template>
</xsl:stylesheet>
```

**Output (example):**
```
14:32:07
```

## Notes

- The input must be an `xs:time` value, not a plain string. Cast with `xs:time(@attr)`.
- Picture syntax is specific to XPath 2.0 and differs from Java `SimpleDateFormat` or POSIX `strftime`.
- Language support for AM/PM markers and other named components varies by processor.

## See also

- [format-date()](../xpath-format-date)
- [format-dateTime()](../xpath-format-date-time)
- [current-time()](../xpath-current-time)
