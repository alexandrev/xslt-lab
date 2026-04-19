---
title: "regex-group()"
description: "Returns the string matched by a numbered capture group of the current regex match inside xsl:analyze-string."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "string function"
syntax: "regex-group(group-number)"
tags: ["xslt", "reference", "xslt2", "xpath"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvZXZlbnRzIj4KICAgIDxkYXRlcz4KICAgICAgPHhzbDpmb3ItZWFjaCBzZWxlY3Q9ImV2ZW50Ij4KICAgICAgICA8eHNsOmFuYWx5emUtc3RyaW5nIHNlbGVjdD0iLiIgcmVnZXg9IihcZHt7NH19KS0oXGR7ezJ9fSktKFxke3syfX0pIj4KICAgICAgICAgIDx4c2w6bWF0Y2hpbmctc3Vic3RyaW5nPgogICAgICAgICAgICA8ZGF0ZSB5ZWFyPSJ7cmVnZXgtZ3JvdXAoMSl9IgogICAgICAgICAgICAgICAgICBtb250aD0ie3JlZ2V4LWdyb3VwKDIpfSIKICAgICAgICAgICAgICAgICAgZGF5PSJ7cmVnZXgtZ3JvdXAoMyl9IgogICAgICAgICAgICAgICAgICBmdWxsPSJ7cmVnZXgtZ3JvdXAoMCl9Ii8-CiAgICAgICAgICA8L3hzbDptYXRjaGluZy1zdWJzdHJpbmc-CiAgICAgICAgPC94c2w6YW5hbHl6ZS1zdHJpbmc-CiAgICAgIDwveHNsOmZvci1lYWNoPgogICAgPC9kYXRlcz4KICA8L3hzbDp0ZW1wbGF0ZT4KPC94c2w6c3R5bGVzaGVldD4&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGV2ZW50cz4KICA8ZXZlbnQ-TGF1bmNoIG9uIDIwMjYtMDQtMTggYXQgSFE8L2V2ZW50PgogIDxldmVudD5SZXZpZXcgb24gMjAyNi0wNS0wMSByZW1vdGVseTwvZXZlbnQ-CjwvZXZlbnRzPg&version=2.0"
---

## Description

`regex-group()` is available exclusively inside the body of `xsl:matching-substring`. It returns the substring captured by the parenthesized group identified by the integer argument:

- `regex-group(0)` — the entire matched string.
- `regex-group(1)` — the first parenthesized capture group.
- `regex-group(2)` — the second parenthesized capture group, and so on.

If the group number does not exist in the regex, or if the group did not participate in the match (e.g., it belongs to an unmatched alternative), the function returns an empty string `""`.

`regex-group()` has no meaning outside `xsl:matching-substring` and should not be called in other contexts.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `group-number` | xs:integer | Yes | The capture group index: 0 for the full match, 1+ for numbered groups. |

## Return value

`xs:string` — the text captured by the specified group, or `""` if the group did not participate in the match.

## Examples

### Extracting date components

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<events>
  <event>Launch on 2026-04-18 at HQ</event>
  <event>Review on 2026-05-01 remotely</event>
</events>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/events">
    <dates>
      <xsl:for-each select="event">
        <xsl:analyze-string select="." regex="(\d{{4}})-(\d{{2}})-(\d{{2}})">
          <xsl:matching-substring>
            <date year="{regex-group(1)}"
                  month="{regex-group(2)}"
                  day="{regex-group(3)}"
                  full="{regex-group(0)}"/>
          </xsl:matching-substring>
        </xsl:analyze-string>
      </xsl:for-each>
    </dates>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<dates>
  <date year="2026" month="04" day="18" full="2026-04-18"/>
  <date year="2026" month="05" day="01" full="2026-05-01"/>
</dates>
```

### Parsing key-value pairs

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<config>color=blue;size=large;weight=12kg</config>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/config">
    <settings>
      <xsl:analyze-string select="." regex="([a-z]+)=([^;]+)">
        <xsl:matching-substring>
          <setting key="{regex-group(1)}" value="{regex-group(2)}"/>
        </xsl:matching-substring>
      </xsl:analyze-string>
    </settings>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<settings>
  <setting key="color" value="blue"/>
  <setting key="size" value="large"/>
  <setting key="weight" value="12kg"/>
</settings>
```

## Notes

- Groups are numbered by counting opening parentheses `(` left to right in the regex, starting from 1.
- Non-capturing groups `(?:...)` are **not** supported in XPath regex; all parenthesized groups capture.
- If a group is part of an alternation that did not match (e.g., `(a)|(b)` matched on `b` — group 1 returns `""`), the function returns `""` rather than raising an error.
- `regex-group()` is a context function; its value changes for each match iteration of `xsl:analyze-string`.

## See also

- [xsl:analyze-string](../xsl-analyze-string)
- [xsl:matching-substring](../xsl-matching-substring)
- [matches()](../xpath-matches)
- [replace()](../xpath-replace)
