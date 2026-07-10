import { FastifyInstance, FastifyReply } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { GeracaoCronogramaService } from "../services/GeracaoCronogramaService";

const service = new GeracaoCronogramaService();

const generateBodySchema = z.object({
  turmaId: z.coerce.number().int().positive(),
  disciplinaId: z.coerce.number().int().positive(),
  educadorId: z.coerce.number().int().positive(),
  quantidade: z.coerce.number().int().min(1).max(300),
  dataInicio: z.string().min(10),
  sequencia: z.coerce.number().int().min(1).max(3),
});

const listQuerySchema = z.object({
  turmaId: z.coerce.number().int().positive().optional(),
  disciplinaId: z.coerce.number().int().positive().optional(),
  educadorId: z.coerce.number().int().positive().optional(),
  sequencia: z.coerce.number().int().min(1).max(3).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

const updateEducadorBodySchema = z.object({
  educadorId: z.coerce.number().int().positive(),
});

export async function geracaoCronogramaRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/geracao-cronogramas",
    {
      schema: {
        tags: ["Geracao Cronogramas"],
        body: generateBodySchema,
      },
      preHandler: [app.authenticate],
    },
    async (request, reply: FastifyReply) => {
      const body = request.body as z.infer<typeof generateBodySchema>;
      const user = request.user as { sub?: string } | undefined;

      try {
        const result = await service.generate({
          ...body,
          usuario: user?.sub ?? null,
        });
        return reply.status(201).send(result);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao gerar cronograma.";
        return reply.status(400).send({ message });
      }
    },
  );

  app.withTypeProvider<ZodTypeProvider>().get(
    "/geracao-cronogramas",
    {
      schema: {
        tags: ["Geracao Cronogramas"],
        querystring: listQuerySchema,
      },
      preHandler: [app.authenticate],
    },
    async (request, reply: FastifyReply) => {
      const query = request.query as z.infer<typeof listQuerySchema>;

      try {
        const result = await service.list(query);
        return reply.status(200).send(result);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao pesquisar cronograma.";
        return reply.status(500).send({ message });
      }
    },
  );

  app.withTypeProvider<ZodTypeProvider>().put(
    "/geracao-cronogramas/:id/educador",
    {
      schema: {
        tags: ["Geracao Cronogramas"],
        params: z.object({ id: z.coerce.number().int().positive() }),
        body: updateEducadorBodySchema,
      },
      preHandler: [app.authenticate],
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as { id: number };
      const { educadorId } = request.body as z.infer<typeof updateEducadorBodySchema>;

      try {
        const result = await service.updateEducador(id, educadorId);
        return reply.status(200).send(result);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao alterar professor.";
        return reply.status(400).send({ message });
      }
    },
  );
}
