---
title: "Content is not allowed in prolog"
errorMessage: "org.xml.sax.SAXParseException: Content is not allowed in prolog"
description: "The XML parser found characters before the XML declaration or root element: usually a UTF-8 BOM, stray whitespace/text, or a file that is not XML at all (an HTML error page, for instance)."
date: 2026-07-02T00:00:00Z
category: "XML parsing error"
versionLabel: "All versions"
tags: ["xslt", "reference", "errors", "xml", "java"]
---

## What it means

The *prolog* is everything before the root element. Only the XML declaration, comments, processing instructions and whitespace may appear there. Any other content — even a single invisible byte — triggers this error.

## Common causes

1. **UTF-8 BOM (byte order mark).** Files saved as "UTF-8 with BOM" start with the bytes `EF BB BF`. Many Java parsers reject them when the document is served or concatenated carelessly. Save as UTF-8 *without* BOM.
2. **Stray text before `<?xml`** — a leftover log line, a shell prompt, an HTML comment from a template engine.
3. **The file is not XML at all.** Classic case: your code fetched a URL and got an HTML **error page** (login redirect, 404, proxy error) and then fed it to the XML parser. The parser dies at character 1 of `<!DOCTYPE html>`… or earlier.
4. **Encoding mismatch** — the declaration says `encoding="UTF-8"` but the bytes are UTF-16, so the first bytes are unreadable.

## How to fix it

- Inspect the first bytes with a hex viewer (`xxd file.xml | head -1`) — a BOM shows as `efbb bf`.
- If the XML comes over HTTP, log the raw response before parsing: is it actually XML?
- Re-save the file as UTF-8 without BOM and make sure nothing writes to the stream before the XML declaration.
- Paste the content into [XSLT Playground](https://xsltplayground.com/) — invisible junk becomes obvious when the parser points at line 1, column 1.
