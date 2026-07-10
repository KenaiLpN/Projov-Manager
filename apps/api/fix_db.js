const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const result = await prisma.$executeRawUnsafe('ALTER TABLE Aprendiz ADD COLUMN Senha VARCHAR(255) NULL');
    console.log("Column added:", result);
  } catch (e) {
    if (e.message && e.message.includes("Duplicate column name")) {
      console.log("Column already exists.");
    } else {
      console.error(e);
    }
  }
  try {
    const records = await prisma.$queryRawUnsafe('SELECT * FROM CA_Unidades WHERE UniCodigo IS NULL');
    console.log("Unidades nulas:", records);
  } catch(e) {}
  await prisma.$disconnect();
}
main();