---
title: "year-from-date()"
description: "Extracts the year component from an xs:date value as an xs:integer."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "date function"
syntax: "year-from-date(date)"
tags: ["xslt", "reference", "xpath", "xslt2"]
---

## Description

`year-from-date()` returns the year component of an `xs:date` value as an `xs:integer`. For proleptic Gregorian calendar dates, years before the common era are represented as non-positive integers (year 1 BCE = 0, year 2 BCE = -1, etc.).

If the argument is the empty sequence, the empty sequence is returned.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | xs:date? | Yes | The date value from which to extract the year. |

## Return value

`xs:integer?` — the year component of the date, or the empty sequence if the argument is the empty sequence.

## Examples

### Extract the year from date attributes

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<publications>
  <book date="2020-03-15">Learning XSLT</book>
  <book date="2023-11-01">XPath in Practice</book>
</publications>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/publications">
    <years>
      <xsl:for-each select="book">
        <year title="{.}"><xsl:value-of select="year-from-date(xs:date(@date))"/></year>
      </xsl:for-each>
    </years>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<years>
  <year title="Learning XSLT">2020</year>
  <year title="XPath in Practice">2023</year>
</years>
```

### Filter items from the current year

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/publications">
    <current-year-books>
      <xsl:copy-of select="book[year-from-date(xs:date(@date)) = year-from-date(current-date())]"/>
    </current-year-books>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- The argument must be typed as `xs:date`, not a plain string. Cast with `xs:date(@attr)` when reading attribute values.
- To get the current year, use `year-from-date(current-date())`.
- Companion functions for the other date components are `month-from-date()` and `day-from-date()`.
- For `xs:dateTime` values, use `year-from-dateTime()` instead.

## See also

- [month-from-date()](../xpath-month-from-date)
- [day-from-date()](../xpath-day-from-date)
- [current-date()](../xpath-current-date)
