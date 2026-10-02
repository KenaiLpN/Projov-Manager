import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { writeFile } from "node:fs/promises";
import test from "node:test";

Object.assign(process.env, { NODE_ENV: "production" });
process.env.DATABASE_URL = "mysql://security_fixture:dummy@127.0.0.1:1/no_database";
process.env.JWT_SECRET = randomBytes(32).toString("hex");
process.env.COOKIE_SECRET = randomBytes(32).toString("hex");
process.env.LOGIN_PROXY_SECRET = randomBytes(32).toString("hex");
process.env.BLOCKED_IPS = "";
process.env.TRUSTED_PROXY_CIDRS = "";

test("every registered business route rejects unauthenticated requests before database access", async (t) => {
  const calls: string[] = [];
  const deny = (label: string) => new Proxy(() => undefined, {
    get: (_, key) => key === "then" ? undefined : deny(`${label}.${String(key)}`),
    apply: () => { calls.push(label); throw new Error("Database access forbidden in authentication sweep"); },
  });
  Object.assign(globalThis, { prisma: deny("prisma") });
  const { logger } = await import("../apps/api/src/lib/logger");
  for (const key of Object.keys(logger.auth) as (keyof typeof logger.auth)[]) t.mock.method(logger.auth, key, () => undefined);
  t.mock.method(logger, "request", () => undefined);
  t.mock.method(logger, "audit", () => undefined);
  t.mock.method(logger, "error", () => undefined);
  const { createApp } = await import("../apps/api/src/app");
  const app = createApp();
  app.log.level = "silent";
  t.after(() => app.close());
  const publicPaths = new Set(["/", "/health", "/login", "/primeiro-acesso", "/forgot-password", "/reset-password"]);
  const routes = new Map<string, { method: string; route: string }>();
  app.addHook("onRoute", (route) => {
    for (const method of Array.isArray(route.method) ? route.method : [route.method]) {
      if (method !== "OPTIONS" && !publicPaths.has(route.url)) routes.set(`${method} ${route.url}`, { method, route: route.url });
    }
  });
  await app.ready();
  assert.ok(routes.size > 200, "Coverage must include the full registered API, not only a few sample endpoints");
  const results: { method: string; route: string; status: number }[] = [];
  let index = 0;
  for (const { method, route } of routes.values()) {
    const url = route.replace(/:[A-Za-z_][A-Za-z0-9_]*/g, "1").replace(/\*/g, "probe");
    const remoteAddress = `198.18.${Math.floor(index / 250)}.${index % 250 + 1}`;
    index++;
    const response = await app.inject({ method: method as "GET", url, remoteAddress,
      ...(["POST", "PUT", "PATCH"].includes(method) ? { payload: {} } : {}),
    });
    results.push({ method, route, status: response.statusCode });
    assert.equal(response.statusCode, 401, `${method} ${route}`);
  }
  assert.deepEqual(calls, [], "The sweep must never reach a real or fake business operation");
  if (process.env.SECURITY_ROUTE_REPORT) await writeFile(process.env.SECURITY_ROUTE_REPORT, JSON.stringify({
    scope: "Registered business routes: anonymous requests, real Fastify hooks, database disabled", checked: results.length, results,
  }, null, 2) + "\n");
  t.diagnostic(`${results.length} registered method/route pairs returned 401; zero database operations.`);
});
