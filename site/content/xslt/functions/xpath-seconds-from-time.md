---
title: "seconds-from-time()"
description: "Extracts the seconds component from an xs:time value as an xs:decimal, including any fractional seconds."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "date function"
syntax: "seconds-from-time(time)"
tags: ["xslt", "reference", "xpath", "xslt2"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczp4cz0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvbG9nIj4KICAgIDxsb2c-CiAgICAgIDx4c2w6Zm9yLWVhY2ggc2VsZWN0PSJlbnRyeSI-CiAgICAgICAgPGVudHJ5IHNlY29uZHM9IntzZWNvbmRzLWZyb20tdGltZSh4czp0aW1lKEB0aW1lKSl9Ij4KICAgICAgICAgIDx4c2w6dmFsdWUtb2Ygc2VsZWN0PSIuIi8-CiAgICAgICAgPC9lbnRyeT4KICAgICAgPC94c2w6Zm9yLWVhY2g-CiAgICA8L2xvZz4KICA8L3hzbDp0ZW1wbGF0ZT4KPC94c2w6c3R5bGVzaGVldD4&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGxvZz4KICA8ZW50cnkgdGltZT0iMTA6MDA6NDUuNzUwIj5SZXF1ZXN0IHJlY2VpdmVkPC9lbnRyeT4KICA8ZW50cnkgdGltZT0iMTA6MDA6NDYuMTIwIj5Qcm9jZXNzaW5nIHN0YXJ0ZWQ8L2VudHJ5PgogIDxlbnRyeSB0aW1lPSIxMDowMDo0Ny41MDAiPlJlc3BvbnNlIHNlbnQ8L2VudHJ5Pgo8L2xvZz4&version=2.0"
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
