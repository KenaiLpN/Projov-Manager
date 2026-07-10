import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";

export async function municipioRoutes(app: FastifyInstance) {
  app.get("/municipios", async (request, reply) => {
    try {
      const { uf } = request.query as { uf?: string };
      const municipios = await prisma.mA_Municipios.findMany({
        where: uf ? { MunIEstado: uf } : undefined,
        orderBy: { MunIDescricao: "asc" },
        select: { MunICodigo: true, MunIDescricao: true },
      });
      return reply.send({ data: municipios });
    } catch (err) {
      return reply.status(500).send({ message: "Erro ao buscar municípios." });
    }
  });
}
