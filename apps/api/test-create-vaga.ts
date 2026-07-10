import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const res = await prisma.cA_RequisicoesVagas.create({
      data: {
        ReqEmpresa: 1, // Assuming company 1 exists
        ReqDataSolita__o: new Date().toISOString().split('T')[0],
        ReqQuantidade: 1,
        ReqSubstituicao: "N",
        ReqAreaAtuacao: 1, // Assuming area 1 exists
        ReqSituacao: "A",
        ReqDataCadastro: new Date().toISOString(),
      }
    })
    console.log("Success:", res)
  } catch (error) {
    console.error("Error creating Vaga:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
