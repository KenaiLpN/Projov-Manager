import { access, cp, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const standaloneRoot = path.join(projectRoot, ".next", "standalone");
const apiRoot = path.join(standaloneRoot, "apps", "api");
const prismaRoot = path.join(apiRoot, "node_modules", ".prisma", "client");

// Falhe durante o build caso o rastreamento deixe a API fora do deploy.
await Promise.all([
  access(path.join(standaloneRoot, "server.js")),
  access(path.join(apiRoot, "dist", "app.js")),
  access(path.join(apiRoot, "package.json")),
  access(path.join(prismaRoot, "index.js")),
  access(path.join(prismaRoot, "schema.prisma")),
]);
const prismaFiles = await readdir(prismaRoot);
if (!prismaFiles.some((file) => /query_engine.*\.node$/.test(file))) {
  throw new Error("O deploy standalone nao inclui o mecanismo nativo do Prisma.");
}

// Next pode copiar os arquivos de ambiente da raiz para o standalone.
// O pacote publicado deve receber segredos pelo ambiente do hPanel em runtime.
await Promise.all(
  [".env", ".env.local", ".env.production", ".env.production.local"].map(
    (file) => rm(path.join(standaloneRoot, file), { force: true }),
  ),
);

// Next nao copia estes assets automaticamente para seu servidor standalone.
await Promise.all([
  cp(path.join(projectRoot, "public"), path.join(standaloneRoot, "public"), {
    recursive: true,
  }),
  cp(
    path.join(projectRoot, ".next", "static"),
    path.join(standaloneRoot, ".next", "static"),
    { recursive: true },
  ),
]);

console.log("[build] Standalone preparado com site, API e Prisma.");
