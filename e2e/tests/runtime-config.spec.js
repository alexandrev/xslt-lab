// 2026-10-01: entrypoint.sh never escaped a single-line value, so any runtime
// setting containing a quote (a JSON sponsor) produced an env.js that did not
// parse — and with it the whole runtime configuration was lost.
import { test, expect } from "@playwright/test";
import { SPONSOR_FRONTEND, direct } from "./helpers.js";

for (const [name, base] of [["default", ""], ["with a JSON sponsor", SPONSOR_FRONTEND]]) {
  test(`env.js is valid JavaScript (${name})`, async ({ request, baseURL }) => {
    const res = await request.get(direct((base || baseURL) + "/env.js"));
    expect(res.ok()).toBeTruthy();
    const window = {};
    new Function("window", await res.text())(window);
    expect(typeof window.env).toBe("object");
    if (base) expect(JSON.parse(window.env.VITE_SPONSOR).name).toBeTruthy();
  });
}
