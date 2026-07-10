import { FastifyInstance, FastifyReply } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { AprendizService } from "../services/AprendizService";
import {
  aprendizSchema,
  AprendizInput,
  listAprendizQuerySchema,
  updateAprendizParamsSchema,
  deleteAprendizParamsSchema,
  aprendizResponseSchema,
  listAprendizResponseSchema,
  ListAprendizQuery,
  UpdateAprendizParams,
  DeleteAprendizParams,
} from "../schemas/aprendizSchema";
import { z } from "zod";
const aprendizService = new AprendizService();
export async function aprendizRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/aprendiz",
    {
      schema: {
        tags: ["Aprendizes"],
        summary: "Cria um novo aprendiz",
        body: aprendizSchema,
        response: {
          201: aprendizResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const body = request.body as AprendizInput;
      try {
        const newAprendiz = await aprendizService.create(body);
        return reply.status(201).send(newAprendiz);
      } catch (error) {
        console.error("Erro no POST /aprendiz:", error);
        return reply.status(500).send({ message: "Erro ao criar aprendiz" });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().get(
    "/aprendiz",
    {
      schema: {
        tags: ["Aprendizes"],
        summary: "Lista aprendizes com paginação",
        querystring: listAprendizQuerySchema,
        response: {
          200: listAprendizResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { page, limit, search, filter, advancedFilter } =
        request.query as ListAprendizQuery & { filter?: string, advancedFilter?: string };
      try {
        const result = await aprendizService.getAll(
          page,
          limit,
          search,
          filter,
          advancedFilter
        );
        return reply.status(200).send(result);
      } catch (error) {
        console.error("Erro no GET /aprendiz:", error);
        return reply.status(500).send({ message: "Erro ao listar aprendizes" });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().get(
    "/aprendiz/stats",
    {
      schema: {
        tags: ["Aprendizes"],
        summary: "Busca estatísticas dos aprendizes",
        response: {
          200: z.object({
            total: z.number(),
            vacation: z.number(),
            working: z.number(),
            available: z.number(),
          }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      try {
        const stats = await aprendizService.getStats();
        return reply.status(200).send(stats);
      } catch (error) {
        console.error("Erro no GET /aprendiz/stats:", error);
        return reply
          .status(500)
          .send({ message: "Erro ao buscar estatísticas" });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().get(
    "/aprendiz/:id",
    {
      schema: {
        tags: ["Aprendizes"],
        summary: "Busca um aprendiz pelo ID",
        params: z.object({ id: z.coerce.number() }),
        response: {
          200: aprendizResponseSchema,
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as { id: number };
      try {
        const aprendiz = await aprendizService.getById(id);
        if (!aprendiz) {
          return reply.status(404).send({ message: "Aprendiz não encontrado" });
        }
        return reply.status(200).send(aprendiz);
      } catch (error) {
        console.error(`Erro no GET /aprendiz/${id}:`, error);
        return reply.status(500).send({ message: "Erro ao buscar aprendiz" });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().put(
    "/aprendiz/:id",
    {
      schema: {
        tags: ["Aprendizes"],
        summary: "Atualiza um aprendiz",
        params: updateAprendizParamsSchema,
        body: aprendizSchema.partial(),
        response: {
          200: aprendizResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as UpdateAprendizParams;
      const body = request.body as Partial<AprendizInput>;
      try {
        const updated = await aprendizService.update(id, body);
        return reply.status(200).send(updated);
      } catch (error) {
        console.error(`Erro no PUT /aprendiz/${id}:`, error);
        return reply
          .status(500)
          .send({ message: "Erro ao atualizar aprendiz" });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/aprendiz/:id",
    {
      schema: {
        tags: ["Aprendizes"],
        summary: "Deleta um aprendiz",
        params: deleteAprendizParamsSchema,
        response: {
          204: z.null(),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as DeleteAprendizParams;
      try {
        await aprendizService.delete(id);
        return reply.status(204).send();
      } catch (error) {
        console.error(`Erro no DELETE /aprendiz/${id}:`, error);
        return reply.status(500).send({ message: "Erro ao deletar aprendiz" });
      }
    },
  );
}