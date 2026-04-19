---
title: "current-time()"
description: "Returns the current time as an xs:time value, stable and fixed for the duration of the transformation."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "date function"
syntax: "current-time()"
tags: ["xslt", "reference", "xpath", "xslt2"]
---

## Description

`current-time()` returns the current time as an `xs:time` value, including the implicit timezone of the processor. Like `current-date()` and `current-dateTime()`, the value is **fixed** for the entire transformation: repeated calls return the same time, guaranteeing a consistent timestamp throughout the output.

## Parameters

This function takes no parameters.

## Return value

`xs:time` — the current time in the form `HH:MM:SS.sss+HH:MM` (with timezone offset). Stable for the lifetime of the transformation.

## Examples

### Embed the generation time in output

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<feed>
  <item>First item</item>
  <item>Second item</item>
</feed>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/feed">
    <feed generated-time="{current-time()}">
      <xsl:copy-of select="*"/>
    </feed>
  </xsl:template>
</xsl:stylesheet>
```

**Output (example):**
```xml
<feed generated-time="14:32:07.123+01:00">
  <item>First item</item>
  <item>Second item</item>
</feed>
```

### Format the current time for display

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

- Not available in XSLT 1.0.
- The value includes the processor's implicit timezone. Pair with `adjust-time-to-timezone()` to normalise to UTC or another offset.
- To extract individual components, use `hours-from-time()`, `minutes-from-time()`, or `seconds-from-time()`.
- For a combined date and time, use `current-dateTime()`.

## See also

- [current-date()](../xpath-current-date)
- [current-dateTime()](../xpath-current-date-time)
- [hours-from-time()](../xpath-hours-from-time)
- [minutes-from-time()](../xpath-minutes-from-time)
- [seconds-from-time()](../xpath-seconds-from-time)
- [format-time()](../xpath-format-time)
