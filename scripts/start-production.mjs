import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const webPort = process.env.PORT?.trim() || "3000";
const apiPort = process.env.API_PORT?.trim() || "3333";
const apiDir = path.join(rootDir, "apps", "api");
const nextEntry = path.join(rootDir, "node_modules", "next", "dist", "bin", "next");
const apiEntry = path.join(apiDir, "dist", "server.js");

for (const entry of [nextEntry, apiEntry]) {
  if (!existsSync(entry)) {
    console.error(`[startup] Arquivo de producao nao encontrado: ${entry}`);
    console.error("[startup] Execute npm run build:all antes de iniciar.");
    process.exit(1);
  }
}

if (webPort === apiPort) {
  console.error(`[startup] PORT e API_PORT nao podem usar a mesma porta (${webPort}).`);
  process.exit(1);
}

const baseEnv = { ...process.env, NODE_ENV: "production" };
const children = new Map();
let shuttingDown = false;
let requestedExitCode = 0;

function stopChildren(signal = "SIGTERM") {
  for (const child of children.values()) {
    if (child.exitCode === null && child.signalCode === null) {
      child.kill(signal);
    }
  }
}

function finishWhenStopped() {
  if (shuttingDown && children.size === 0) {
    process.exit(requestedExitCode);
  }
}

function shutdown(exitCode, signal = "SIGTERM") {
  if (shuttingDown) return;

  shuttingDown = true;
  requestedExitCode = exitCode;
  stopChildren(signal);

  setTimeout(() => {
    stopChildren("SIGKILL");
    process.exit(requestedExitCode);
  }, 10_000).unref();
}

function startProcess(name, args, env, cwd = rootDir) {
  console.log(`[startup] Iniciando ${name}...`);
  const child = spawn(process.execPath, args, {
    cwd,
    env,
    stdio: "inherit",
  });

  children.set(name, child);

  child.on("error", (error) => {
    console.error(`[startup] Falha ao iniciar ${name}:`, error);
    shutdown(1);
  });

  child.on("close", (code, signal) => {
    children.delete(name);

    if (!shuttingDown) {
      console.error(
        `[startup] ${name} foi encerrado inesperadamente ` +
          `(codigo=${code ?? "null"}, sinal=${signal ?? "null"}).`,
      );
      shutdown(code && code > 0 ? code : 1);
    }

    finishWhenStopped();
  });
}

startProcess(
  "Next.js",
  [nextEntry, "start", "--hostname", "0.0.0.0", "--port", webPort],
  baseEnv,
);

startProcess("API Fastify", [apiEntry], {
  ...baseEnv,
  API_PORT: apiPort,
}, apiDir);

process.on("SIGTERM", () => shutdown(0, "SIGTERM"));
process.on("SIGINT", () => shutdown(0, "SIGINT"));
