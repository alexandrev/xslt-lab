---
title: "\"This document cannot be formatted as intended\": Chrome's XSLT message"
seoTitle: "\"This document cannot be formatted as intended. It uses XSLT\" — how to view the page"
description: "Since Chrome 158 (17 November 2026), pages that use XSLT show raw XML and a message saying the browser does not support it. How to view the page again, how companies can switch XSLT back on until August 2027, and what the site's owner has to change."
date: 2026-11-22T00:00:00Z
tags: ["xslt", "chrome", "deprecation", "migration"]
---

Since Chrome 158, released on **17 November 2026**, some pages show this message instead of their usual content:

> This document cannot be formatted as intended. It uses XSLT, which the browser does not support. You might be able to install a browser extension that allows you to view it.

**Quick answer:** nothing is broken on your computer. The page was built with XSLT, an old way of styling XML that Chrome has now removed. The data is still there, only unformatted. To see the page as before, install the free [XSLT Polyfill extension](/blog/chrome-xslt/xslt-polyfill-extension/) and reload. If your company manages Chrome, IT can switch XSLT back on until August 2027 (see below). If the site is yours, [test its stylesheet outside the browser](https://xsltplayground.com/?template=xml-to-html): that is the first step of every fix.

Some older sites show their own wording instead, such as *"XSL transformation is not supported by your browser"*. It is the same problem with the same fixes.

## You only want to see the page

In order of effort:

1. **Install the extension.** [XSLT Polyfill](/blog/chrome-xslt/xslt-polyfill-extension/) puts the missing feature back for XML pages that need it and leaves every other page alone. Reload the page after installing it. It is the extension the message itself is pointing at.
2. **Try another browser.** Firefox and Safari still render many of these pages, though both have said they plan to remove XSLT too, so this is a stopgap.
3. **Tell the site's owner.** The real fix is on their side. Send them the link to this page.

Without any of these, you see the page's raw XML: tags and text with no layout. It is harmless, and reading it directly is sometimes enough to find what you came for.

## Your company depends on the page

Chrome has an enterprise policy, **`XSLTEnabled`**, that keeps XSLT working on managed browsers until **Chrome 176 (17 August 2027)**. After that it stops working too. Your IT department sets it from the [Chrome Enterprise policy list](https://chromeenterprise.google/policies/). There is no supported switch in `chrome://flags` for regular users.

Use that time to get the page fixed, because the policy is a bridge, not a solution.

## The site is yours

Chrome no longer runs XSLT, so the transformation has to happen somewhere else. One of two things triggers the message:

- **A `<?xml-stylesheet?>` line** at the top of an XML document (feeds, sitemaps, reports served as XML). Chrome now shows the raw XML.
- **A call to `XSLTProcessor`** in JavaScript. It no longer exists, so `new XSLTProcessor()` throws `ReferenceError: XSLTProcessor is not defined` and everything after it on that code path stops.

If you need time, Chrome's **origin trial** keeps XSLT working for your visitors on your origin until Chrome 176 (August 2027). Register the origin, serve the token, and nobody needs the extension in the meantime.

The permanent fixes are moving the transformation to the server, precompiling at build time, or shipping a JavaScript polyfill. Their trade-offs are in [Chrome removed XSLT: what breaks and what to do](/blog/posts/chrome-removing-xslt-what-to-do/). If the page is a feed, read [your RSS feed's stylesheet stopped rendering](/blog/chrome-xslt/rss-feed-stylesheet/) first: the fix is usually small.

### Start by running the stylesheet outside the browser

Every fix ends with your stylesheet running on something other than Chrome. Browser XSLT was always XSLT 1.0, with its own tolerances, so check the stylesheet still produces what the browser used to show before you plan around it. [Open XSLT Playground](https://xsltplayground.com/?template=xml-to-html), paste the stylesheet and a sample of the XML, and run it with a real XSLT 1.0 processor. If the output matches, the rest of the migration is plumbing.
