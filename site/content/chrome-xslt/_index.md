---
title: "XSLT after Chrome removes it"
seoTitle: "XSLT after Chrome 158: what broke on 17 November 2026, and what to do"
description: "Chrome 158 removed native XSLT on 17 November 2026. How to view pages that now show raw XML, what stopped working, and the three migration paths — with a place to run your stylesheets outside the browser."
lastmod: 2026-11-22T00:00:00Z
date: 2026-09-18T00:00:00Z
tags: ["xslt", "chrome", "deprecation", "migration"]
---

On **17 November 2026** Chrome 158 removed native XSLT. Two things stopped working: the `XSLTProcessor` JavaScript API, and the `<?xml-stylesheet?>` processing instruction that made a browser render an XML document through a stylesheet. Firefox and WebKit have said they will follow.

This is the index for everything on the subject. Start with whichever describes you.

## "A page shows raw XML, or says it cannot be formatted"

The message reads *"This document cannot be formatted as intended. It uses XSLT, which the browser does not support."* Nothing is wrong with your computer. How to see the page again, and what to change if the site is yours:

→ [This document cannot be formatted as intended: Chrome's XSLT message](/blog/chrome-xslt/document-cannot-be-formatted/)

## "I want the extension that fixes it"

XSLT Polyfill is the free extension Chrome's message points at. How to install it in Chrome, Edge and Firefox, and what it cannot do:

→ [The XSLT Polyfill extension](/blog/chrome-xslt/xslt-polyfill-extension/)

## "Chrome showed me a banner about XSLT"

That banner was the warning before the removal; Chrome 158 replaced it with the message above. What it meant, and what to do if the site is yours:

→ [This site uses XSLT: what Chrome's banner means](/blog/chrome-xslt/this-site-uses-xslt-warning/)

## "I need to know whether this affects me"

Most sites are unaffected: XSLT runs in about 0.02% of page loads. The ones that are affected tend to be RSS and sitemap files with a stylesheet attached, intranet reports rendered client-side, and documentation toolchains. Who breaks, what it looks like when it does, and the honest trade-offs between a WASM polyfill, moving the transformation to the server, and precompiling at build time:

→ [Chrome is removing XSLT: what breaks and what to do](/blog/posts/chrome-removing-xslt-what-to-do/)

## "My RSS feed has a stylesheet on it"

This is the most common single case, and the least dangerous — a feed with `<?xml-stylesheet?>` keeps working as a feed. Only the human-readable rendering goes away:

→ [Your RSS feed's stylesheet stopped rendering](/blog/chrome-xslt/rss-feed-stylesheet/)

## "I want to check my stylesheets still work"

Whatever path you pick, the transformation stops being the browser's job and becomes yours. That means running your stylesheets against a real processor. [XSLT Playground](https://xsltplayground.com/) runs XSLT 1.0, 2.0 and 3.0 on Saxon and XSLTC server-side, so it is a straight check of whether a stylesheet written for the browser still does what you think it does — and the 1.0 stylesheets written for `XSLTProcessor` are exactly the ones worth re-checking, because browser XSLT was always 1.0 and slightly its own dialect.
