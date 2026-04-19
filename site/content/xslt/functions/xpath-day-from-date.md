---
title: "day-from-date()"
description: "Extracts the day-of-month component from an xs:date value as an xs:integer in the range 1–31."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "date function"
syntax: "day-from-date(date)"
tags: ["xslt", "reference", "xpath", "xslt2"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczp4cz0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvaW52b2ljZSI-CiAgICA8aW52b2ljZT4KICAgICAgPHhzbDpmb3ItZWFjaCBzZWxlY3Q9Imlzc3VlZHxkdWUiPgogICAgICAgIDx4c2w6ZWxlbWVudCBuYW1lPSJ7bG9jYWwtbmFtZSgpfSI-CiAgICAgICAgICA8ZGF5Pjx4c2w6dmFsdWUtb2Ygc2VsZWN0PSJkYXktZnJvbS1kYXRlKHhzOmRhdGUoLikpIi8-PC9kYXk-CiAgICAgICAgICA8bW9udGg-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9Im1vbnRoLWZyb20tZGF0ZSh4czpkYXRlKC4pKSIvPjwvbW9udGg-CiAgICAgICAgICA8eWVhcj48eHNsOnZhbHVlLW9mIHNlbGVjdD0ieWVhci1mcm9tLWRhdGUoeHM6ZGF0ZSguKSkiLz48L3llYXI-CiAgICAgICAgPC94c2w6ZWxlbWVudD4KICAgICAgPC94c2w6Zm9yLWVhY2g-CiAgICA8L2ludm9pY2U-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGludm9pY2U-CiAgPGlzc3VlZD4yMDI2LTA0LTE4PC9pc3N1ZWQ-CiAgPGR1ZT4yMDI2LTA1LTE4PC9kdWU-CjwvaW52b2ljZT4&version=2.0"
---

## Description

`day-from-date()` returns the day-of-month component of an `xs:date` value as an `xs:integer` between 1 and 31. If the argument is the empty sequence, the empty sequence is returned.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | xs:date? | Yes | The date value from which to extract the day. |

## Return value

`xs:integer?` — integer from 1 to 31 representing the day of the month, or the empty sequence if the argument is the empty sequence.

## Examples

### Display a formatted date with separate components

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<invoice>
  <issued>2026-04-18</issued>
  <due>2026-05-18</due>
</invoice>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/invoice">
    <invoice>
      <xsl:for-each select="issued|due">
        <xsl:element name="{local-name()}">
          <day><xsl:value-of select="day-from-date(xs:date(.))"/></day>
          <month><xsl:value-of select="month-from-date(xs:date(.))"/></month>
          <year><xsl:value-of select="year-from-date(xs:date(.))"/></year>
        </xsl:element>
      </xsl:for-each>
    </invoice>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<invoice>
  <issued>
    <day>18</day>
    <month>4</month>
    <year>2026</year>
  </issued>
  <due>
    <day>18</day>
    <month>5</month>
    <year>2026</year>
  </due>
</invoice>
```

### Find events on the 1st of any month

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/events">
    <first-of-month>
      <xsl:copy-of select="event[day-from-date(xs:date(@date)) = 1]"/>
    </first-of-month>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- The argument must be typed as `xs:date`. Cast string values with `xs:date(.)` or `xs:date(@attr)`.
- Returns 1–31 depending on the month; it does not validate whether the day is valid for the given month (that is enforced when constructing the `xs:date` value).
- For `xs:dateTime` values, use `day-from-dateTime()`.

## See also

- [year-from-date()](../xpath-year-from-date)
- [month-from-date()](../xpath-month-from-date)
- [current-date()](../xpath-current-date)
