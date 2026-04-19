---
title: "xsl:import-schema"
description: "Imports an XML Schema to enable schema-aware processing, typed variable declarations, and validation of input and output documents."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "element"
syntax: '<xsl:import-schema namespace="uri" schema-location="file.xsd"/>'
tags: ["xslt", "reference", "xslt2"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczp4cz0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiCiAgeG1sbnM6b3JkPSJodHRwOi8vZXhhbXBsZS5jb20vb3JkZXIiPgoKICA8eHNsOmltcG9ydC1zY2hlbWEgbmFtZXNwYWNlPSJodHRwOi8vZXhhbXBsZS5jb20vb3JkZXIiCiAgICAgICAgICAgICAgICAgICAgIHNjaGVtYS1sb2NhdGlvbj0ib3JkZXIueHNkIi8-CgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvIj4KICAgIDx4c2w6dmFyaWFibGUgbmFtZT0idG90YWwiIGFzPSJ4czpkZWNpbWFsIgogICAgICBzZWxlY3Q9InN1bSgvb3JkOm9yZGVyL2l0ZW0vQHByaWNlICogL29yZDpvcmRlci9pdGVtL0BxdHkpIi8-CiAgICA8c3VtbWFyeSB0b3RhbD0ieyR0b3RhbH0iLz4KICA8L3hzbDp0ZW1wbGF0ZT4KPC94c2w6c3R5bGVzaGVldD4&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHJvb3QvPg&version=2.0"
---

## Description

`xsl:import-schema` is a top-level declaration that imports an XML Schema into the stylesheet. Once imported, the schema's type definitions become available for:

- Type annotations in `as` attributes on variables, parameters, and functions.
- Schema-aware matching patterns such as `element(*, xs:integer)`.
- Input validation via `xsl:validate` (Saxon-EE).
- Output validation using the `validation` attribute on result elements.

Schema-aware processing is an optional feature of XSLT 2.0 and requires a schema-aware processor such as Saxon-EE. Saxon-HE and Saxon-PE do not support schema import.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `namespace` | URI | No | The target namespace of the schema to import. Omit for schemas with no target namespace. |
| `schema-location` | URI | No | Hint to the processor about where to find the schema document. |

Content: may contain an inline `xs:schema` element instead of using `schema-location`.

## Return value

No direct output. Populates the in-scope schema definitions for the stylesheet.

## Examples

### Importing a schema and using typed variables

**Schema (`order.xsd`):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
           targetNamespace="http://example.com/order"
           xmlns:ord="http://example.com/order">
  <xs:element name="order">
    <xs:complexType>
      <xs:sequence>
        <xs:element name="item" maxOccurs="unbounded">
          <xs:complexType>
            <xs:attribute name="price" type="xs:decimal" use="required"/>
            <xs:attribute name="qty"   type="xs:integer" use="required"/>
          </xs:complexType>
        </xs:element>
      </xs:sequence>
    </xs:complexType>
  </xs:element>
</xs:schema>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:ord="http://example.com/order">

  <xsl:import-schema namespace="http://example.com/order"
                     schema-location="order.xsd"/>

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="total" as="xs:decimal"
      select="sum(/ord:order/item/@price * /ord:order/item/@qty)"/>
    <summary total="{$total}"/>
  </xsl:template>
</xsl:stylesheet>
```

### Importing a no-namespace schema inline

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:xs="http://www.w3.org/2001/XMLSchema">

  <xsl:import-schema>
    <xs:schema>
      <xs:element name="record">
        <xs:complexType>
          <xs:attribute name="id"   type="xs:integer" use="required"/>
          <xs:attribute name="name" type="xs:string"  use="required"/>
        </xs:complexType>
      </xs:element>
    </xs:schema>
  </xsl:import-schema>

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/record">
    <out id="{@id}" name="{upper-case(@name)}"/>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- `xsl:import-schema` requires a **schema-aware** XSLT 2.0 processor. Saxon-HE does not support this feature.
- The `schema-location` attribute is only a hint; processors may find the schema by namespace alone if they maintain a schema catalog.
- Importing a schema does not automatically validate the source document. Use the `validation` attribute on `xsl:apply-templates` or `xsl:result-document` for validation.
- Multiple schemas may be imported by using several `xsl:import-schema` elements; circular imports are allowed if they mirror valid schema inclusion patterns.

## See also

- [xsl:namespace](../xsl-namespace)
- [xsl:function](../xsl-function)
- [xsl:output](../xsl-output)
