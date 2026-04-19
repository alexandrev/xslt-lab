---
title: "unparsed-entity-uri()"
description: "Returns the URI of an unparsed entity declared in the DTD of the source document, given the entity's name."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "node function"
syntax: "unparsed-entity-uri(name)"
tags: ["xslt", "reference", "xpath", "xslt1"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjEuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0iaHRtbCIgaW5kZW50PSJ5ZXMiLz4KCiAgPHhzbDp0ZW1wbGF0ZSBtYXRjaD0iL2NhdGFsb2ciPgogICAgPGh0bWw-PGJvZHk-CiAgICAgIDx4c2w6Zm9yLWVhY2ggc2VsZWN0PSJwcm9kdWN0Ij4KICAgICAgICA8ZGl2PgogICAgICAgICAgPHA-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9IkBuYW1lIi8-PC9wPgogICAgICAgICAgPGltZyBzcmM9Int1bnBhcnNlZC1lbnRpdHktdXJpKEBpbWFnZSl9IiBhbHQ9IntAbmFtZX0iLz4KICAgICAgICA8L2Rpdj4KICAgICAgPC94c2w6Zm9yLWVhY2g-CiAgICA8L2JvZHk-PC9odG1sPgogIDwveHNsOnRlbXBsYXRlPgo8L3hzbDpzdHlsZXNoZWV0Pg&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHJvb3QvPg&version=1.0"
---

## Description

`unparsed-entity-uri()` retrieves the system identifier (URI) of an unparsed entity declared in the DTD of the source document. Unparsed entities are a DTD mechanism for embedding references to non-XML resources — typically binary files such as images, audio, or video — inside an XML document using `ENTITY` and `NOTATION` declarations.

Given the entity name (a string), the function returns the entity's system identifier URI as declared in the DTD. If no unparsed entity with that name exists in the document's DTD, the function returns the empty string `""`.

This function is rarely needed in modern XML processing. DTD-based unparsed entities have largely been superseded by direct URI references in attribute values or XLink. However, `unparsed-entity-uri()` remains the correct tool when processing legacy documents that rely on this mechanism.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | xs:string | Yes | The name of the unparsed entity as declared in the DTD. |

## Return value

`xs:string` — the system identifier URI of the unparsed entity, or `""` if not found.

## Examples

### Retrieve an image URI from an unparsed entity

**Input XML (with DTD):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE catalog [
  <!NOTATION JPEG SYSTEM "image/jpeg">
  <!ENTITY photo1 SYSTEM "images/photo1.jpg" NDATA JPEG>
  <!ENTITY photo2 SYSTEM "images/photo2.jpg" NDATA JPEG>
  <!ELEMENT catalog (product+)>
  <!ELEMENT product EMPTY>
  <!ATTLIST product name CDATA #REQUIRED image ENTITY #REQUIRED>
]>
<catalog>
  <product name="Widget" image="photo1"/>
  <product name="Gadget" image="photo2"/>
</catalog>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" indent="yes"/>

  <xsl:template match="/catalog">
    <html><body>
      <xsl:for-each select="product">
        <div>
          <p><xsl:value-of select="@name"/></p>
          <img src="{unparsed-entity-uri(@image)}" alt="{@name}"/>
        </div>
      </xsl:for-each>
    </body></html>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```html
<html><body>
  <div>
    <p>Widget</p>
    <img src="images/photo1.jpg" alt="Widget"/>
  </div>
  <div>
    <p>Gadget</p>
    <img src="images/photo2.jpg" alt="Gadget"/>
  </div>
</body></html>
```

### Guard against missing entity

**Input XML (with DTD as above):**

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/catalog">
    <results>
      <xsl:for-each select="product">
        <xsl:variable name="uri" select="unparsed-entity-uri(@image)"/>
        <product name="{@name}">
          <xsl:choose>
            <xsl:when test="$uri != ''">
              <image src="{$uri}"/>
            </xsl:when>
            <xsl:otherwise>
              <image src="placeholder.jpg"/>
            </xsl:otherwise>
          </xsl:choose>
        </product>
      </xsl:for-each>
    </results>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- The function only works when the source document is accompanied by a parsed DTD that includes the relevant `ENTITY` and `NOTATION` declarations.
- If the XML processor is not validating or has not read the DTD, unparsed entity declarations may not be available, and the function will return `""`.
- `unparsed-entity-uri()` is scoped to the **context document** only. It looks up entities in the DTD of the document containing the context node, not the stylesheet or any other loaded document.
- In XSLT 2.0+, the function is available as `fn:unparsed-entity-uri()` with the same semantics. A companion function `fn:unparsed-entity-public-id()` was added to retrieve the public identifier.
- Modern XML workflows rarely use unparsed entities. For new designs, prefer storing URIs directly in attributes without DTD entity indirection.

## See also

- [document()](../xpath-document)
- [id()](../xpath-id)
