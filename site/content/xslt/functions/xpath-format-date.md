---
title: "format-date()"
description: "Formats an xs:date value into a human-readable string using a picture pattern, with optional locale and calendar support."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "date function"
syntax: "format-date(date, picture, language?, calendar?, place?)"
tags: ["xslt", "reference", "xslt2", "xpath"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczp4cz0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvZXZlbnRzIj4KICAgIDxldmVudHM-CiAgICAgIDx4c2w6Zm9yLWVhY2ggc2VsZWN0PSJldmVudCI-CiAgICAgICAgPGV2ZW50PgogICAgICAgICAgPGRhdGU-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9ImZvcm1hdC1kYXRlKHhzOmRhdGUoQGRhdGUpLCAnW0ZObl0sIFtEXSBbTU5uXSBbWV0nKSIvPjwvZGF0ZT4KICAgICAgICAgIDxuYW1lPjx4c2w6dmFsdWUtb2Ygc2VsZWN0PSIuIi8-PC9uYW1lPgogICAgICAgIDwvZXZlbnQ-CiAgICAgIDwveHNsOmZvci1lYWNoPgogICAgPC9ldmVudHM-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGV2ZW50cz4KICA8ZXZlbnQgZGF0ZT0iMjAyNi0wNC0xOCI-WFNMVCBDb25mZXJlbmNlPC9ldmVudD4KICA8ZXZlbnQgZGF0ZT0iMjAyNi0xMi0yNSI-SG9saWRheTwvZXZlbnQ-CjwvZXZlbnRzPg&version=2.0"
---

## Description

`format-date()` converts an `xs:date` value into a formatted string according to a **picture pattern**. It is the standard way in XSLT 2.0+ to produce locale-aware, human-readable date output from typed date values.

The picture string uses component specifiers enclosed in square brackets:

| Specifier | Meaning |
|-----------|---------|
| `[Y]` | Year (4 digits by default) |
| `[M]` | Month as a number |
| `[MNn]` | Month name (e.g., "April") |
| `[D]` | Day of the month |
| `[d]` | Day of the year |
| `[F]` | Day of the week name (e.g., "Monday") |
| `[FNn]` | Day of week, title case |
| `[W]` | Week of the year |

Width modifiers control zero-padding: `[D01]` formats day as two digits (`01`, `15`). The `[MNn]` modifier requests the name in title case; `[MN]` gives uppercase.

Related functions cover time and combined date-time values:
- `format-time(time, picture, ...)` for `xs:time` values.
- `format-dateTime(dateTime, picture, ...)` for `xs:dateTime` values.

To get today's date for formatting, use `current-date()`.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | xs:date? | Yes | The date value to format. If an empty sequence, an empty string is returned. |
| `picture` | xs:string | Yes | The picture pattern controlling the output format. |
| `language` | xs:string? | No | BCP 47 language tag controlling names (e.g., `"en"`, `"fr"`, `"de"`). |
| `calendar` | xs:string? | No | Calendar system identifier (e.g., `"AD"`, `"ISO"`). Implementation-defined. |
| `place` | xs:string? | No | Place or timezone identifier. Implementation-defined. |

## Return value

`xs:string` — the formatted date string, or an empty string if `date` is an empty sequence.

## Examples

### Format a date attribute

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<events>
  <event date="2026-04-18">XSLT Conference</event>
  <event date="2026-12-25">Holiday</event>
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
        <event>
          <date><xsl:value-of select="format-date(xs:date(@date), '[FNn], [D] [MNn] [Y]')"/></date>
          <name><xsl:value-of select="."/></name>
        </event>
      </xsl:for-each>
    </events>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<events>
  <event>
    <date>Saturday, 18 April 2026</date>
    <name>XSLT Conference</name>
  </event>
  <event>
    <date>Friday, 25 December 2026</date>
    <name>Holiday</name>
  </event>
</events>
```

### Today's date formatted

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>

  <xsl:template match="/">
    <xsl:value-of select="format-date(current-date(), '[D01]/[M01]/[Y]')"/>
  </xsl:template>
</xsl:stylesheet>
```

**Output (example):**
```
18/04/2026
```

### French locale month name

```xml
<xsl:value-of select="format-date(xs:date(@date), '[D] [MNn] [Y]', 'fr', (), ())"/>
<!-- Output example: 18 avril 2026 -->
```

## Notes

- The input must be an `xs:date` (not a string). Cast string date values with `xs:date(@date)` before calling `format-date()`.
- Picture patterns are **not** the same as Java `SimpleDateFormat` or `strftime`. Refer to the XPath/XSLT 2.0 specification for the full picture syntax.
- Language support depends on the XSLT processor. Saxon supports common European languages; less common locales may fall back to English.
- For `xs:dateTime` values, use `format-dateTime()` which additionally supports time component specifiers like `[H]` (hour), `[m]` (minute), `[s]` (second).
- `current-date()` returns the processor's current date as `xs:date`; pair it with `format-date()` to embed a build timestamp in the output.

## See also

- [current()](../xpath-current)
