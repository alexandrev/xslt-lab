---
title: "reverse()"
description: "Returns the items of a sequence in reverse order."
date: 2026-04-19T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "sequence function"
syntax: "reverse(sequence)"
tags: ["xslt", "reference", "xpath", "xslt2"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSI-CiAgPHhzbDpvdXRwdXQgbWV0aG9kPSJ4bWwiIGluZGVudD0ieWVzIi8-CgogIDx4c2w6dGVtcGxhdGUgbWF0Y2g9Ii9zdGVwcyI-CiAgICA8cmV2ZXJzZWQ-CiAgICAgIDx4c2w6Zm9yLWVhY2ggc2VsZWN0PSJyZXZlcnNlKHN0ZXApIj4KICAgICAgICA8c3RlcD48eHNsOnZhbHVlLW9mIHNlbGVjdD0iLiIvPjwvc3RlcD4KICAgICAgPC94c2w6Zm9yLWVhY2g-CiAgICA8L3JldmVyc2VkPgogIDwveHNsOnRlbXBsYXRlPgo8L3hzbDpzdHlsZXNoZWV0Pg&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN0ZXBzPgogIDxzdGVwPkNvbm5lY3Q8L3N0ZXA-CiAgPHN0ZXA-QXV0aGVudGljYXRlPC9zdGVwPgogIDxzdGVwPlF1ZXJ5PC9zdGVwPgogIDxzdGVwPkRpc2Nvbm5lY3Q8L3N0ZXA-Cjwvc3RlcHM-&version=2.0"
---

## Description

`reverse()` returns a new sequence containing all the items from the argument sequence in the opposite order. The first item of the result is the last item of the input, and the last item of the result is the first item of the input. If the input sequence is empty, the empty sequence is returned.

This function is purely order-based and does not sort or otherwise reorder items by value. It is useful when you need the last element of a node-set without using `[last()]`, or when you need to iterate over a sequence in reverse without reversing the natural document order.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sequence` | item()* | Yes | The sequence to reverse. |

## Return value

`item()*` — the same items as the input, in reverse order.

## Examples

### Reversing a node sequence

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<steps>
  <step>Connect</step>
  <step>Authenticate</step>
  <step>Query</step>
  <step>Disconnect</step>
</steps>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/steps">
    <reversed>
      <xsl:for-each select="reverse(step)">
        <step><xsl:value-of select="."/></step>
      </xsl:for-each>
    </reversed>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<reversed>
  <step>Disconnect</step>
  <step>Query</step>
  <step>Authenticate</step>
  <step>Connect</step>
</reversed>
```

### Getting the last child efficiently

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<log>
  <entry>First</entry>
  <entry>Second</entry>
  <entry>Latest</entry>
</log>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>

  <xsl:template match="/log">
    <xsl:value-of select="reverse(entry)[1]"/>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```
Latest
```

## Notes

- `reverse()` does not sort by value; it literally inverts the order of items as they appear in the sequence.
- When applied to node sequences, the resulting order is no longer document order. Predicates and axes applied to a reversed sequence operate on the reversed order.
- An equivalent in XSLT 1.0 requires `<xsl:sort order="descending"/>` or a recursive template.
- `reverse(reverse($seq))` is identical to `$seq`.

## See also

- [subsequence()](../xpath-subsequence)
- [unordered()](../xpath-unordered)
- [sort()](../xpath-sort)
