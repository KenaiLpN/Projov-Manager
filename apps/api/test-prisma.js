const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Testing CA_Parceiros...");
    const parceiros = await prisma.cA_Parceiros.findMany({ take: 1 });
    console.log("CA_Parceiros Success:", parceiros.length);

    console.log("Testing CA_AreaAtuacao...");
    const areas = await prisma.cA_AreaAtuacao.findMany({ take: 1 });
    console.log("CA_AreaAtuacao Success:", areas.length);

    console.log("Testing CA_RequisicoesVagas...");
    const vagas = await prisma.cA_RequisicoesVagas.findMany({ take: 1 });
    console.log("CA_RequisicoesVagas Success:", vagas.length);

  } catch (e) {
    console.error("Prisma error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
