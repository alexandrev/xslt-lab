---
title: "xsl:comment"
description: "Generates an XML comment node in the result tree with content computed from the element body."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "element"
syntax: '<xsl:comment>'
tags: ["xslt", "reference", "xslt1"]
---

## Description

`xsl:comment` inserts an XML comment (`<!-- ... -->`) into the result tree. The content of the generated comment is the string value produced by instantiating the element body, which may include `xsl:value-of` and `xsl:text` instructions as well as literal text.

Comments are primarily used in HTML/XML output for debugging information, conditional comments (legacy IE technique), or generator attribution lines. They are preserved in the output document and visible to anyone reading the raw markup.

`xsl:comment` takes no attributes. The text produced by its content must not contain the sequence `--` (two hyphens), as that is illegal inside an XML comment. If the generated content would produce `--`, the processor raises an error.

## Attributes

`xsl:comment` takes no attributes.

## Examples

### Adding a generated-by comment

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<report date="2025-12-01"><title>Summary</title></report>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/report">
    <xsl:comment>
      <xsl:text>Generated from report dated </xsl:text>
      <xsl:value-of select="@date"/>
    </xsl:comment>
    <output>
      <xsl:value-of select="title"/>
    </output>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<!--Generated from report dated 2025-12-01-->
<output>Summary</output>
```

### HTML conditional comment (legacy)

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<page><content>Hello</content></page>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" indent="yes"/>

  <xsl:template match="/page">
    <html>
      <head>
        <xsl:comment>[if lt IE 9]&gt;&lt;script src="html5shiv.js"&gt;&lt;/script&gt;&lt;![endif]</xsl:comment>
      </head>
      <body>
        <p><xsl:value-of select="content"/></p>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```html
<html>
<head><!--[if lt IE 9]><script src="html5shiv.js"></script><![endif]--></head>
<body><p>Hello</p></body>
</html>
```

## Notes

- The string `--` inside a comment is forbidden by the XML specification. The XSLT processor must raise a dynamic error if the generated comment text contains this sequence. To include a single hyphen safely, write it as a literal hyphen; to include `--` you must redesign the content.
- Comments are not visible when using `xsl:copy-of` on a node that excludes the comment axis, and they do not contribute to XPath string values.
- If the output method is `text`, comments are silently ignored — they exist only in tree-oriented output methods (`xml`, `html`).
- `xsl:comment` content must resolve to text only; you cannot nest element-producing instructions inside it.

## See also

- [xsl:processing-instruction](../xsl-processing-instruction)
- [xsl:text](../xsl-text)
- [xsl:output](../xsl-output)
