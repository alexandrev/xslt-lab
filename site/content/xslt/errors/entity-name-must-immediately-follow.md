---
title: "The entity name must immediately follow the '&'"
errorMessage: "org.xml.sax.SAXParseException: The entity name must immediately follow the '&' in the entity reference."
description: "A raw ampersand appears in the XML. In XML, & always starts an entity reference — literal ampersands must be written as &amp;, and only 5 named entities exist."
date: 2026-07-02T00:00:00Z
category: "XML parsing error"
versionLabel: "All versions"
tags: ["xslt", "reference", "errors", "xml"]
---

## What it means

In XML, `&` **always** begins an entity reference like `&amp;` or `&#160;`. A bare `&` followed by a space, `=` or anything that is not a valid entity name breaks parsing immediately.

## Common causes

1. **URLs with query strings** — `<link>https://x.com/?a=1&b=2</link>`. The `&b` is read as the start of an entity.
2. **Company names and free text** — `<name>Johnson & Johnson</name>`.
3. **HTML named entities that XML does not define.** XML predefines only **five**: `&amp;` `&lt;` `&gt;` `&apos;` `&quot;`. Anything else (`&nbsp;`, `&eacute;`, `&copy;`…) is an error unless declared in a DTD.

## How to fix it

- Escape literal ampersands: `a=1&amp;b=2`, `Johnson &amp; Johnson`.
- Replace HTML entities with numeric character references: `&nbsp;` → `&#160;`, `&copy;` → `&#169;`, `&eacute;` → `&#233;`.
- For blocks full of special characters, wrap them in CDATA: `<![CDATA[a=1&b=2 <raw>]]>`.
- Remember the fix belongs in the **producer** of the XML: whatever generated the file failed to escape output. Verify the corrected input in [XSLT Playground](https://xsltplayground.com/).
