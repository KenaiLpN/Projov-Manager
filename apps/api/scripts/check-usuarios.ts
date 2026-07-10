import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const users = await (prisma as any).cA_Usuarios.findMany({
    select: {
      UsuCodigo: true,
      UsuNome: true,
      UsuTipo: true,
    },
    take: 20,
  });
  console.log("\n=== Usuários na CA_Usuarios ===\n");
  for (const u of users) {
    const tipo = u.UsuTipo;
    console.log(
      `Código: ${u.UsuCodigo.padEnd(12)} | ` +
        `Nome: ${(u.UsuNome ?? "").padEnd(20)} | ` +
        `UsuTipo (raw): ${JSON.stringify(tipo)} | ` +
        `length: ${tipo?.length ?? "null"}`,
    );
  }
  console.log("\n=== Valores únicos de UsuTipo ===\n");
  const uniqueTypes: string[] = [...new Set(users.map((u: any) => u.UsuTipo))];
  for (const t of uniqueTypes) {
    console.log(
      `  ${JSON.stringify(t)} (length: ${(t as any)?.length ?? "null"})`,
    );
  }
  await prisma.$disconnect();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});