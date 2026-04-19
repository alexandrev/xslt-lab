---
title: "xsl:non-matching-substring"
description: "Defines the template body applied to each substring that does not match the regex inside xsl:analyze-string."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "element"
syntax: "<xsl:non-matching-substring>"
tags: ["xslt", "reference", "xslt2"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvbG9nIj4KICAgIDxsaW5lcz4KICAgICAgPHhzbDphbmFseXplLXN0cmluZyBzZWxlY3Q9Ii4iIHJlZ2V4PSJsaW5lIFxkKyI-CiAgICAgICAgPHhzbDptYXRjaGluZy1zdWJzdHJpbmc-CiAgICAgICAgICA8cmVmPjx4c2w6dmFsdWUtb2Ygc2VsZWN0PSIuIi8-PC9yZWY-CiAgICAgICAgPC94c2w6bWF0Y2hpbmctc3Vic3RyaW5nPgogICAgICAgIDwhLS0gTm8geHNsOm5vbi1tYXRjaGluZy1zdWJzdHJpbmc6IHN1cnJvdW5kaW5nIHRleHQgaXMgZGlzY2FyZGVkIC0tPgogICAgICA8L3hzbDphbmFseXplLXN0cmluZz4KICAgIDwvbGluZXM-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGxvZz5FcnJvciBhdCBsaW5lIDQyOiBmaWxlIG5vdCBmb3VuZC4gV2FybmluZyBhdCBsaW5lIDk5OiBkZXByZWNhdGVkIEFQSS48L2xvZz4&version=2.0"
---

## Description

`xsl:non-matching-substring` is a child element of `xsl:analyze-string`. Its body is instantiated once for each portion of the analyzed string that falls between matches — the "gaps" around the matched substrings, including any leading or trailing text.

The element has no attributes. Inside it, the context item (`.`) is the non-matching segment as a string. `regex-group()` is not meaningful here because no capture groups apply to unmatched text.

Omitting `xsl:non-matching-substring` effectively discards all non-matching text from the output, which is useful when you only want to extract the matched parts.

## Parameters

`xsl:non-matching-substring` has no attributes. It contains a sequence constructor.

## Return value

The nodes or atomic values produced by the sequence constructor, contributed to the output of the enclosing `xsl:analyze-string`.

## Examples

### Extracting only the matched parts (discarding non-matches)

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<log>Error at line 42: file not found. Warning at line 99: deprecated API.</log>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/log">
    <lines>
      <xsl:analyze-string select="." regex="line \d+">
        <xsl:matching-substring>
          <ref><xsl:value-of select="."/></ref>
        </xsl:matching-substring>
        <!-- No xsl:non-matching-substring: surrounding text is discarded -->
      </xsl:analyze-string>
    </lines>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<lines>
  <ref>line 42</ref>
  <ref>line 99</ref>
</lines>
```

### Preserving non-matching text alongside highlights

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<note>Remember to call 555-1234 or 555-5678 if urgent.</note>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html"/>

  <xsl:template match="/note">
    <p>
      <xsl:analyze-string select="." regex="\d{{3}}-\d{{4}}">
        <xsl:matching-substring>
          <strong><xsl:value-of select="."/></strong>
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
<p>Remember to call <strong>555-1234</strong> or <strong>555-5678</strong> if urgent.</p>
```

## Notes

- `xsl:non-matching-substring` is only valid as a direct child of `xsl:analyze-string`.
- If the regex matches the entire string, `xsl:non-matching-substring` is never instantiated.
- Leading text before the first match and trailing text after the last match are also treated as non-matching substrings.
- The context item is a string; node-related functions like `name()` or `parent::` are not applicable here.

## See also

- [xsl:analyze-string](../xsl-analyze-string)
- [xsl:matching-substring](../xsl-matching-substring)
- [regex-group()](../xpath-regex-group)
