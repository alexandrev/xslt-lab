---
title: "current-dateTime()"
description: "Returns the current date and time as an xs:dateTime value, fixed for the duration of the transformation."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "date function"
syntax: "current-dateTime()"
tags: ["xslt", "reference", "xpath", "xslt2"]
---

## Description

`current-dateTime()` returns the current date and time as a single `xs:dateTime` value, including the implicit timezone of the processor. The value is **fixed** for the entire transformation, so all calls within a single run return the same timestamp.

It is the most complete timestamp function in XPath 2.0, combining both the date information of `current-date()` and the time information of `current-time()`.

## Parameters

This function takes no parameters.

## Return value

`xs:dateTime` — the current date and time in ISO 8601 form `YYYY-MM-DDTHH:MM:SS.sss+HH:MM`. Stable for the lifetime of the transformation.

## Examples

### Add a full ISO timestamp to the root element

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<export>
  <record id="1">Alpha</record>
  <record id="2">Beta</record>
</export>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/export">
    <export timestamp="{current-dateTime()}">
      <xsl:copy-of select="*"/>
    </export>
  </xsl:template>
</xsl:stylesheet>
```

**Output (example):**
```xml
<export timestamp="2026-04-18T14:32:07.123+01:00">
  <record id="1">Alpha</record>
  <record id="2">Beta</record>
</export>
```

### Format a human-readable timestamp

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>

  <xsl:template match="/">
    <xsl:value-of select="format-dateTime(current-dateTime(), '[FNn] [D] [MNn] [Y] at [H01]:[m01]')"/>
  </xsl:template>
</xsl:stylesheet>
```

**Output (example):**
```
Saturday 18 April 2026 at 14:32
```

## Notes

- Not available in XSLT 1.0.
- All three functions — `current-date()`, `current-time()`, and `current-dateTime()` — return consistent values derived from the same instant.
- Use `xs:date(current-dateTime())` to extract just the date portion, or `xs:time(current-dateTime())` for just the time.
- Pair with `format-dateTime()` to produce locale-aware output.

## See also

- [current-date()](../xpath-current-date)
- [current-time()](../xpath-current-time)
- [format-dateTime()](../xpath-format-date-time)
- [format-date()](../xpath-format-date)
