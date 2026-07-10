import { FastifyInstance, FastifyReply } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { CronogramaService } from "../services/CronogramaService";

const service = new CronogramaService();

export async function cronogramaRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/cronogramas/turma",
    {
      schema: {
        tags: ["Cronograma"],
        querystring: z.object({
          turmaId: z.coerce.number(),
          startDate: z.string(),
          endDate: z.string(),
        }),
      },
      preHandler: [app.authenticate],
    },
    async (request, reply: FastifyReply) => {
      const { turmaId, startDate, endDate } = request.query as {
        turmaId: number;
        startDate: string;
        endDate: string;
      };

      try {
        return reply.send(await service.getCronogramaTurma(turmaId, startDate, endDate));
      } catch (error: any) {
        console.error("Erro ao gerar cronograma da turma:", error);
        return reply.status(500).send({ message: error?.message ?? "Erro ao gerar cronograma da turma." });
      }
    },
  );
}
