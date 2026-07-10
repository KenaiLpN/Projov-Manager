import { FastifyInstance, FastifyReply } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { GeracaoCronogramaSemestreService } from "../services/GeracaoCronogramaSemestreService";

const service = new GeracaoCronogramaSemestreService();

const listQuerySchema = z.object({
  turmaId: z.coerce.number().int().positive(),
  dataInicio: z.string().min(10),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

const generateBodySchema = z.object({
  turmaId: z.coerce.number().int().positive(),
  dataInicio: z.string().min(10),
});

export async function geracaoCronogramaSemestreRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/geracao-cronogramas-semestre",
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
        const message = error instanceof Error ? error.message : "Erro ao pesquisar cronograma turma/semestre.";
        return reply.status(500).send({ message });
      }
    },
  );

  app.withTypeProvider<ZodTypeProvider>().post(
    "/geracao-cronogramas-semestre",
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
        const message = error instanceof Error ? error.message : "Erro ao gerar cronograma turma/semestre.";
        return reply.status(400).send({ message });
      }
    },
  );
}
