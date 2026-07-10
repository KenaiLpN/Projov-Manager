import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";

export async function escolaRoutes(app: FastifyInstance) {
  app.get("/escolas", async (request, reply) => {
    try {
      const escolas = await prisma.cA_Escolas.findMany({
        orderBy: { EscNome: "asc" },
        select: { EscCodigo: true, EscNome: true, EscEndereco: true },
      });
      return reply.send({ data: escolas });
    } catch (err) {
      return reply.status(500).send({ message: "Erro ao buscar escolas." });
    }
  });
}
