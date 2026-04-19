---
title: "path()"
description: "Returns a string that is a valid XPath expression identifying the path from the root to the node."
date: 2026-04-19T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "node function"
syntax: "path(node?)"
tags: ["xslt", "reference", "xpath", "xslt3"]
---

## Description

`path()` returns a string representation of the absolute path from the document root to the given node. The returned string uses positional predicates to make the path unambiguous — for example `/doc/section[2]/para[1]`. The string is a valid XPath expression that, when evaluated in the context of the same document, would select the same node.

When called without arguments, the function uses the context node. The result uses namespace-prefixed element and attribute names when necessary, with prefixes drawn from the in-scope namespace bindings. The exact form of the path is implementation-defined but must be a syntactically valid XPath location path.

`path()` is most useful for diagnostics, error messages, and audit trails that need to record which specific node triggered a condition.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `node` | node()? | No | The node for which to compute the path. Defaults to the context node if omitted. |

## Return value

`xs:string?` — a string containing a valid absolute XPath path expression for the node, or the empty sequence if the argument is the empty sequence.

## Examples

### Logging node paths during validation

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <product>
    <price>-10</price>
  </product>
  <product>
    <price>25</price>
  </product>
</catalog>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/catalog">
    <validation>
      <xsl:for-each select="product/price[. &lt; 0]">
        <error path="{path()}" value="{.}">Negative price detected</error>
      </xsl:for-each>
    </validation>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<validation>
  <error path="/catalog/product[1]/price[1]" value="-10">Negative price detected</error>
</validation>
```

### Generating a path for a specific node

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>

  <xsl:template match="/catalog">
    <xsl:value-of select="path(product[2]/price)"/>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```
/catalog/product[2]/price[1]
```

## Notes

- The format of the returned string is implementation-defined. Saxon uses positional predicates of the form `[n]` to disambiguate siblings.
- `path()` applied to the document node returns the string `"/"`.
- `path()` applied to an attribute node includes `@attributeName` notation.
- For human-readable diagnostics, `path()` is preferable to constructing the path manually because it handles namespaces and position correctly.

## See also

- [has-children()](../xpath-has-children)
- [innermost()](../xpath-innermost)
- [outermost()](../xpath-outermost)
- [trace()](../xpath-trace)
