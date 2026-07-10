import { FastifyInstance, FastifyReply } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { CA_FaltasCapacitacaoService } from "../services/CA_FaltasCapacitacaoService";

const service = new CA_FaltasCapacitacaoService();

export async function faltasCapacitacaoRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/faltas-capacitacao/datas",
    { schema: { tags: ["FaltasCapacitacao"], querystring: z.object({ turma: z.coerce.number() }) } },
    async (request, reply: FastifyReply) => {
      const { turma } = request.query as { turma: number };
      try {
        return reply.send(await service.getDatas(turma));
      } catch {
        return reply.status(500).send({ message: "Erro ao buscar datas." });
      }
    },
  );

  app.withTypeProvider<ZodTypeProvider>().get(
    "/faltas-capacitacao/aprendizes",
    { schema: { tags: ["FaltasCapacitacao"], querystring: z.object({ turma: z.coerce.number() }) } },
    async (request, reply: FastifyReply) => {
      const { turma } = request.query as { turma: number };
      try {
        return reply.send(await service.getAprendizesDaTurma(turma));
      } catch {
        return reply.status(500).send({ message: "Erro ao buscar aprendizes." });
      }
    },
  );

  app.withTypeProvider<ZodTypeProvider>().get(
    "/faltas-capacitacao/presencas",
    {
      schema: {
        tags: ["FaltasCapacitacao"],
        querystring: z.object({ turma: z.coerce.number(), data: z.string() }),
      },
    },
    async (request, reply: FastifyReply) => {
      const { turma, data } = request.query as { turma: number; data: string };
      try {
        return reply.send(await service.getPresencas(turma, data));
      } catch {
        return reply.status(500).send({ message: "Erro ao buscar presenças." });
      }
    },
  );

  app.withTypeProvider<ZodTypeProvider>().post(
    "/faltas-capacitacao/presencas",
    { schema: { tags: ["FaltasCapacitacao"], body: z.object({ registros: z.array(z.object({}).passthrough()) }) } },
    async (request, reply: FastifyReply) => {
      const user = request.user as { sub: string };
      const { registros } = request.body as any;
      try {
        await service.savePresencas(
          registros.map((r: any) => ({ ...r, usuario: user.sub }))
        );
        return reply.send({ ok: true });
      } catch {
        return reply.status(500).send({ message: "Erro ao salvar presenças." });
      }
    },
  );

  app.withTypeProvider<ZodTypeProvider>().get(
    "/faltas-capacitacao/turma-info/:id",
    { schema: { tags: ["FaltasCapacitacao"], params: z.object({ id: z.coerce.number() }) } },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as { id: number };
      try {
        const info = await service.getTurmaInfo(id);
        if (!info) return reply.status(404).send({ message: "Turma não encontrada." });
        return reply.send(info);
      } catch {
        return reply.status(500).send({ message: "Erro ao buscar turma." });
      }
    },
  );

  app.withTypeProvider<ZodTypeProvider>().post(
    "/faltas-capacitacao/lancar-aula",
    {
      schema: {
        tags: ["FaltasCapacitacao"],
        body: z.object({ turma: z.number(), data: z.string() }),
      },
    },
    async (request, reply: FastifyReply) => {
      const user = request.user as { sub: string };
      const { turma, data } = request.body as { turma: number; data: string };
      try {
        const result = await service.lancarAula(turma, data, user.sub);
        return reply.status(201).send(result);
      } catch {
        return reply.status(500).send({ message: "Erro ao lançar aula." });
      }
    },
  );
}
