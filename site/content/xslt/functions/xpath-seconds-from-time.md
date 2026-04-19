---
title: "seconds-from-time()"
description: "Extracts the seconds component from an xs:time value as an xs:decimal, including any fractional seconds."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "date function"
syntax: "seconds-from-time(time)"
tags: ["xslt", "reference", "xpath", "xslt2"]
---

## Description

`seconds-from-time()` returns the seconds component of an `xs:time` value as an `xs:decimal`. The value includes fractional seconds when present, and falls in the range 0 (inclusive) to 60 (exclusive, to allow for leap seconds). If the argument is the empty sequence, the empty sequence is returned.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `time` | xs:time? | Yes | The time value from which to extract the seconds. |

## Return value

`xs:decimal?` — decimal value in the range [0, 60), or the empty sequence if the argument is the empty sequence.

## Examples

### Extract seconds from log timestamps

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<log>
  <entry time="10:00:45.750">Request received</entry>
  <entry time="10:00:46.120">Processing started</entry>
  <entry time="10:00:47.500">Response sent</entry>
</log>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/log">
    <log>
      <xsl:for-each select="entry">
        <entry seconds="{seconds-from-time(xs:time(@time))}">
          <xsl:value-of select="."/>
        </entry>
      </xsl:for-each>
    </log>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<log>
  <entry seconds="45.75">Request received</entry>
  <entry seconds="46.12">Processing started</entry>
  <entry seconds="47.5">Response sent</entry>
</log>
```

### Round seconds to the nearest integer

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="text"/>

  <xsl:template match="/">
    <xsl:value-of select="round(seconds-from-time(xs:time('10:15:30.7')))"/>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```
31
```

## Notes

- Returns `xs:decimal`, not `xs:integer`, so fractional seconds are preserved.
- The upper bound is 60 (exclusive) to accommodate leap seconds, although most processors do not produce values above 59.
- For `xs:dateTime` values, use `seconds-from-dateTime()`.

## See also

- [hours-from-time()](../xpath-hours-from-time)
- [minutes-from-time()](../xpath-minutes-from-time)
- [current-time()](../xpath-current-time)
