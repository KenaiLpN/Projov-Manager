import type {} from "../apps/api/src/@types/fastify-jwt";
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createHmac, createHash } from "node:crypto";
import { createRequire } from "node:module";
import path from "node:path";
import { AccountAttemptLimiter, hasDuplicateJsonKeys, hasDuplicateQueryKeys, trustedProxyConfiguration } from "../apps/api/src/lib/requestSecurity";

// No real environment, database, SMTP server or public website is used by this suite.
const testSecret = "security-test-only-hmac-key-32-characters-minimum";
const proxySecret = "security-test-only-proxy-key-32-characters-minimum";
const requireApi = createRequire(path.resolve("apps/api/package.json"));
const bcrypt = requireApi("bcryptjs") as typeof import("../apps/api/node_modules/bcryptjs");
type MockArgs = { where: Record<string, unknown>; data: Record<string, unknown> };
type MockMethod = (args: MockArgs) => Promise<unknown>;
const methods = new Map<string, MockMethod>();
const databaseCalls: string[] = [];
const emails: { to: string; html: string }[] = [];
const fakePrisma = new Proxy({}, {
  get: (_target, table: string) => new Proxy({}, {
    get: (_delegate, method: string) => async (args: MockArgs) => {
      const key = `${table}.${method}`;
      databaseCalls.push(key);
      const operation = methods.get(key);
      if (!operation) throw new Error(`Unexpected database operation in isolated test: ${key}`);
      return operation(args);
    },
  }),
});
let createApp: typeof import("../apps/api/src/app").createApp;
let restoreMail: () => void;
let restoreError: () => void;

before(async () => {
  Object.assign(process.env, { NODE_ENV: "production" });
  process.env.JWT_SECRET = testSecret;
  process.env.COOKIE_SECRET = "security-test-only-cookie-secret-32-characters";
  process.env.LOGIN_PROXY_SECRET = proxySecret;
  process.env.DATABASE_URL = "mysql://test:test@127.0.0.1:9/isolated_test_never_connected";
  process.env.FRONTEND_URL = "https://security-test.invalid";
  process.env.SMTP_HOST = "smtp.security-test.invalid";
  process.env.SMTP_USER = "security-test@invalid.test";
  process.env.SMTP_PASS = "security-test-only-smtp-password";
  delete process.env.TRUSTED_PROXY_CIDRS;
  delete process.env.BLOCKED_IPS;
  (globalThis as unknown as { prisma: unknown }).prisma = fakePrisma;
  const mailer = requireApi("nodemailer");
  const originalTransport = mailer.createTransport;
  mailer.createTransport = () => ({ sendMail: async (message: { to: string; html: string }) => {
    emails.push(message);
    return { messageId: "isolated-test" };
  }, close: () => undefined });
  restoreMail = () => { mailer.createTransport = originalTransport; };
  const originalError = console.error;
  console.error = () => undefined;
  restoreError = () => { console.error = originalError; };
  const { logger } = await import("../apps/api/src/lib/logger");
  logger.request = () => undefined;
  logger.audit = () => undefined;
  logger.error = () => undefined;
  logger.auth.tokenInvalid = () => undefined;
  ({ createApp } = await import("../apps/api/src/app"));
});
after(() => { restoreMail?.(); restoreError?.(); });

async function fixture() {
  methods.clear(); databaseCalls.length = 0; emails.length = 0;
  const app = createApp();
  app.log.level = "silent";
  app.register(async (instance) => {
    instance.get("/_security", async (request) => ({ ip: request.ip }));
    instance.get("/_failure", async () => { throw new Error("INTERNAL_SECRET_CANARY"); });
  });
  await app.ready();
  return app;
}
function sessionPayload() {
  return { sub: "TEST", nome: "Security test", role: "A", tokenTipo: "USUARIO_ADMINISTRADOR", tipoAcesso: "USUARIO", exp: Math.floor(Date.now() / 1000) + 300 };
}
function signedToken(algorithm: string, payload = sessionPayload(), key = testSecret) {
  const header = Buffer.from(JSON.stringify({ alg: algorithm, typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = algorithm === "none" ? "" : createHmac(algorithm === "HS384" ? "sha384" : "sha256", key).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${signature}`;
}
const trustedHeaders = { "x-prosis-login-secret": proxySecret };

test("JWT: rejects unsigned, wrong algorithm, forged, expired and reset tokens; accepts HS256", async () => {
  const app = await fixture();
  try {
    const reset = app.jwt.sign({ purpose: "password-reset", email: "security-test@invalid.test" }, { expiresIn: "1h" });
    const invalid = [signedToken("none"), signedToken("HS384"), signedToken("RS256"), signedToken("HS256", sessionPayload(), "wrong-key"), signedToken("HS256", { ...sessionPayload(), exp: 1 }), reset];
    for (const token of invalid) {
      const result = await app.inject({ url: "/_security", cookies: { token } });
      assert.equal(result.statusCode, 401);
    }
    const valid = await app.inject({ url: "/_security", cookies: { token: signedToken("HS256") } });
    assert.equal(valid.statusCode, 200);
    assert.equal(valid.headers["cache-control"], "no-store");
    assert.equal(valid.headers["x-content-type-options"], "nosniff");
    assert.deepEqual(databaseCalls, []);
  } finally { await app.close(); }
});

test("duplicate JSON/query keys and prototype pollution fail before database operations", async () => {
  const app = await fixture();
  try {
    for (const payload of ['{"UsuCodigo":"first","UsuCodigo":"second"}', '{"UsuCodigo":"first","\\u0055suCodigo":"second"}', '{"nested":{"role":"A","role":"DEV"}}', '{"__proto__":{"admin":true}}']) {
      const result = await app.inject({ method: "POST", url: "/login", headers: { ...trustedHeaders, "content-type": "application/json" }, payload });
      assert.equal(result.statusCode, 400);
    }
    const result = await app.inject({ url: "/health?id=1&%69d=2" });
    assert.equal(result.statusCode, 400);
    assert.deepEqual(databaseCalls, []);
    assert.equal(hasDuplicateJsonKeys('{"a":[{"id":1},{"id":2}],"b":"id: \\\""}'), false);
    assert.equal(hasDuplicateQueryKeys("/test?a=1&b=2"), false);
  } finally { await app.close(); }
});

test("forged X-Forwarded-For cannot rotate the direct-login IP limiter", async () => {
  const app = await fixture();
  try {
    const statuses: number[] = [];
    for (let index = 0; index < 6; index++) {
      const result = await app.inject({ method: "POST", url: "/login", remoteAddress: "192.0.2.10", headers: { "x-forwarded-for": `198.51.100.${index + 1}` }, payload: { UsuCodigo: "TEST", senha: "invalid" } });
      statuses.push(result.statusCode);
    }
    assert.deepEqual(statuses, [404, 404, 404, 404, 404, 429]);
    const result = await app.inject({ url: "/_security", remoteAddress: "192.0.2.20", headers: { "x-forwarded-for": "203.0.113.200" }, cookies: { token: signedToken("HS256") } });
    assert.equal(result.json().ip, "192.0.2.20");
    assert.deepEqual(databaseCalls, []);
  } finally { await app.close(); }
});

test("account bucket blocks distributed guessing and successful login clears only its own bucket", async () => {
  const app = await fixture();
  try {
    methods.set("cA_Usuarios.findFirst", async () => null);
    for (let index = 0; index < 6; index++) {
      const result = await app.inject({ method: "POST", url: "/login", remoteAddress: `192.0.2.${index + 1}`, headers: trustedHeaders, payload: { UsuCodigo: index % 2 ? "test" : "TEST", senha: "invalid", tipoAcesso: "USUARIO" } });
      assert.equal(result.statusCode, index < 5 ? 401 : 429);
    }
    assert.equal(databaseCalls.length, 5);
    const hash = await bcrypt.hash("test-password-12", 10);
    methods.set("cA_Usuarios.findFirst", async ({ where }) => ({ UsuCodigo: where.UsuCodigo, UsuSenha: hash, UsuTipo: "A", UsuNome: "Security test" }));
    const tokens = new Set<string>();
    for (let index = 0; index < 7; index++) {
      const result = await app.inject({ method: "POST", url: "/login", headers: trustedHeaders, payload: { UsuCodigo: "OTHER", senha: "test-password-12" } });
      assert.equal(result.statusCode, 200);
      tokens.add(result.json().token);
      const cookie = String(result.headers["set-cookie"]);
      assert.match(cookie, /HttpOnly/); assert.match(cookie, /Secure/); assert.match(cookie, /SameSite=Lax/);
      assert.doesNotMatch(cookie, /SameSite=None/);
    }
    assert.equal(tokens.size, 7, "new jti prevents identical sessions even within a second");
  } finally { await app.close(); }
});

test("first access requires email ownership; old CPF/password takeover payload is rejected", async () => {
  const app = await fixture();
  try {
    const old = await app.inject({ method: "POST", url: "/primeiro-acesso", payload: { UsuCodigo: "12345678901", senha: "attacker-password", tipoAcesso: "APRENDIZ" } });
    assert.equal(old.statusCode, 400);
    assert.deepEqual(databaseCalls, []);
    methods.set("cA_Aprendiz.findFirst", async ({ where }) => where.Apr_Email === "registered@invalid.test" ? { Apr_Codigo: BigInt(123), Apr_Email: "registered@invalid.test", Apr_senha: null } : null);
    const existent = await app.inject({ method: "POST", url: "/primeiro-acesso", payload: { email: "registered@invalid.test", tipoAcesso: "APRENDIZ" } });
    const missing = await app.inject({ method: "POST", url: "/primeiro-acesso", payload: { email: "absent@invalid.test", tipoAcesso: "APRENDIZ" } });
    assert.equal(existent.statusCode, 200); assert.equal(missing.statusCode, 200);
    assert.deepEqual(existent.json(), missing.json());
    assert.equal(emails.length, 1);
    assert.equal(emails[0].to, "registered@invalid.test");
    assert.equal(databaseCalls.some((entry) => /update|create/.test(entry)), false);
    const token = emails[0].html.match(/reset-password\?token=([^"<]+)/)?.[1];
    assert.ok(token);
    const decoded = app.jwt.verify<{ purpose: string; resetSubject: string }>(token);
    assert.equal(decoded.purpose, "password-reset"); assert.equal(decoded.resetSubject, "123");
    assert.equal((await app.inject({ url: "/_security", cookies: { token } })).statusCode, 401);
  } finally { await app.close(); }
});

test("password reset compare-and-set prevents concurrent replay and validates purpose/byte limits", async () => {
  const app = await fixture();
  try {
    let current: string | null = null;
    let changes = 0;
    methods.set("cA_Aprendiz.findUnique", async () => ({ Apr_senha: current }));
    methods.set("cA_Aprendiz.updateMany", async ({ where, data }) => {
      if (current !== where.Apr_senha) return { count: 0 };
      current = String(data.Apr_senha); changes++;
      return { count: 1 };
    });
    const claims = { purpose: "password-reset", email: "registered@invalid.test", tipoAcesso: "APRENDIZ", resetSubject: "123", passwordFingerprint: createHash("sha256").update("NO_PASSWORD").digest("hex") };
    const token = app.jwt.sign(claims, { expiresIn: "1h" });
    const results = await Promise.all([1, 2].map((index) => app.inject({ method: "POST", url: "/reset-password", remoteAddress: `192.0.2.${index}`, payload: { token, newPassword: "replacement-password" } })));
    assert.deepEqual(results.map((result) => result.statusCode).sort(), [200, 400]);
    assert.equal(changes, 1);
    assert.equal(await bcrypt.compare("replacement-password", current!), true);
    const badPurpose = app.jwt.sign({ ...claims, purpose: "session" }, { expiresIn: "1h" });
    assert.equal((await app.inject({ method: "POST", url: "/reset-password", remoteAddress: "192.0.2.3", payload: { token: badPurpose, newPassword: "replacement-password" } })).statusCode, 400);
    assert.equal((await app.inject({ method: "POST", url: "/reset-password", remoteAddress: "192.0.2.4", payload: { token, newPassword: "é".repeat(40) } })).statusCode, 400);
    assert.equal(changes, 1);
  } finally { await app.close(); }
});

test("unknown, passwordless and wrong-password accounts have the same public response", async () => {
  const app = await fixture();
  try {
    const hash = await bcrypt.hash("correct-password", 10);
    methods.set("cA_Usuarios.findFirst", async ({ where }) => where.UsuCodigo === "unknown" ? null : { UsuCodigo: where.UsuCodigo, UsuSenha: where.UsuCodigo === "empty" ? "" : hash, UsuTipo: "A" });
    const responses = [];
    for (const UsuCodigo of ["unknown", "empty", "existing"]) {
      const response = await app.inject({ method: "POST", url: "/login", headers: trustedHeaders, payload: { UsuCodigo, senha: "incorrect" } });
      assert.equal(response.statusCode, 401); responses.push(response.json());
    }
    assert.deepEqual(responses[0], responses[1]); assert.deepEqual(responses[1], responses[2]);
  } finally { await app.close(); }
});

test("CSRF, internal error disclosure and generic request flooding are blocked", async () => {
  const app = await fixture();
  try {
    for (const headers of [{ origin: "https://attacker.invalid" }, { "sec-fetch-site": "cross-site" }, { referer: "https://attacker.invalid/page" }]) {
      const result = await app.inject({ method: "POST", url: "/logout", headers, cookies: { token: signedToken("HS256") } });
      assert.equal(result.statusCode, 403);
    }
    const failure = await app.inject({ url: "/_failure", cookies: { token: signedToken("HS256") } });
    assert.equal(failure.statusCode, 500); assert.doesNotMatch(failure.body, /INTERNAL_SECRET_CANARY/);
    let status = 0;
    for (let index = 0; index < 301; index++) {
      const response = await app.inject({ url: "/_security", remoteAddress: "192.0.2.150", cookies: { token: signedToken("HS256") } });
      status = response.statusCode;
    }
    assert.equal(status, 429);
    assert.deepEqual(databaseCalls, []);
  } finally { await app.close(); }
});

test("rate limit expiry is bounded and proxy trust rejects catch-all networks", () => {
  assert.equal(trustedProxyConfiguration(""), false);
  assert.deepEqual(trustedProxyConfiguration("127.0.0.1,10.0.1.0/24"), ["127.0.0.1", "10.0.1.0/24"]);
  for (const value of ["true", "*", "0.0.0.0/0", "::/0"]) assert.throws(() => trustedProxyConfiguration(value));
  const limiter = new AccountAttemptLimiter();
  assert.equal(limiter.consume("login", "TEST", 1, 1000, 100), 0);
  assert.equal(limiter.consume("login", "test", 1, 1000, 101), 1);
  assert.equal(limiter.consume("login", "test", 1, 1000, 1101), 0);
});
