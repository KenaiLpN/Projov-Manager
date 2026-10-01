import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHmac, randomBytes } from "node:crypto";
import { access, cp, mkdtemp, rm } from "node:fs/promises";
import { createConnection, createServer } from "node:net";
import os from "node:os";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const artifactRoot = path.join(projectRoot, ".next", "standalone");
const temporaryPrefix = "prosis-next-deploy-";
const blockedIp = "192.0.2.99";

async function unusedPort() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const { port } = server.address();
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  return port;
}

function portIsOpen(port) {
  return new Promise((resolve) => {
    const socket = createConnection({ host: "127.0.0.1", port });
    const finish = (open) => { socket.destroy(); resolve(open); };
    socket.once("connect", () => finish(true));
    socket.once("error", () => finish(false));
    socket.setTimeout(1000, () => finish(false));
  });
}

function signSession(secret) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    sub: "deployment-test", nome: "Deployment test", role: "A",
    tokenTipo: "USUARIO_ADMINISTRADOR", tipoAcesso: "USUARIO",
    exp: Math.floor(Date.now() / 1000) + 300,
  })).toString("base64url");
  const signature = createHmac("sha256", secret).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${signature}`;
}

async function removeTemporaryArtifact(directory) {
  const absolute = path.resolve(directory);
  assert.equal(path.dirname(absolute), path.resolve(os.tmpdir()), "cleanup must stay inside the system temp directory");
  assert.ok(path.basename(absolute).startsWith(temporaryPrefix), "cleanup must target this test's unique artifact");
  await rm(absolute, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}

test("Next standalone serves the site and API without a second server or database", { timeout: 180000 }, async (t) => {
  await access(path.join(artifactRoot, "server.js")).catch(() => {
    throw new Error("Build the deployment first with npm run build before running npm run test:deploy.");
  });
  const directory = await mkdtemp(path.join(os.tmpdir(), temporaryPrefix));
  let child;
  let childClosed;
  let spawnError;
  let output = "";
  t.after(async () => {
    if (child && child.exitCode === null && child.signalCode === null) {
      child.kill();
      let killTimer;
      try {
        await Promise.race([
          childClosed,
          new Promise((resolve) => {
            killTimer = setTimeout(() => { child.kill("SIGKILL"); resolve(); }, 10000);
          }),
        ]);
      } finally {
        clearTimeout(killTimer);
      }
    }
    if (childClosed) await childClosed;
    await removeTemporaryArtifact(directory);
  });

  // Isolation catches missing traced dependencies and never copies local secrets.
  await cp(artifactRoot, directory, {
    recursive: true,
    dereference: true,
    filter: (source) => {
      const name = path.basename(source).toLowerCase();
      return !name.startsWith(".env") && name !== "logs" && !name.endsWith(".log");
    },
  });
  const port = await unusedPort();
  const origin = `http://127.0.0.1:${port}`;
  const jwtSecret = randomBytes(32).toString("hex");
  const apiPortWasOpen = await portIsOpen(3333);
  const childEnv = {};
  for (const [name, value] of Object.entries(process.env)) {
    if (/^(path|systemroot|windir|comspec|temp|tmp|pathext)$/i.test(name)) childEnv[name] = value;
  }
  Object.assign(childEnv, {
    NODE_ENV: "production", NEXT_TELEMETRY_DISABLED: "1",
    PORT: String(port), HOSTNAME: "127.0.0.1", FRONTEND_URL: origin,
    DATABASE_URL: "mysql://deployment_test:dummy@127.0.0.1:1/deployment_test",
    JWT_SECRET: jwtSecret, COOKIE_SECRET: randomBytes(32).toString("hex"),
    LOGIN_PROXY_SECRET: randomBytes(32).toString("hex"), BLOCKED_IPS: blockedIp,
    DOTENV_CONFIG_PATH: path.join(directory, "deliberately-absent.env"),
  });
  child = spawn(process.execPath, [path.join(directory, "server.js")], {
    cwd: directory, env: childEnv, windowsHide: true, stdio: ["ignore", "pipe", "pipe"],
  });
  childClosed = new Promise((resolve) => child.once("close", resolve));
  child.once("error", (error) => { spawnError = error; });
  const capture = (chunk) => { output = (output + chunk.toString()).slice(-100000); };
  child.stdout.on("data", capture);
  child.stderr.on("data", capture);

  let nextClientIp = 10;
  const request = (route, options = {}) => fetch(`${origin}${route}`, {
    ...options,
    redirect: "manual",
    signal: AbortSignal.timeout(10000),
    headers: { "x-forwarded-for": `198.51.100.${nextClientIp++}`, ...options.headers },
  });
  const jsonPost = (route, ip, headers = {}) => request(route, {
    method: "POST", body: "{}",
    headers: { "content-type": "application/json", "x-forwarded-for": ip, ...headers },
  });
  const assertStatus = async (response, expected) => {
    const body = await response.text();
    assert.equal(response.status, expected, `${response.url}: ${body.slice(0, 500)}`);
    return body;
  };

  const deadline = Date.now() + 60000;
  let ready = false;
  while (Date.now() < deadline) {
    if (spawnError) throw spawnError;
    if (child.exitCode !== null || child.signalCode !== null) throw new Error(`Next exited before readiness:\n${output}`);
    try {
      const response = await request("/login");
      await response.arrayBuffer();
      if (response.status === 200) { ready = true; break; }
    } catch { /* The public server may still be starting. */ }
    await delay(100);
  }
  assert.ok(ready, `Next did not become ready:\n${output}`);

  await t.test("site, API root, query strings and HEAD work in the isolated artifact", async () => {
    const login = await assertStatus(await request("/login"), 200);
    assert.match(login, /<html/i);
    for (const route of ["/api/proxy", "/api/proxy/health", "/api/proxy/health?x=1&encoded=%2F"]) {
      const response = await request(route);
      const body = await assertStatus(response, 200);
      assert.equal(JSON.parse(body).status, "API Online");
      assert.match(response.headers.get("cache-control"), /no-store/);
    }
    assert.equal(await assertStatus(await request("/api/proxy/health", { method: "HEAD" }), 200), "");
  });

  await t.test("protected routes enforce authentication for every CRUD method", async () => {
    for (const [method, route] of [
      ["GET", "/unidade"], ["POST", "/unidade"], ["PUT", "/unidade/1"],
      ["PATCH", "/chamados/1"], ["DELETE", "/unidade/1"],
    ]) {
      const options = method === "GET" ? { method } : {
        method, body: "{}", headers: { "content-type": "application/json" },
      };
      await assertStatus(await request(`/api/proxy${route}`, options), 401);
    }
  });

  await t.test("invalid login bodies reach Fastify validation without a database", async () => {
    await assertStatus(await request("/api/proxy/login", {
      method: "POST", headers: { "content-type": "application/json" }, body: "{",
    }), 400);
    const body = await assertStatus(await jsonPost("/api/proxy/login", "203.0.113.10"), 400);
    assert.match(JSON.parse(body).message, /valida/i);
    await assertStatus(await request("/api/auth/login", {
      method: "POST", headers: { "content-type": "application/json" }, body: "{",
    }), 400);
    const loginBody = await assertStatus(await jsonPost("/api/auth/login", "203.0.113.11", { origin }), 400);
    assert.match(JSON.parse(loginBody).message, /valida/i);
  });

  await t.test("raw proxy preserves body limits and content-type validation", async () => {
    await assertStatus(await request("/api/proxy/login", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ large: "x".repeat(1024 * 1024 + 1) }),
    }), 413);
    await assertStatus(await request("/api/proxy/login", {
      method: "POST", headers: { "content-type": "application/xml" }, body: "<login />",
    }), 415);
  });

  await t.test("both login paths preserve CSRF protection and blocked client IPs", async () => {
    for (const route of ["/api/proxy/login", "/api/auth/login"]) {
      await assertStatus(await jsonPost(route, "203.0.113.20", {
        origin: "https://untrusted.example", "sec-fetch-site": "cross-site",
      }), 403);
      await assertStatus(await jsonPost(route, blockedIp), 403);
    }
  });

  await t.test("rate limiting is shared across login paths and isolated by client IP", async () => {
    for (let attempt = 0; attempt < 6; attempt++) {
      const route = attempt % 2 ? "/api/auth/login" : "/api/proxy/login";
      await assertStatus(await jsonPost(route, "203.0.113.30"), attempt < 5 ? 400 : 429);
    }
    await assertStatus(await jsonPost("/api/auth/login", "203.0.113.31"), 400);
  });

  await t.test("session cookies reach JWT verification and logout preserves Set-Cookie", async () => {
    const token = signSession(jwtSecret);
    const response = await request("/api/proxy/logout", {
      method: "POST", headers: { cookie: `token=${token}` },
    });
    const body = await assertStatus(response, 200);
    assert.match(JSON.parse(body).message, /Logout/);
    const cookies = response.headers.getSetCookie();
    assert.equal(cookies.length, 1);
    assert.match(cookies[0], /^token=;/);
    assert.match(cookies[0], /Max-Age=0/i);
    assert.match(cookies[0], /HttpOnly/i);
    assert.match(cookies[0], /Secure/i);
    await assertStatus(await request("/api/proxy/logout", {
      method: "POST", headers: { cookie: `token=${signSession("wrong-test-secret")}` },
    }), 401);
  });

  await t.test("API health remains available without opening the old API port", async () => {
    await assertStatus(await request("/api/proxy/health"), 200);
    if (apiPortWasOpen) t.diagnostic("Port 3333 was already occupied before this test; its owner was left untouched.");
    else assert.equal(await portIsOpen(3333), false, "Next must not start a listener on API port 3333");
    assert.doesNotMatch(output, /MODULE_NOT_FOUND|ERR_DLOPEN_FAILED|EADDRINUSE|ECONNREFUSED|HTTP Server running on port|Can't reach database server/);
  });
});
