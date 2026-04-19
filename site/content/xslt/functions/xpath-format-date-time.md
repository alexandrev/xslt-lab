---
title: "format-dateTime()"
description: "Formats an xs:dateTime value into a human-readable string using a picture pattern, with optional locale and calendar support."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "date function"
syntax: "format-dateTime(dateTime, picture, language?, calendar?, place?)"
tags: ["xslt", "reference", "xpath", "xslt2"]
---

## Description

`format-dateTime()` converts an `xs:dateTime` value into a formatted string using the picture pattern syntax shared by `format-date()` and `format-time()`. It supports all date and time component specifiers in a single call.

Common specifiers:

| Specifier | Meaning |
|-----------|---------|
| `[Y]` | Year (4 digits by default) |
| `[M]` | Month as a number |
| `[MNn]` | Month name (e.g., "April") |
| `[D]` | Day of the month |
| `[H]` | Hour, 24-hour clock (0–23) |
| `[h]` | Hour, 12-hour clock (1–12) |
| `[m]` | Minute |
| `[s]` | Second |
| `[P]` | AM/PM marker |
| `[Z]` | Timezone offset |

Width modifiers (e.g., `[D01]`, `[m01]`) control zero-padding.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `dateTime` | xs:dateTime? | Yes | The dateTime value to format. Returns an empty string for the empty sequence. |
| `picture` | xs:string | Yes | The picture pattern controlling the output format. |
| `language` | xs:string? | No | BCP 47 language tag (e.g., `"en"`, `"fr"`). |
| `calendar` | xs:string? | No | Calendar system identifier. Implementation-defined. |
| `place` | xs:string? | No | Place or timezone identifier. Implementation-defined. |

## Return value

`xs:string` — the formatted date-time string, or an empty string if `dateTime` is the empty sequence.

## Examples

### Format an event timestamp

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<events>
  <event timestamp="2026-04-18T09:30:00">Morning session</event>
  <event timestamp="2026-04-18T14:00:00">Afternoon workshop</event>
</events>
```

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
        <event display="{format-dateTime(xs:dateTime(@timestamp), '[D] [MNn] [Y] at [H01]:[m01]')}">
          <xsl:value-of select="."/>
        </event>
      </xsl:for-each>
    </events>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<events>
  <event display="18 April 2026 at 09:30">Morning session</event>
  <event display="18 April 2026 at 14:00">Afternoon workshop</event>
</events>
```

### Embed a generation timestamp in a report

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <report generated="{format-dateTime(current-dateTime(), '[Y]-[M01]-[D01]T[H01]:[m01]:[s01]')}">
      <xsl:apply-templates/>
    </report>
  </xsl:template>
</xsl:stylesheet>
```

**Output (example):**
```xml
<report generated="2026-04-18T14:32:07">
  ...
</report>
```

## Notes

- The input must be `xs:dateTime`, not a plain string. Cast attribute values with `xs:dateTime(@attr)`.
- Picture syntax follows the XPath 2.0 specification, not Java or POSIX conventions.
- To format only the date or time portion of a `xs:dateTime`, cast first: `format-date(xs:date(current-dateTime()), ...)`.

## See also

- [format-date()](../xpath-format-date)
- [format-time()](../xpath-format-time)
- [current-dateTime()](../xpath-current-date-time)
