import { FastifyInstance, FastifyReply } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { CA_AlocacaoService } from "../services/CA_AlocacaoService";

const service = new CA_AlocacaoService();

export async function alocacaoRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/alocacoes/filtros-ativos",
    { schema: { tags: ["Alocacao"] }, preHandler: [app.authenticate] },
    async (_request, reply: FastifyReply) => {
      try {
        return reply.send(await service.getFiltrosAtivos());
      } catch {
        return reply.status(500).send({ message: "Erro ao carregar cursos e turmas com alocação ativa." });
      }
    },
  );

  app.withTypeProvider<ZodTypeProvider>().get(
    "/alocacoes/aprendizes-por-turma/:turmaId",
    {
      schema: {
        tags: ["Alocacao"],
        params: z.object({ turmaId: z.coerce.number() }),
      },
      preHandler: [app.authenticate],
    },
    async (request, reply: FastifyReply) => {
      const { turmaId } = request.params as { turmaId: number };
      try {
        return reply.send(await service.getAprendizesAtivosPorTurma(turmaId));
      } catch {
        return reply.status(500).send({ message: "Erro ao listar aprendizes com alocação ativa." });
      }
    },
  );

  app.withTypeProvider<ZodTypeProvider>().get(
    "/alocacoes/alunos-por-turma/:turmaId",
    {
      schema: {
        tags: ["Alocacao"],
        params: z.object({ turmaId: z.coerce.number() }),
      },
      preHandler: [app.authenticate],
    },
    async (request, reply: FastifyReply) => {
      const { turmaId } = request.params as { turmaId: number };
      try {
        return reply.send(await service.getAlunosPorTurma(turmaId));
      } catch {
        return reply.status(500).send({ message: "Erro ao listar alunos da turma." });
      }
    },
  );

  // GET /ca-aprendiz/:id/alocacoes
  app.withTypeProvider<ZodTypeProvider>().get(
    "/ca-aprendiz/:id/alocacoes",
    {
      schema: {
        tags: ["Alocacao"],
        params: z.object({ id: z.coerce.number() }),
      },
      preHandler: [app.authenticate],
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as { id: number };
      const data = await service.getByAprendiz(id);
      return reply.send(data);
    },
  );

  // POST /ca-aprendiz/:id/alocacoes
  app.withTypeProvider<ZodTypeProvider>().post(
    "/ca-aprendiz/:id/alocacoes",
    {
      schema: {
        tags: ["Alocacao"],
        params: z.object({ id: z.coerce.number() }),
        body: z.object({}).passthrough(),
      },
      preHandler: [app.authenticate],
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as { id: number };
      const user = request.user as { sub: string };
      try {
        const created = await service.create(id, request.body, user.sub);
        return reply.status(201).send(created);
      } catch (error: any) {
        console.error("Erro ao criar alocação:", error);
        return reply.status(500).send({ message: error?.message ?? "Erro ao criar alocação." });
      }
    },
  );

  // PUT /ca-aprendiz/alocacoes/:ordem
  app.withTypeProvider<ZodTypeProvider>().put(
    "/ca-aprendiz/alocacoes/:ordem",
    {
      schema: {
        tags: ["Alocacao"],
        params: z.object({ ordem: z.coerce.number() }),
        body: z.object({}).passthrough(),
      },
      preHandler: [app.authenticate],
    },
    async (request, reply: FastifyReply) => {
      const { ordem } = request.params as { ordem: number };
      const user = request.user as { sub: string };
      try {
        const updated = await service.update(ordem, request.body, user.sub);
        return reply.send(updated);
      } catch (error: any) {
        console.error("Erro ao atualizar alocação:", error);
        return reply.status(500).send({ message: error?.message ?? "Erro ao atualizar alocação." });
      }
    },
  );

  // DELETE /ca-aprendiz/alocacoes/:ordem
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/ca-aprendiz/alocacoes/:ordem",
    {
      schema: {
        tags: ["Alocacao"],
        params: z.object({ ordem: z.coerce.number() }),
      },
      preHandler: [app.authenticate],
    },
    async (request, reply: FastifyReply) => {
      const { ordem } = request.params as { ordem: number };
      await service.delete(ordem);
      return reply.status(204).send();
    },
  );
}
