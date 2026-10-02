import assert from "node:assert/strict";
import { createHmac, randomBytes } from "node:crypto";
import { test } from "node:test";
import { NextRequest } from "next/server";
import { verifySessionToken } from "../src/lib/security/sessionToken";
import { isTrustedBrowserMutation, readLimitedBody } from "../src/lib/security/browserRequest";
import { middleware } from "../src/middleware";
import { POST as logout } from "../src/app/api/auth/logout/route";

const secret = randomBytes(32).toString("hex");
const claims = { sub: "synthetic-user", nome: "Security test", role: "A", tokenTipo: "USUARIO_ADMINISTRADOR", tipoAcesso: "USUARIO", exp: Math.floor(Date.now() / 1000) + 60 };
function sign(payload: unknown = claims, algorithm = "HS256", key = secret) {
  const body = [Buffer.from(JSON.stringify({ alg: algorithm, typ: "JWT" })).toString("base64url"), Buffer.from(JSON.stringify(payload)).toString("base64url")].join(".");
  return `${body}.${createHmac(algorithm === "HS384" ? "sha384" : "sha256", key).update(body).digest("base64url")}`;
}

test("JWT accepts only a signed, current, coherent HS256 session", async () => {
  assert.equal((await verifySessionToken(sign(), secret))?.sub, claims.sub);
  for (const token of [sign(claims, "none"), sign(claims, "RS256"), sign(claims, "HS384"), sign(claims, "HS256", "attacker-key"), "malformed", "x".repeat(8193)]) {
    assert.equal(await verifySessionToken(token, secret), null);
  }
  assert.equal(await verifySessionToken(sign(), undefined), null);
  for (const payload of [
    { ...claims, exp: 1 }, { ...claims, exp: "9999999999" },
    { ...claims, nbf: claims.exp + 3600 }, { ...claims, role: "D" },
    { ...claims, role: "APRENDIZ" }, { email: "test@example.invalid", exp: claims.exp },
  ]) assert.equal(await verifySessionToken(sign(payload), secret), null);
});

test("middleware denies a forged session and supplies a nonce to both Next and browser", async () => {
  const oldSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = secret;
  try {
    const forged = await middleware(new NextRequest("http://localhost:3000/home", { headers: { cookie: `token=${sign(claims, "none")}` } }));
    assert.equal(forged.status, 307);
    assert.equal(new URL(forged.headers.get("location")!).pathname, "/login");
    const valid = await middleware(new NextRequest("http://localhost:3000/home", { headers: { cookie: `token=${sign()}` } }));
    assert.equal(valid.status, 200);
    assert.match(valid.headers.get("content-security-policy")!, /'nonce-/);
    assert.equal(valid.headers.get("x-middleware-request-content-security-policy"), valid.headers.get("content-security-policy"));
    assert.match(valid.headers.get("cache-control")!, /no-store/);
  } finally {
    if (oldSecret === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = oldSecret;
  }
});

test("browser mutations reject forged origins, cross-site and invalid origins", () => {
  const make = (headers: Record<string, string>) => new Request("https://prosis.digital/api/auth/login", { method: "POST", headers });
  assert.equal(isTrustedBrowserMutation(make({ origin: "https://prosis.digital" })), true);
  assert.equal(isTrustedBrowserMutation(make({ origin: "https://evil.invalid" })), false);
  assert.equal(isTrustedBrowserMutation(make({ origin: "null" })), false);
  assert.equal(isTrustedBrowserMutation(make({ "sec-fetch-site": "cross-site" })), false);
  assert.equal(isTrustedBrowserMutation(make({ referer: "https://evil.invalid/x" })), false);
});

test("login streaming body limit cannot be bypassed by absent content-length", async () => {
  assert.equal(await readLimitedBody(new Request("http://localhost/", { method: "POST", body: '{"x":1,"x":2}' })), '{"x":1,"x":2}');
  await assert.rejects(() => readLimitedBody(new Request("http://localhost/", { method: "POST", body: "a".repeat(16385) })), RangeError);
  await assert.rejects(() => readLimitedBody(new Request("http://localhost/", { method: "POST", body: "small", headers: { "content-length": "100000" } })), RangeError);
});

test("cross-site logout cannot clear the session cookie", async () => {
  const blocked = await logout(new Request("http://localhost:3000/api/auth/logout", { method: "POST", headers: { origin: "https://evil.invalid" } }));
  assert.equal(blocked.status, 403);
  assert.equal(blocked.headers.get("set-cookie"), null);
  const allowed = await logout(new Request("http://localhost:3000/api/auth/logout", { method: "POST", headers: { origin: "http://localhost:3000" } }));
  assert.equal(allowed.status, 200);
  assert.match(allowed.headers.get("set-cookie")!, /HttpOnly/);
  assert.match(allowed.headers.get("set-cookie")!, /Max-Age=0/);
});
