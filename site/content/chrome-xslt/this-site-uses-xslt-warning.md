---
title: "This site uses XSLT: what Chrome's banner means"
seoTitle: "\"This site uses XSLT; that functionality is being removed\" — what to do"
description: "Chrome showed a banner saying this site uses XSLT and the page may stop displaying correctly? Nothing is wrong with your computer. Which extension keeps the page working, and what to change if the site is yours."
date: 2026-09-18T00:00:00Z
lastmod: 2026-09-28T00:00:00Z
tags: ["xslt", "chrome", "deprecation", "migration"]
---

This is the banner Chrome shows across the top of certain pages:

> This site uses XSLT; that functionality is being removed from this browser very soon. When that happens, this page will likely no longer display correctly. You might be able to install a browser extension that allows you to continue viewing it. Otherwise, you should contact the maintainer of the site for further information.

**Quick answer:** nothing is wrong with your computer, and it is not a virus or a scam. Chrome is dropping an old feature called XSLT that this page uses to display itself. The page keeps working until **Chrome 158 on 17 November 2026**. After that, you can keep it working by installing the free [XSLT Polyfill extension](https://chromewebstore.google.com/detail/xslt-polyfill/hlahhpnhgficldhfioiafojgdhcppklm), the one [Chrome's own documentation](https://developer.chrome.com/docs/web-platform/deprecating-xslt) points to.

What you do next depends on whose site it is.

## You were just visiting the site

You don't need to do anything today. The page works the same as before, and the banner is only a heads-up. You have three options, in order of effort:

1. **Install the extension.** [XSLT Polyfill](https://chromewebstore.google.com/detail/xslt-polyfill/hlahhpnhgficldhfioiafojgdhcppklm) puts back the missing feature for the pages that need it and leaves every other page alone. It runs entirely in your browser, sends nothing anywhere, and its [source code is public](https://github.com/mfreed7/xslt_extension). The "install a browser extension" link in the banner leads to the same kind of extension. It is also available [for Firefox](https://addons.mozilla.org/en-GB/firefox/addon/xslt-polyfill/).
2. **Open the page in another browser.** Firefox and Safari still display these pages today.
3. **Tell the site's owner.** If you rely on the page (a university portal, an internal report, a feed you read), send them the link to this page. The fix is on their side, and they have until November.

If the page is something you use at work and your company manages Chrome, your IT department can also keep XSLT switched on through an enterprise policy while the site gets fixed.

After 17 November, if you skip all three, you will see a wall of raw code or plain text where the page used to be. It won't harm your computer. It is simply the page's data without its formatting.

## The site is yours

The banner means Chrome found XSLT on the page. Nothing is broken yet. From Chrome 158 on 17 November 2026 the transformation silently stops happening, and every visitor on Chrome sees the result. You have until then to move it somewhere else.

### What triggered it

Exactly one of two things, and it is worth knowing which:

1. **A `<?xml-stylesheet?>` processing instruction** at the top of an XML document. That line tells a browser to render the XML through a stylesheet. It is typical in RSS and Atom feeds, sitemaps, and older intranet reports served as XML.
2. **A call to `XSLTProcessor` in JavaScript**: `new XSLTProcessor()`, then `importStylesheet()` and `transformToFragment()` or `transformToDocument()`.

Open DevTools on the page: Chrome also logs a deprecation message in the console. If it points at the document itself rather than a script, it is case 1. If it points at a line of JavaScript, it is case 2, and the file and line number are right there.

If the banner appears on a page you did not write, check your dependencies. A lot of XSLT in the wild arrives through a CMS theme, a feed plugin or a documentation toolchain, not through code anyone on the team wrote.

### What actually happens on 17 November

Neither case throws an exception you can catch and fall back from, which is the part that catches people out:

- **`<?xml-stylesheet?>`** is ignored. The browser renders the raw XML tree instead of your styled page. The data is all still there; it just looks like nothing.
- **`XSLTProcessor`** stops existing. `new XSLTProcessor()` raises a `ReferenceError`, so code that builds a fragment and inserts it will fail at that point, and whatever came after it will not run.

The second one is the one to audit for, because a `ReferenceError` in the middle of a rendering function tends to take the rest of the page with it.

### Check which case you are in

In the console, on the page that showed the banner:

```js
// Case 1: is the document itself styled by a stylesheet PI?
[...document.childNodes].some(n => n.nodeType === 7 && n.target === 'xml-stylesheet')

// Case 2: search your scripts (and your dependencies) for the API
// DevTools → Sources → Ctrl/Cmd+Shift+F → "XSLTProcessor"
```

For case 1 you can also open `view-source:` on the URL and look at the first few lines for `<?xml-stylesheet`.

### Buying time

If you cannot migrate before November, Chrome runs an **origin trial** that keeps XSLT working on your origin until Chrome 176 (August 2027). Register the origin and serve the token, and your visitors stop depending on the extension. It postpones the migration; it doesn't replace it.

### What to do about it

The choice depends on which case you are in, and the trade-offs are real enough to deserve their own page: [Chrome is removing XSLT: what breaks and what to do](/blog/posts/chrome-removing-xslt-what-to-do/) covers the WASM polyfill, moving the transformation server-side, and precompiling at build time, with the honest costs of each.

If yours is a feed, the answer is usually smaller than you fear: [your RSS feed's stylesheet stops rendering](/blog/chrome-xslt/rss-feed-stylesheet/), but the feed itself is unaffected.

### First, check the stylesheet still does what you think

Whichever path you take, the transformation moves out of the browser and becomes something you run. That is worth verifying before you plan around it, because browser XSLT is XSLT 1.0 and has its own habits. A stylesheet that worked in Chrome for a decade can turn out to lean on something Chrome was lenient about.

Paste your stylesheet and a sample document into [XSLT Playground](https://xsltplayground.com/?version=1.0) and run it against a real 1.0 processor. If the output matches what the browser produced, your migration is a plumbing exercise. If it doesn't, better to learn that now than in November.
