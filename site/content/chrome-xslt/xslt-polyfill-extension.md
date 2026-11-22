---
title: "The XSLT Polyfill extension: view XSLT pages in Chrome again"
seoTitle: "XSLT Polyfill extension for Chrome — what it does and how to install it"
description: "Chrome 158 removed XSLT, and pages that use it now show raw XML. The free XSLT Polyfill extension brings them back. What it does, how to install it in Chrome, Edge and Firefox, what it cannot do, and when you need something else."
date: 2026-11-22T00:00:00Z
tags: ["xslt", "chrome", "polyfill", "deprecation"]
---

**Quick answer:** XSLT Polyfill is a free browser extension that puts XSLT back for the pages that need it. Install it from the [Chrome Web Store](https://chromewebstore.google.com/detail/xslt-polyfill/hlahhpnhgficldhfioiafojgdhcppklm), reload the page, and it renders the way it used to. It is the extension Chrome's own message points to, and the one [Chrome's documentation](https://developer.chrome.com/docs/web-platform/deprecating-xslt) recommends. There is also a [Firefox version](https://addons.mozilla.org/en-GB/firefox/addon/xslt-polyfill/).

## Why you need it

Since Chrome 158 (17 November 2026), Chrome no longer runs XSLT. Pages built with it show [raw XML and a message saying the browser does not support XSLT](/blog/chrome-xslt/document-cannot-be-formatted/), and web apps that called `XSLTProcessor` break. The extension restores both.

## Installing it

1. Open the [XSLT Polyfill page on the Chrome Web Store](https://chromewebstore.google.com/detail/xslt-polyfill/hlahhpnhgficldhfioiafojgdhcppklm) and click **Add to Chrome**.
2. Reload the page that was showing raw XML.

**Edge, Brave and other Chromium browsers** install it from the same Chrome Web Store page (Edge asks you to allow extensions from other stores first). **Firefox** has its own listing on [addons.mozilla.org](https://addons.mozilla.org/en-GB/firefox/addon/xslt-polyfill/).

If your browser is managed by your company, extension installs may be blocked. In that case ask IT about the extension or about the `XSLTEnabled` policy, which keeps native XSLT on until August 2027.

## What it does

It adds the [XSLT polyfill](https://github.com/mfreed7/xslt_polyfill), a JavaScript replacement for the browser's old XSLT engine, to XML documents:

- **Pages with `<?xml-stylesheet?>`** (styled feeds, sitemaps, XML reports): it fetches the XML again, applies the stylesheet and shows the result.
- **Pages that call `XSLTProcessor`** from JavaScript get the API back, so the code runs as before.

Every other page is left alone. The transformation happens in your browser, and the [source code is public](https://github.com/mfreed7/xslt_extension) under a BSD licence.

## What it cannot do

Its README lists the edge cases, and they matter mostly for internal tools:

- **It reloads the XML with a GET request.** A page that came from a form submission (POST) can come back different, or not at all.
- **Scripts inside the XML run before the transform**, which native XSLT never did.
- **Script-created `about:blank` iframes** don't get `XSLTProcessor`.
- **It is XSLT 1.0**, like the browsers were. Stylesheets that never worked in a browser won't start working now.

## When the extension is not the answer

It fixes the page for the person who installs it. Everyone else still sees raw XML. If the site is yours, you need a fix that works for all your visitors: moving the transformation to the server, precompiling at build time, or including the polyfill script in the page yourself. [Chrome removed XSLT: what breaks and what to do](/blog/posts/chrome-removing-xslt-what-to-do/) compares the three.

Whichever you choose, the stylesheet ends up running outside Chrome, so check that it still does what you expect: [run it in XSLT Playground](https://xsltplayground.com/?template=xml-to-html) against a real XSLT 1.0 processor and compare the output with what the browser used to show.
