---
title: "XSLT template matching explained with examples"
description: "How XSLT template matching works: priorities, conflict resolution, modes, and default templates. With practical examples."
date: 2025-03-05T00:00:00Z
tags: ["xslt", "templates", "xpath"]
---

Template matching is the mechanism that drives every XSLT transformation. Understanding how the processor selects templates — and what happens when multiple templates could match — is the difference between a stylesheet that works reliably and one that produces surprising output. This post covers everything you need to know.

## How match patterns work

When the processor visits a node, it evaluates every template's `match` attribute as an XPath pattern. A pattern is a restricted form of XPath that tests properties of a node rather than selecting nodes from a starting point. If the pattern is satisfied, that template is a candidate.

```xml
<xsl:template match="book">        <!-- matches any book element -->
<xsl:template match="catalog/book"> <!-- matches book that is a child of catalog -->
<xsl:template match="book[@id]">   <!-- matches book elements with an id attribute -->
<xsl:template match="*">           <!-- matches any element -->
<xsl:template match="text()">      <!-- matches any text node -->
<xsl:template match="@*">          <!-- matches any attribute -->
```

## Priority and conflict resolution

More than one template can match the same node. The processor resolves the conflict using priority. Each pattern has a default priority calculated by the spec:

| Pattern type | Default priority |
|---|---|
| `node()` or `*` | -0.5 |
| `element-name` | 0 |
| `prefix:element-name` | 0 |
| `a/b` (path) | 0.5 |
| `a[predicate]` | 0.5 |
| `@attr` | 0 |

More specific patterns automatically get higher priority. You can override this with the `priority` attribute:

```xml
<xsl:template match="book" priority="1">
  <!-- this wins over a match="book" template at default priority -->
</xsl:template>
```

If two templates have equal computed priority, the processor signals an error (or picks the last one, depending on implementation — Saxon issues an error by default). Always assign explicit priorities when you have competing templates.

## The built-in templates

XSLT has default templates for every node type. If no explicit template matches a node, the built-in fires. For elements and the document root, the built-in calls `apply-templates` on all children. For text and attribute nodes, it outputs the string value.

This means that without any templates at all, the processor will walk the entire tree and output all text content. Understanding this explains why simple stylesheets can produce unexpected extra text — a text node matched nothing explicit, and the built-in output it.

To suppress text output globally, add:

```xml
<xsl:template match="text()"/>
```

This overrides the built-in with an empty template, producing no output for text nodes that are not handled elsewhere.

## Modes

Modes let you have multiple templates for the same node that serve different purposes. A mode is a named context for a set of templates.

```xml
<!-- Default mode: output a summary row -->
<xsl:template match="book">
  <tr><td><xsl:value-of select="title"/></td></tr>
</xsl:template>

<!-- detail mode: output a full card -->
<xsl:template match="book" mode="detail">
  <div class="card">
    <h2><xsl:value-of select="title"/></h2>
    <p><xsl:value-of select="description"/></p>
  </div>
</xsl:template>
```

Call with mode:

```xml
<xsl:apply-templates select="catalog/book" mode="detail"/>
```

Modes are especially useful when you need to process the same nodes in multiple places in the output with different logic each time.

## apply-templates vs for-each

Both iterate over a set of nodes. The difference is that `apply-templates` dispatches to the best matching template for each node, while `for-each` stays in the current context and does not do template lookup.

Use `apply-templates` when you want polymorphism — different node types handled differently. Use `for-each` when you are doing a simple iteration over a homogeneous set and do not need dispatch.

```xml
<!-- apply-templates: each node can match a different template -->
<xsl:apply-templates select="items/*"/>

<!-- for-each: all items handled inline -->
<xsl:for-each select="items/item">
  <li><xsl:value-of select="."/></li>
</xsl:for-each>
```

## Testing patterns in XSLT Playground

[XSLT Playground](https://xsltplayground.com) is a fast way to experiment with matching rules. Paste a stylesheet with multiple competing templates and check which one fires. Add `<xsl:message select="name()"/>` in each template to trace which one the processor picks. The trace panel shows all messages in order so you can follow the dispatch chain.

Solid understanding of template matching pays off every time you work on a complex stylesheet. Once you know how priorities and built-ins interact, most "unexpected output" bugs become obvious.
