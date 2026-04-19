---
title: "xsl:matching-substring"
description: "Defines the template body applied to each substring that matches the regex inside xsl:analyze-string."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "element"
syntax: "<xsl:matching-substring>"
tags: ["xslt", "reference", "xslt2"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0iaHRtbCIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvdGV4dCI-CiAgICA8cD4KICAgICAgPHhzbDphbmFseXplLXN0cmluZyBzZWxlY3Q9Ii4iIHJlZ2V4PSJmb3h8ZG9nIj4KICAgICAgICA8eHNsOm1hdGNoaW5nLXN1YnN0cmluZz4KICAgICAgICAgIDxlbT48eHNsOnZhbHVlLW9mIHNlbGVjdD0iLiIvPjwvZW0-CiAgICAgICAgPC94c2w6bWF0Y2hpbmctc3Vic3RyaW5nPgogICAgICAgIDx4c2w6bm9uLW1hdGNoaW5nLXN1YnN0cmluZz4KICAgICAgICAgIDx4c2w6dmFsdWUtb2Ygc2VsZWN0PSIuIi8-CiAgICAgICAgPC94c2w6bm9uLW1hdGNoaW5nLXN1YnN0cmluZz4KICAgICAgPC94c2w6YW5hbHl6ZS1zdHJpbmc-CiAgICA8L3A-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHRleHQ-VGhlIHF1aWNrIGJyb3duIGZveCBqdW1wcyBvdmVyIHRoZSBsYXp5IGRvZy48L3RleHQ-&version=2.0"
---

## Description

`xsl:matching-substring` is a child element of `xsl:analyze-string`. Its body is instantiated once for each substring of the analyzed string that matches the regular expression. Inside this element, the context item (`.`) is the matched substring as a string, and `regex-group(n)` returns captured groups.

The element has no attributes. It is optional — omitting it effectively discards all matching substrings from the output.

## Parameters

`xsl:matching-substring` has no attributes. It contains a sequence constructor (any XSLT instructions or literal result elements).

## Return value

The nodes or atomic values produced by the sequence constructor, contributed to the output of the enclosing `xsl:analyze-string`.

## Examples

### Wrapping matched words in emphasis tags

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<text>The quick brown fox jumps over the lazy dog.</text>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html"/>

  <xsl:template match="/text">
    <p>
      <xsl:analyze-string select="." regex="fox|dog">
        <xsl:matching-substring>
          <em><xsl:value-of select="."/></em>
        </xsl:matching-substring>
        <xsl:non-matching-substring>
          <xsl:value-of select="."/>
        </xsl:non-matching-substring>
      </xsl:analyze-string>
    </p>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```html
<p>The quick brown <em>fox</em> jumps over the lazy <em>dog</em>.</p>
```

### Reformatting phone numbers with groups

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<contacts>
  <phone>0034912345678</phone>
  <phone>0044207946000</phone>
</contacts>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/contacts">
    <formatted>
      <xsl:for-each select="phone">
        <phone>
          <xsl:analyze-string select="." regex="^00(\d{{2}})(\d+)$">
            <xsl:matching-substring>
              <xsl:value-of select="concat('+', regex-group(1), ' ', regex-group(2))"/>
            </xsl:matching-substring>
            <xsl:non-matching-substring>
              <xsl:value-of select="."/>
            </xsl:non-matching-substring>
          </xsl:analyze-string>
        </phone>
      </xsl:for-each>
    </formatted>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<formatted>
  <phone>+34 912345678</phone>
  <phone>+44 207946000</phone>
</formatted>
```

## Notes

- `xsl:matching-substring` is only valid as a direct child of `xsl:analyze-string`.
- The context item inside this element is always a string (the matched text), not the original node.
- Use `regex-group(0)` to get the full match, or `regex-group(n)` for the *n*th parenthesized group.
- If no matches are found, `xsl:matching-substring` is never instantiated.

## See also

- [xsl:analyze-string](../xsl-analyze-string)
- [xsl:non-matching-substring](../xsl-non-matching-substring)
- [regex-group()](../xpath-regex-group)
