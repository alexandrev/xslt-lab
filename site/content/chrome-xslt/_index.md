---
title: "XSLT after Chrome removes it"
seoTitle: "XSLT after Chrome 158: what breaks on 17 November 2026, and what to do"
description: "Chrome 158 removes native XSLT on 17 November 2026. What stops working, how to tell whether you are affected, and the three migration paths — with a place to run your stylesheets outside the browser today."
date: 2026-09-18T00:00:00Z
tags: ["xslt", "chrome", "deprecation", "migration"]
---

On **17 November 2026** Chrome 158 removes native XSLT. Two things stop working: the `XSLTProcessor` JavaScript API, and the `<?xml-stylesheet?>` processing instruction that makes a browser render an XML document through a stylesheet. Firefox and WebKit have said they will follow.

This is the index for everything on the subject. Start with whichever describes you.

## "I just saw a warning in the console"

If Chrome showed you **"This site uses XSLT; that functionality is being removed from Chrome"**, that is the deprecation warning, not an error — the page still works today. What it means, how long you have, and how to find the code that triggered it:

→ [This site uses XSLT: what Chrome's warning means](/blog/chrome-xslt/this-site-uses-xslt-warning/)

## "I need to know whether this affects me"

Most sites are unaffected: XSLT runs in about 0.02% of page loads. The ones that are affected tend to be RSS and sitemap files with a stylesheet attached, intranet reports rendered client-side, and documentation toolchains. Who breaks, what it looks like when it does, and the honest trade-offs between a WASM polyfill, moving the transformation to the server, and precompiling at build time:

→ [Chrome is removing XSLT: what breaks and what to do](/blog/posts/chrome-removing-xslt-what-to-do/)

## "My RSS feed has a stylesheet on it"

This is the most common single case, and the least dangerous — a feed with `<?xml-stylesheet?>` keeps working as a feed. Only the human-readable rendering goes away:

→ [Your RSS feed's stylesheet stops rendering](/blog/chrome-xslt/rss-feed-stylesheet/)

## "I want to check my stylesheets still work"

Whatever path you pick, the transformation stops being the browser's job and becomes yours. That means running your stylesheets against a real processor. [XSLT Playground](https://xsltplayground.com/) runs XSLT 1.0, 2.0 and 3.0 on Saxon and XSLTC server-side, so it is a straight check of whether a stylesheet written for the browser still does what you think it does — and the 1.0 stylesheets written for `XSLTProcessor` are exactly the ones worth re-checking, because browser XSLT was always 1.0 and slightly its own dialect.
