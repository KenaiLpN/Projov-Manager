import { fork } from "node:child_process";
import { existsSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const webPort = Number(process.env.PORT?.trim() || "3000");
const apiPort = Number(process.env.API_PORT?.trim() || "3333");
for (const port of [webPort, apiPort]) {
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("[startup] Porta invalida.");
}
if (webPort === apiPort) throw new Error("[startup] PORT e API_PORT devem ser diferentes.");
for (const entry of [".next/BUILD_ID", "apps/api/dist/server.js"]) {
  if (!existsSync(path.join(rootDir, entry))) throw new Error(`[startup] Arquivo de producao nao encontrado: ${entry}. Execute npm run build.`);
}
process.env.NODE_ENV = "production";
let nextApp;
let handler;
let apiChild;
let stopping = false;
let ready = false;
const server = createServer(async (req, res) => {
  if (!ready || stopping) {
    res.writeHead(503, { "Content-Type": "text/plain; charset=utf-8", "Retry-After": "2" });
    res.end("Aplicacao iniciando. Tente novamente em instantes.");
    return;
  }
  try { await handler(req, res); }
  catch (error) {
    console.error("[startup] Falha ao atender requisicao:", error);
    if (!res.headersSent) res.writeHead(500);
    res.end();
  }
});
async function shutdown(code) {
  if (stopping) return;
  stopping = true;
  ready = false;
  const deadline = setTimeout(() => {
    apiChild?.kill("SIGKILL");
    process.exit(code);
  }, 10000);
  const apiStopped = new Promise((resolve) => {
    if (!apiChild || apiChild.exitCode !== null || apiChild.signalCode !== null) return resolve();
    apiChild.once("close", resolve);
    apiChild.kill("SIGTERM");
  });
  await Promise.allSettled([
    new Promise((resolve) => server.close(resolve)), apiStopped, nextApp?.close(),
  ]);
  clearTimeout(deadline);
  process.exit(code);
}
process.on("SIGTERM", () => void shutdown(0));
process.on("SIGINT", () => void shutdown(0));
server.on("error", (error) => {
  console.error("[startup] Falha no servidor publico:", error);
  void shutdown(1);
});
// Hostinger precisa observar listen() no processo do arquivo de entrada.
// Durante a preparacao do Next, as requisicoes recebem 503 temporario.
server.listen(webPort, "0.0.0.0", () => {
  console.log(`[startup] Servidor publico no processo principal, porta ${webPort}.`);
  void initialize().catch((error) => {
    console.error("[startup] Falha na inicializacao:", error);
    void shutdown(1);
  });
});
async function initialize() {
  console.log("[startup] Iniciando API Fastify...");
  apiChild = fork(path.join(rootDir, "scripts/run-api-production.mjs"), [], {
    cwd: path.join(rootDir, "apps/api"),
    env: { ...process.env, API_PORT: String(apiPort) },
    stdio: ["ignore", "inherit", "inherit", "ipc"], windowsHide: true,
  });
  apiChild.on("error", (error) => {
    console.error("[startup] Falha no processo da API:", error);
    void shutdown(1);
  });
  apiChild.on("close", (code, signal) => {
    if (!stopping) {
      console.error(`[startup] API encerrada inesperadamente (codigo=${code}, sinal=${signal}).`);
      void shutdown(1);
    }
  });
  const { default: next } = await import("next");
  if (stopping) return;
  console.log("[startup] Preparando Next.js no processo principal...");
  nextApp = next({ dev: false, dir: rootDir, hostname: "0.0.0.0", port: webPort, httpServer: server });
  await nextApp.prepare();
  handler = nextApp.getRequestHandler();
  const deadline = Date.now() + 30000;
  while (!stopping && Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${apiPort}/health`, { signal: AbortSignal.timeout(1000) });
      const health = await response.json();
      if (response.ok && health.status === "API Online") {
        ready = true;
        console.log("[startup] Next.js e API Fastify prontos.");
        return;
      }
    } catch { /* A API pode ainda estar carregando os modulos. */ }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  if (!stopping) throw new Error("API nao respondeu ao healthcheck em 30 segundos.");
}
