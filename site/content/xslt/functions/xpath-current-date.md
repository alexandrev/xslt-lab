---
title: "current-date()"
description: "Returns the current date as an xs:date value, stable for the duration of the transformation."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "date function"
syntax: "current-date()"
tags: ["xslt", "reference", "xpath", "xslt2"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSI-CiAgPHhzbDpvdXRwdXQgbWV0aG9kPSJ4bWwiIGluZGVudD0ieWVzIi8-CgogIDx4c2w6dGVtcGxhdGUgbWF0Y2g9Ii9yZXBvcnQiPgogICAgPHJlcG9ydD4KICAgICAgPGdlbmVyYXRlZD48eHNsOnZhbHVlLW9mIHNlbGVjdD0iY3VycmVudC1kYXRlKCkiLz48L2dlbmVyYXRlZD4KICAgICAgPHhzbDpjb3B5LW9mIHNlbGVjdD0iKiIvPgogICAgPC9yZXBvcnQ-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHJlcG9ydD4KICA8dGl0bGU-QW5udWFsIFN1bW1hcnk8L3RpdGxlPgo8L3JlcG9ydD4&version=2.0"
---

## Description

`current-date()` returns today's date as an `xs:date` value. The returned value includes the implicit timezone of the processor. Crucially, the value is **fixed** for the entire transformation: all calls within one transformation return the same date, ensuring consistency across the output.

This is the typed-value counterpart to calling `substring-before(string(current-dateTime()), 'T')` in XSLT 1.0.

## Parameters

This function takes no parameters.

## Return value

`xs:date` — the current date in the form `YYYY-MM-DD+HH:MM` (with timezone offset). The date is stable for the lifetime of the transformation.

## Examples

### Stamp a document with today's date

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<report>
  <title>Annual Summary</title>
</report>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/report">
    <report>
      <generated><xsl:value-of select="current-date()"/></generated>
      <xsl:copy-of select="*"/>
    </report>
  </xsl:template>
</xsl:stylesheet>
```

**Output (example):**
```xml
<report>
  <generated>2026-04-18+01:00</generated>
  <title>Annual Summary</title>
</report>
```

### Format today's date for display

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>

  <xsl:template match="/">
    <xsl:value-of select="format-date(current-date(), '[FNn], [D] [MNn] [Y]')"/>
  </xsl:template>
</xsl:stylesheet>
```

**Output (example):**
```
Saturday, 18 April 2026
```

## Notes

- `current-date()` is not available in XSLT 1.0.
- The value includes the processor's implicit timezone. Use `adjust-date-to-timezone()` to convert to a different offset.
- To extract parts of the date, use `year-from-date()`, `month-from-date()`, or `day-from-date()`.
- For a combined date and time, use `current-dateTime()`.

## See also

- [current-time()](../xpath-current-time)
- [current-dateTime()](../xpath-current-date-time)
- [year-from-date()](../xpath-year-from-date)
- [month-from-date()](../xpath-month-from-date)
- [day-from-date()](../xpath-day-from-date)
- [format-date()](../xpath-format-date)
