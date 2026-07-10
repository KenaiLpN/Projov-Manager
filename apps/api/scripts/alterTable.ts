import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRaw`
    ALTER TABLE Aprendiz
      ADD COLUMN Gestante TINYINT(1),
      ADD COLUMN MesesGestacao INT,
      ADD COLUMN PartoRealizado TINYINT(1),
      ADD COLUMN DataParto DATE
  `;
  console.log("Columns added successfully");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
