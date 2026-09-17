import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const problems = [];
for (const entry of ["node_modules/next/package.json", "node_modules/concurrently/package.json", "apps/api/node_modules/tsx/package.json", "apps/api/node_modules/@prisma/client/package.json"]) {
  if (!existsSync(path.join(root, entry))) {
    problems.push(`Dependencia ausente: ${entry}. Execute npm ci e npm run api:install na raiz.`);
  }
}

const envPath = path.join(root, "apps/api/.env");
if (!existsSync(envPath)) {
  problems.push("Crie apps/api/.env a partir de apps/api/.env.example e configure o MySQL e os segredos locais.");
} else {
  const env = { ...parseEnv(readFileSync(envPath, "utf8")), ...process.env };
  for (const key of ["DATABASE_URL", "JWT_SECRET", "COOKIE_SECRET"]) {
    const value = env[key]?.trim();
    if (!value || value.startsWith("substitua-") || value.includes("usuario:senha@host")) {
      problems.push(`Configure ${key} em apps/api/.env com um valor real (nao o exemplo).`);
    }
  }
}

if (problems.length) {
  console.error("[dev] O ambiente local precisa de configuracao:\n- " + problems.join("\n- "));
  process.exitCode = 1;
} else {
  console.log("[dev] Dependencias e variaveis obrigatorias encontradas. A conexao MySQL sera validada ao consultar a API.");
}
