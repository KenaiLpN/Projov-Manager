// Bounded, read-only probes. No passwords, state changes, data extraction or load testing.
import { writeFile } from "node:fs/promises";

const origin = new URL(process.argv[2] || "http://localhost:3000").origin;
if (!["https://prosis.digital", "http://localhost:3000"].includes(origin)) {
  throw new Error("Target must be the explicitly authorized deployment or local development server.");
}
const report = { time: new Date().toISOString(), origin, scope: "Unauthenticated, bounded GET probes", results: [] };
const fakeToken = `${Buffer.from('{"alg":"none","typ":"JWT"}').toString("base64url")}.${Buffer.from(JSON.stringify({
  sub: "security-probe", nome: "Security probe", role: "DEV", tokenTipo: "DESENVOLVEDOR", tipoAcesso: "USUARIO", exp: Math.floor(Date.now() / 1000) + 60,
})).toString("base64url")}.fake`;
const checks = [
  ["/login", {}], ["/api/proxy/health", {}], ["/.env", {}], ["/.env.local", {}],
  ["/apps/api/.env", {}], ["/.git/config", {}], ["/package.json", {}],
  ["/api/proxy/docs", {}], ["/api/proxy/users", {}], ["/home", {}],
  ["/home", { cookie: `token=${fakeToken}` }],
  ["/api/proxy/users", { cookie: `token=${fakeToken}` }],
  ["/login?probe=%3Cscript%3Ewindow.__security_probe%3D1%3C%2Fscript%3E", {}],
];
for (const [route, headers] of checks) {
  try {
    const response = await fetch(`${origin}${route}`, { headers, redirect: "manual", signal: AbortSignal.timeout(20000) });
    const reader = response.body?.getReader();
    let bytes = 0, body = "";
    if (reader) for (;;) {
      const part = await reader.read();
      if (part.done) break;
      bytes += part.value.length;
      if (bytes > 2_000_000) { await reader.cancel(); break; }
      body += new TextDecoder().decode(part.value);
    }
    const csp = response.headers.get("content-security-policy") || "";
    const scripts = [...body.matchAll(/<script\b([^>]*)>/gi)];
    const result = {
      path: route.split("?")[0], variant: headers.cookie ? "forged-token" : route.includes("?") ? "inert-xss-marker" : "anonymous",
      status: response.status, contentType: response.headers.get("content-type"), bytes,
      redirectedToLogin: (response.headers.get("location") || "").includes("/login"),
      potentialEnvFile: /^(?:DATABASE_URL|JWT_SECRET|SMTP_PASS|COOKIE_SECRET)\s*=/m.test(body),
      potentialGitConfig: /\[core\][\s\S]*repositoryformatversion/.test(body),
      cacheControl: response.headers.get("cache-control"),
      securityHeaders: {
        csp: Boolean(csp), nonce: /'nonce-/.test(csp), unsafeEval: csp.includes("'unsafe-eval'"),
        hsts: Boolean(response.headers.get("strict-transport-security")),
        noSniff: response.headers.get("x-content-type-options") === "nosniff",
        frameDenied: response.headers.get("x-frame-options") === "DENY",
      },
      ...(route.startsWith("/login") ? { scripts: scripts.length, scriptsWithNonce: scripts.filter((script) => /\bnonce=/.test(script[1])).length } : {}),
    };
    report.results.push(result);
  } catch (error) {
    report.results.push({ path: route.split("?")[0], error: error.name });
  }
  await new Promise((resolve) => setTimeout(resolve, 150));
}
if (process.argv[3]) await writeFile(process.argv[3], JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
