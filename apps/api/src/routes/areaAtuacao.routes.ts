import { FastifyInstance, FastifyReply } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { AreaAtuacaoService } from "../services/AreaAtuacaoService";
import {
  createAreaAtuacaoBodySchema,
  areaAtuacaoResponseSchema,
  listAreaAtuacaoResponseSchema,
  listAreaAtuacaoQuerySchema,
  ListAreaAtuacaoQuery,
  CreateAreaAtuacaoBody,
  updateAreaAtuacaoParamsSchema,
  updateAreaAtuacaoBodySchema,
  UpdateAreaAtuacaoParams,
  UpdateAreaAtuacaoBody,
  deleteAreaAtuacaoParamsSchema,
  DeleteAreaAtuacaoParams,
} from "../schemas/areaAtuacaoSchema";
import { z } from "zod";
const service = new AreaAtuacaoService();
export async function areaAtuacaoRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/areas",
    {
      schema: {
        tags: ["Áreas de Atuação"],
        summary: "Cria uma nova área de atuação",
        body: createAreaAtuacaoBodySchema,
        response: {
          201: areaAtuacaoResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const body = request.body as CreateAreaAtuacaoBody;
      try {
        const newItem = await service.create(body);
        return reply.status(201).send(newItem);
      } catch (error) {
        if (error instanceof Error) console.error(error.message);
        return reply
          .status(500)
          .send({ message: "Erro ao criar área de atuação." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().get(
    "/areas",
    {
      schema: {
        tags: ["Áreas de Atuação"],
        summary: "Lista áreas de atuação",
        querystring: listAreaAtuacaoQuerySchema,
        response: {
          200: listAreaAtuacaoResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { page, limit, search } = request.query as ListAreaAtuacaoQuery;
      try {
        const result = await service.getAll(page, limit, search);
        return reply.status(200).send(result);
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao listar." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().put(
    "/areas/:id",
    {
      schema: {
        tags: ["Áreas de Atuação"],
        summary: "Atualiza área de atuação",
        params: updateAreaAtuacaoParamsSchema,
        body: updateAreaAtuacaoBodySchema,
        response: {
          200: areaAtuacaoResponseSchema,
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as UpdateAreaAtuacaoParams;
      const updateData = request.body as UpdateAreaAtuacaoBody;
      try {
        const updated = await service.update(id, updateData);
        if (!updated) {
          return reply
            .status(404)
            .send({ message: "Área de atuação não encontrada." });
        }
        return reply.status(200).send(updated);
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao atualizar." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/areas/:id",
    {
      schema: {
        tags: ["Áreas de Atuação"],
        summary: "Exclui área de atuação",
        params: deleteAreaAtuacaoParamsSchema,
        response: {
          204: z.null(),
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as DeleteAreaAtuacaoParams;
      try {
        const deleted = await service.delete(id);
        if (deleted === null) {
          return reply
            .status(404)
            .send({ message: "Área de atuação não encontrada." });
        }
        return reply.status(204).send();
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao excluir." });
      }
    },
  );
}