export function isTrustedBrowserMutation(request: Request, publicOrigin = process.env.FRONTEND_URL): boolean {
  const site = request.headers.get("sec-fetch-site");
  if (site === "cross-site") return false;
  const source = request.headers.get("origin") || request.headers.get("referer");
  if (!source) return !site || site === "same-origin" || site === "none";
  try {
    const origin = new URL(source).origin;
    // Hosting proxies may expose an internal URL to Next. FRONTEND_URL is an
    // explicit operator-controlled origin, never a forwarded header from a client.
    return origin === new URL(request.url).origin || Boolean(publicOrigin && origin === new URL(publicOrigin).origin);
  } catch {
    return false;
  }
}

// Count actual bytes, including chunked requests, before parsing or forwarding.
export async function readLimitedBody(request: Request, maxBytes = 16_384): Promise<string> {
  if (Number(request.headers.get("content-length")) > maxBytes) throw new RangeError("Body too large");
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new RangeError("Body too large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}
