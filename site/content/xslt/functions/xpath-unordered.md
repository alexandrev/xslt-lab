---
title: "unordered()"
description: "Returns the items in the sequence in an implementation-defined order; a hint to the processor that order does not matter."
date: 2026-04-19T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "sequence function"
syntax: "unordered(sequence)"
tags: ["xslt", "reference", "xpath", "xslt2"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSI-CiAgPHhzbDpvdXRwdXQgbWV0aG9kPSJ4bWwiIGluZGVudD0ieWVzIi8-CgogIDx4c2w6dGVtcGxhdGUgbWF0Y2g9Ii9jb25maWciPgogICAgPHNldHRpbmdzPgogICAgICA8eHNsOmZvci1lYWNoIHNlbGVjdD0idW5vcmRlcmVkKHNldHRpbmcpIj4KICAgICAgICA8ZW50cnkga2V5PSJ7QGtleX0iIHZhbHVlPSJ7Ln0iLz4KICAgICAgPC94c2w6Zm9yLWVhY2g-CiAgICA8L3NldHRpbmdzPgogIDwveHNsOnRlbXBsYXRlPgo8L3hzbDpzdHlsZXNoZWV0Pg&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGNvbmZpZz4KICA8c2V0dGluZyBrZXk9InRpbWVvdXQiPjMwPC9zZXR0aW5nPgogIDxzZXR0aW5nIGtleT0icmV0cmllcyI-Mzwvc2V0dGluZz4KICA8c2V0dGluZyBrZXk9ImRlYnVnIj5mYWxzZTwvc2V0dGluZz4KPC9jb25maWc-&version=2.0"
---

## Description

`unordered()` returns a sequence containing exactly the same items as its argument but in an order chosen by the processor. It is a performance hint: by calling `unordered()` you tell the processor that your code does not depend on the relative order of the items, allowing the processor to avoid sorting or impose any order that is convenient for its evaluation strategy.

In practice, most processors return the items in the same order they received them, so the observable behavior is often identical to not calling `unordered()`. The benefit is theoretical and optimizer-driven. The function is the XPath counterpart to the SQL `ORDER BY`-less query hint — correct code should not depend on the actual order returned.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sequence` | item()* | Yes | The input sequence whose order may be rearranged. |

## Return value

`item()*` — the same items as the input in an implementation-defined order.

## Examples

### Processing nodes where order is irrelevant

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<config>
  <setting key="timeout">30</setting>
  <setting key="retries">3</setting>
  <setting key="debug">false</setting>
</config>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/config">
    <settings>
      <xsl:for-each select="unordered(setting)">
        <entry key="{@key}" value="{.}"/>
      </xsl:for-each>
    </settings>
  </xsl:template>
</xsl:stylesheet>
```

**Output (order may vary):**
```xml
<settings>
  <entry key="timeout" value="30"/>
  <entry key="retries" value="3"/>
  <entry key="debug" value="false"/>
</settings>
```

### Combining with distinct-values

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<tags>
  <tag>xslt</tag><tag>xpath</tag><tag>xslt</tag><tag>xml</tag>
</tags>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/tags">
    <unique>
      <xsl:for-each select="unordered(distinct-values(tag))">
        <tag><xsl:value-of select="."/></tag>
      </xsl:for-each>
    </unique>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<unique>
  <tag>xslt</tag>
  <tag>xpath</tag>
  <tag>xml</tag>
</unique>
```

## Notes

- `unordered()` is semantically a no-op in almost all real processor implementations; its value is as a documentation hint to human readers and as a signal to static analysis tools.
- Do not rely on `unordered()` to randomize or shuffle a sequence; it does not guarantee any particular ordering different from the input.
- Combining `unordered()` with a subsequent `sort()` or `xsl:sort` negates its purpose.
- The function was introduced to enable future streaming or parallel evaluation strategies in conforming processors.

## See also

- [reverse()](../xpath-reverse)
- [subsequence()](../xpath-subsequence)
- [distinct-values()](../xpath-distinct-values)
