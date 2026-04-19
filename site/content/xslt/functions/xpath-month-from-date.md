---
title: "month-from-date()"
description: "Extracts the month component from an xs:date value as an xs:integer in the range 1–12."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "date function"
syntax: "month-from-date(date)"
tags: ["xslt", "reference", "xpath", "xslt2"]
---

## Description

`month-from-date()` returns the month component of an `xs:date` value as an `xs:integer` between 1 (January) and 12 (December). If the argument is the empty sequence, the empty sequence is returned.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | xs:date? | Yes | The date value from which to extract the month. |

## Return value

`xs:integer?` — integer from 1 to 12 representing the month, or the empty sequence if the argument is the empty sequence.

## Examples

### Group events by month

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<events>
  <event date="2026-04-05">Easter workshop</event>
  <event date="2026-04-18">Spring conference</event>
  <event date="2026-06-01">Summer launch</event>
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
    <by-month>
      <xsl:for-each-group select="event" group-by="month-from-date(xs:date(@date))">
        <month number="{current-grouping-key()}">
          <xsl:copy-of select="current-group()"/>
        </month>
      </xsl:for-each-group>
    </by-month>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<by-month>
  <month number="4">
    <event date="2026-04-05">Easter workshop</event>
    <event date="2026-04-18">Spring conference</event>
  </month>
  <month number="6">
    <event date="2026-06-01">Summer launch</event>
  </month>
</by-month>
```

### Check if a date falls in the current month

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/events">
    <this-month>
      <xsl:copy-of select="event[
        month-from-date(xs:date(@date)) = month-from-date(current-date()) and
        year-from-date(xs:date(@date)) = year-from-date(current-date())]"/>
    </this-month>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- The argument must be typed as `xs:date`. Cast string attributes with `xs:date(@attr)`.
- Month numbers are 1-based (January = 1, December = 12).
- Use alongside `year-from-date()` when filtering by month to avoid false matches across years.

## See also

- [year-from-date()](../xpath-year-from-date)
- [day-from-date()](../xpath-day-from-date)
- [current-date()](../xpath-current-date)
