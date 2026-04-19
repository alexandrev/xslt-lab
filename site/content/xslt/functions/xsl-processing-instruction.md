---
title: "xsl:processing-instruction"
description: "Generates an XML processing instruction in the result tree with a computed name and body content."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "element"
syntax: '<xsl:processing-instruction name="name">'
tags: ["xslt", "reference", "xslt1"]
---

## Description

`xsl:processing-instruction` inserts a processing instruction (PI) node into the result tree. A processing instruction has the form `<?target data?>`, where `target` is the PI name and `data` is the optional text body.

Processing instructions are used to embed application-specific directives inside XML documents. Common examples include `<?xml-stylesheet?>` for attaching stylesheets, `<?php ... ?>` for PHP code, and `<?xml-model?>` for schema association. In XSLT transformations, they are typically used to produce these directives programmatically based on source data.

The `name` attribute is an attribute value template, so the PI target name can be computed. The content of `xsl:processing-instruction` produces the data portion of the PI as a string; it may include `xsl:value-of`, `xsl:text`, and variables.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | AVT (NCName) | Yes | The processing instruction target name. Must be a valid XML NCName and must not be `xml` (case-insensitive). |

## Examples

### Adding an xml-stylesheet PI

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<docs>
  <doc theme="dark">Manual</doc>
  <doc theme="light">Guide</doc>
</docs>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/docs">
    <xsl:apply-templates select="doc"/>
  </xsl:template>

  <xsl:template match="doc">
    <xsl:processing-instruction name="xml-stylesheet">
      <xsl:text>href="</xsl:text>
      <xsl:value-of select="@theme"/>
      <xsl:text>.css" type="text/css"</xsl:text>
    </xsl:processing-instruction>
    <document><xsl:value-of select="."/></document>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<?xml-stylesheet href="dark.css" type="text/css"?>
<document>Manual</document>
<?xml-stylesheet href="light.css" type="text/css"?>
<document>Guide</document>
```

### Computed PI name from source data

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<config>
  <directive app="php">echo "hello";</directive>
</config>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/config">
    <output>
      <xsl:for-each select="directive">
        <xsl:processing-instruction name="{@app}">
          <xsl:value-of select="."/>
        </xsl:processing-instruction>
      </xsl:for-each>
    </output>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<output>
  <?php echo "hello";?>
</output>
```

## Notes

- The PI name must not be `xml` or `XML` in any capitalisation — this is reserved by the XML specification. Processors must reject it with an error.
- The data portion of the PI must not contain `?>`, as that would prematurely end the PI. If generated content might include this sequence, guard against it or transform the input.
- When the output method is `text`, processing instructions are silently omitted.
- PIs are not visible in rendered HTML, but they appear in the raw source and are accessible via the DOM in browsers.

## See also

- [xsl:comment](../xsl-comment)
- [xsl:output](../xsl-output)
- [xsl:text](../xsl-text)
