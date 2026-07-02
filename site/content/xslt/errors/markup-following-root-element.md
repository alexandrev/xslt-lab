---
title: "Markup in the document following the root element must be well-formed"
errorMessage: "org.xml.sax.SAXParseException: The markup in the document following the root element must be well-formed."
description: "There is content after the closing tag of the root element — usually two XML documents concatenated, or a fragment list without a wrapper element."
date: 2026-07-02T00:00:00Z
category: "XML parsing error"
versionLabel: "All versions"
tags: ["xslt", "reference", "errors", "xml"]
---

## What it means

An XML document has exactly **one** root element. Once the parser sees the root close, only comments, PIs and whitespace may follow. Any further element or text raises this error.

## Common causes

1. **Concatenated documents.** Log pipelines and batch exports often append documents into one file:

```xml
<order id="1">…</order>
<order id="2">…</order>   <!-- error: second root -->
```

2. **A fragment list** returned by an API or built by string concatenation, with no enclosing element.
3. **Leftover text/markup** after the root when hand-editing a file.

## How to fix it

- Wrap the fragments in a single container element:

```xml
<orders>
  <order id="1">…</order>
  <order id="2">…</order>
</orders>
```

- If you cannot change the producer, wrap at read time (`concat('<wrap>', $raw, '</wrap>')` before parsing with `parse-xml()` in XSLT 3.0, or wrap in your ingestion code).
- In [XSLT Playground](https://xsltplayground.com/), paste the wrapped version and your stylesheet can iterate `wrap/order` normally.
