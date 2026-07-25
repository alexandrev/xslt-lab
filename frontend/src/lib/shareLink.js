// Compact share links.
//
// The original format puts the stylesheet and the input XML in the URL as plain
// base64 (?xslt=…&xml=…), which for a real stylesheet produces links too long to
// paste into a chat or an issue. Stylesheets are highly repetitive XML, so
// gzipping before base64 shrinks them several-fold.
//
// Compression is only available asynchronously (CompressionStream), so the
// compact form lives behind its own ?c= parameter: old links keep decoding
// synchronously on startup, and only the new ones take the async path.

const HAS_COMPRESSION =
  typeof CompressionStream !== "undefined" && typeof DecompressionStream !== "undefined";

export function supportsCompactLinks() {
  return HAS_COMPRESSION;
}

function bytesToBase64Url(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(str) {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 ? "=".repeat(4 - (padded.length % 4)) : "";
  const binary = atob(padded + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function streamThrough(bytes, transform) {
  const source = new ReadableStream({
    start(controller) {
      controller.enqueue(bytes);
      controller.close();
    },
  });
  const reader = source.pipeThrough(transform).getReader();
  const chunks = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.length;
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

/** Compress a workspace payload into a URL-safe string. Null if unsupported. */
export async function encodeCompact(payload) {
  if (!HAS_COMPRESSION) return null;
  const json = new TextEncoder().encode(JSON.stringify(payload));
  const gz = await streamThrough(json, new CompressionStream("gzip"));
  return bytesToBase64Url(gz);
}

/** Inverse of encodeCompact. Returns null when the value can't be read. */
export async function decodeCompact(value) {
  if (!HAS_COMPRESSION || !value) return null;
  try {
    const bytes = base64UrlToBytes(value);
    const raw = await streamThrough(bytes, new DecompressionStream("gzip"));
    const parsed = JSON.parse(new TextDecoder().decode(raw));
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

/** Workspace → the minimal object a share link needs to carry. */
export function toSharePayload(tab) {
  return {
    x: tab.xslt,
    v: tab.version || "1.0",
    ...(tab.name ? { t: tab.name } : {}),
    ...(tab.params?.length
      ? { p: tab.params.filter((p) => p?.value).map((p) => [p.name, p.value]) }
      : {}),
  };
}

/** Inverse of toSharePayload: a share payload → workspace overrides. */
export function fromSharePayload(payload) {
  if (!payload || typeof payload.x !== "string") return null;
  const params = Array.isArray(payload.p)
    ? payload.p
        .filter((entry) => Array.isArray(entry) && typeof entry[1] === "string")
        .map(([name, value]) => ({
          name: typeof name === "string" && name ? name : "input",
          value,
          open: true,
        }))
    : [];
  return {
    xslt: payload.x,
    version: typeof payload.v === "string" ? payload.v : "1.0",
    ...(typeof payload.t === "string" ? { name: payload.t } : {}),
    ...(params.length ? { params } : {}),
  };
}
