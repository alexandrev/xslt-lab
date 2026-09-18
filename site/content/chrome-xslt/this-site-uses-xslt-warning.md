---
title: "This site uses XSLT: what Chrome's warning means"
seoTitle: "\"This site uses XSLT; that functionality is being removed\" — what Chrome's warning means"
description: "Chrome's console warns that XSLT is being removed. What triggered it, whether anything is broken yet, how to find the code responsible, and what you have to change before 17 November 2026."
date: 2026-09-18T00:00:00Z
tags: ["xslt", "chrome", "deprecation", "migration"]
---

**Quick answer:** nothing is broken yet. This is a deprecation warning, and it means Chrome found XSLT on the page. The feature keeps working until **Chrome 158 on 17 November 2026**, after which the transformation silently stops happening. You have until then to move it somewhere else.

## What triggered it

Exactly one of two things, and it is worth knowing which:

1. **A `<?xml-stylesheet?>` processing instruction** at the top of an XML document — the line that tells a browser to render that XML through a stylesheet. Typical in RSS and Atom feeds, sitemaps, and older intranet reports served as XML.
2. **A call to `XSLTProcessor` in JavaScript** — `new XSLTProcessor()`, then `importStylesheet()` and `transformToFragment()` or `transformToDocument()`.

To find out which, open DevTools and look at what the warning is attached to. If it points at the document itself rather than a script, it is case 1. If it points at a line of JavaScript, it is case 2 — and the file and line number are right there.

If the warning appears on a page you did not write, check your dependencies: a fair amount of XSLT in the wild arrives through a CMS theme, a feed plugin, or a documentation toolchain rather than through code anyone on the team wrote.

## What actually happens on 17 November

Neither case throws an exception you can catch and fall back from, which is the part that catches people out:

- **`<?xml-stylesheet?>`** is ignored. The browser renders the raw XML tree instead of your styled page. The data is all still there; it just looks like nothing.
- **`XSLTProcessor`** stops existing. `new XSLTProcessor()` raises a `ReferenceError`, so code that builds a fragment and inserts it will fail at that point and whatever came after it will not run.

The second one is the one to audit for, because a `ReferenceError` in the middle of a rendering function tends to take the rest of the page with it.

## Am I actually affected?

Test it honestly rather than guessing. In a Chrome that still has XSLT:

```js
// In the console, on the page that warned you
typeof XSLTProcessor        // "function" → case 2, you call it (or a dependency does)
document.querySelector      // then check the document itself for a stylesheet PI
```

For case 1, `view-source:` on the URL and look at the first few lines for `<?xml-stylesheet`.

If neither is present on any page you own, you can ignore the whole thing — XSLT runs in roughly 0.02% of page loads, and the removal is deliberately aimed at a feature almost nobody uses.

## What to do about it

The choice depends on which case you are in, and the trade-offs are real enough to deserve their own page: [Chrome is removing XSLT: what breaks and what to do](/blog/posts/chrome-removing-xslt-what-to-do/) covers the WASM polyfill, moving the transformation server-side, and precompiling at build time, with the honest costs of each.

If yours is a feed, the answer is usually smaller than you fear: [your RSS feed's stylesheet stops rendering](/blog/chrome-xslt/rss-feed-stylesheet/), but the feed itself is unaffected.

## First, check the stylesheet still does what you think

Whichever path you take, the transformation moves out of the browser and becomes something you run. That is worth verifying before you plan around it, because browser XSLT is XSLT 1.0 and has its own habits — a stylesheet that worked in Chrome for a decade can turn out to lean on something Chrome was lenient about.

Paste your stylesheet and a sample document into [XSLT Playground](https://xsltplayground.com/?version=1.0) and run it against a real 1.0 processor. If the output matches what the browser produced, your migration is a plumbing exercise. If it does not, better to learn that now than in November.
