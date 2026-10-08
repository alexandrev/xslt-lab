// Shared helpers for the end-to-end tests.
import { expect } from "@playwright/test";

const host = process.env.E2E_HOST || "xsltplayground.test";
export const SPONSOR_FRONTEND = process.env.E2E_SPONSOR_URL || `http://${host}:3001`;
export const BACKEND = process.env.E2E_BACKEND_URL || "http://localhost:8000";

// The test hostname is mapped to 127.0.0.1 inside the browser only (see the
// config); requests made from Node need the address itself.
export const direct = (url) => url.replace("//xsltplayground.test", "//127.0.0.1");

// Analytics and ad networks never see a test run: analytics requests are
// dropped, and ad decisions are counted and then dropped, so the tests can
// assert on how often the app asks for an ad without serving or billing one.
// The EthicalAds client script itself loads normally: without it the app
// never asks.
export async function isolate(page) {
  const adDecisions = [];
  const t0 = Date.now();
  await page.route(
    /(googletagmanager\.com|google-analytics\.com|clarity\.ms|umami\.alexandre-vazquez\.cloud|media\.ethicalads\.io\/abp)/,
    (route) => route.abort(),
  );
  await page.route(/server\.ethicalads\.io\/api\/v1\/decision/, (route) => {
    adDecisions.push({ at: (Date.now() - t0) / 1000, url: route.request().url() });
    return route.abort();
  });
  return { adDecisions, t0 };
}

// Every POST /transform the page sends, with its time and body.
export function trackTransforms(page) {
  const sent = [];
  page.on("request", (r) => {
    if (r.method() === "POST" && new URL(r.url()).pathname === "/transform") {
      sent.push({ at: Date.now(), body: r.postDataJSON() });
    }
  });
  return sent;
}

export async function openEditor(page, path = "/") {
  await page.goto(path);
  await expect(page.locator(".xslt-editor-wrap .cm-content")).toBeVisible();
}

// Calls the backend directly, as the editor would.
export async function transform(request, backend, { xslt, version, input = "<a/>", trace = false }) {
  const res = await request.post(`${backend}/transform`, {
    data: { xslt, version, trace, parameters: { input } },
    timeout: 20_000,
  });
  return { status: res.status(), body: await res.json() };
}

export const stylesheet = (version, body = "<r/>") =>
  `<xsl:stylesheet version="${version}" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"><xsl:template match="/">${body}</xsl:template></xsl:stylesheet>`;

// URL-safe base64, the encoding the editor reads from ?xslt=.
export const b64url = (s) => Buffer.from(s, "utf8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
