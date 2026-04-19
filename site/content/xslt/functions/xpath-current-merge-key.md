---
title: "current-merge-key()"
description: "Returns the current merge key value inside an xsl:merge-action block."
date: 2026-04-19T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "node function"
syntax: "current-merge-key()"
tags: ["xslt", "reference", "xpath", "xslt3"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSI-CiAgPHhzbDpvdXRwdXQgbWV0aG9kPSJ4bWwiIGluZGVudD0ieWVzIi8-CgogIDx4c2w6dGVtcGxhdGUgbWF0Y2g9Ii8iPgogICAgPGRlcGFydG1lbnRzPgogICAgICA8eHNsOm1lcmdlPgogICAgICAgIDx4c2w6bWVyZ2Utc291cmNlIG5hbWU9ImVtcHMiCiAgICAgICAgICBzZWxlY3Q9ImRvYygnZW1wbG95ZWVzLnhtbCcpL2VtcGxveWVlcy9lbXAiPgogICAgICAgICAgPHhzbDptZXJnZS1rZXkgc2VsZWN0PSJAZGVwdCIgb3JkZXI9ImFzY2VuZGluZyIvPgogICAgICAgIDwveHNsOm1lcmdlLXNvdXJjZT4KICAgICAgICA8eHNsOm1lcmdlLXNvdXJjZSBuYW1lPSJzYWxzIgogICAgICAgICAgc2VsZWN0PSJkb2MoJ3NhbGFyaWVzLnhtbCcpL3NhbGFyaWVzL3NhbCI-CiAgICAgICAgICA8eHNsOm1lcmdlLWtleSBzZWxlY3Q9IkBkZXB0IiBvcmRlcj0iYXNjZW5kaW5nIi8-CiAgICAgICAgPC94c2w6bWVyZ2Utc291cmNlPgogICAgICAgIDx4c2w6bWVyZ2UtYWN0aW9uPgogICAgICAgICAgPGRlcHQgbmFtZT0ie2N1cnJlbnQtbWVyZ2Uta2V5KCl9Ij4KICAgICAgICAgICAgPHhzbDpmb3ItZWFjaCBzZWxlY3Q9ImN1cnJlbnQtbWVyZ2UtZ3JvdXAoJ2VtcHMnKSI-CiAgICAgICAgICAgICAgPGVtcGxveWVlIG5hbWU9IntAbmFtZX0iLz4KICAgICAgICAgICAgPC94c2w6Zm9yLWVhY2g-CiAgICAgICAgICAgIDx4c2w6Zm9yLWVhY2ggc2VsZWN0PSJjdXJyZW50LW1lcmdlLWdyb3VwKCdzYWxzJykiPgogICAgICAgICAgICAgIDxzYWxhcnkgYW1vdW50PSJ7QGFtb3VudH0iLz4KICAgICAgICAgICAgPC94c2w6Zm9yLWVhY2g-CiAgICAgICAgICA8L2RlcHQ-CiAgICAgICAgPC94c2w6bWVyZ2UtYWN0aW9uPgogICAgICA8L3hzbDptZXJnZT4KICAgIDwvZGVwYXJ0bWVudHM-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHJvb3QvPg&version=3.0"
---

## Description

`current-merge-key()` returns the value of the merge key for the current group being processed inside an `xsl:merge-action` block. When `xsl:merge` groups items from one or more sources by their computed key, `current-merge-key()` provides the key value shared by all items in the current group.

The returned value is an atomic value or a sequence of atomic values corresponding to the `xsl:merge-key` expressions declared in the merge sources. When multiple keys are declared (composite keys), the function returns a sequence of values — one per key component — in declaration order.

`current-merge-key()` is the merge equivalent of `current-grouping-key()` from `xsl:for-each-group`.

## Parameters

This function takes no parameters.

## Return value

`xs:anyAtomicType+` — the merge key value(s) for the current group.

## Examples

### Displaying the merge key in output

**Input XML (employees.xml):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<employees>
  <emp dept="HR" name="Alice"/>
  <emp dept="IT" name="Bob"/>
  <emp dept="HR" name="Carol"/>
</employees>
```

**Input XML (salaries.xml):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<salaries>
  <sal dept="HR" amount="50000"/>
  <sal dept="IT" amount="75000"/>
</salaries>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <departments>
      <xsl:merge>
        <xsl:merge-source name="emps"
          select="doc('employees.xml')/employees/emp">
          <xsl:merge-key select="@dept" order="ascending"/>
        </xsl:merge-source>
        <xsl:merge-source name="sals"
          select="doc('salaries.xml')/salaries/sal">
          <xsl:merge-key select="@dept" order="ascending"/>
        </xsl:merge-source>
        <xsl:merge-action>
          <dept name="{current-merge-key()}">
            <xsl:for-each select="current-merge-group('emps')">
              <employee name="{@name}"/>
            </xsl:for-each>
            <xsl:for-each select="current-merge-group('sals')">
              <salary amount="{@amount}"/>
            </xsl:for-each>
          </dept>
        </xsl:merge-action>
      </xsl:merge>
    </departments>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<departments>
  <dept name="HR">
    <employee name="Alice"/>
    <employee name="Carol"/>
    <salary amount="50000"/>
  </dept>
  <dept name="IT">
    <employee name="Bob"/>
    <salary amount="75000"/>
  </dept>
</departments>
```

### Using the key in a conditional

**Stylesheet snippet:**
```xml
<xsl:merge-action>
  <xsl:if test="current-merge-key() = 'IT'">
    <tech-dept>
      <xsl:copy-of select="current-merge-group()"/>
    </tech-dept>
  </xsl:if>
</xsl:merge-action>
```

## Notes

- `current-merge-key()` is only valid inside the `xsl:merge-action` element.
- For composite merge keys (multiple `xsl:merge-key` declarations), the function returns a sequence of atomic values in declaration order.
- The key type is determined by the key expression; string, numeric, date, and other atomic types are all supported.
- This function is the merge counterpart to `current-grouping-key()` used with `xsl:for-each-group`.

## See also

- [current-merge-group()](../xpath-current-merge-group)
- [xsl:use-accumulators](../xsl-use-accumulators)
