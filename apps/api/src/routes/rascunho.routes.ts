import { FastifyInstance } from "fastify";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export async function rascunhoAprendizRoutes(app: FastifyInstance) {
  // Retorna o rascunho do usuário logado, ou 404
  app.get("/aprendiz/rascunho", async (request, reply) => {
    const userId = (request.user as any).sub;
    const rascunho = await prisma.cA_AprendizRascunho.findUnique({
      where: { userId },
    });
    if (!rascunho) return reply.status(404).send({ message: "Nenhum rascunho encontrado." });
    return reply.send({ data: rascunho });
  });

  // Cria ou atualiza o rascunho do usuário logado
  app.put("/aprendiz/rascunho", async (request, reply) => {
    const userId = (request.user as any).sub;
    const { dados } = request.body as { dados: Record<string, unknown> };
    const rascunho = await prisma.cA_AprendizRascunho.upsert({
      where: { userId },
      create: { userId, dados: dados as Prisma.InputJsonValue },
      update: { dados: dados as Prisma.InputJsonValue },
    });
    return reply.send({ data: rascunho });
  });

  // Remove o rascunho do usuário logado
  app.delete("/aprendiz/rascunho", async (request, reply) => {
    const userId = (request.user as any).sub;
    await prisma.cA_AprendizRascunho.deleteMany({ where: { userId } });
    return reply.status(204).send();
  });
}
