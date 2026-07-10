import { FastifyInstance, FastifyReply } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { OccurrenceService } from "../services/OcorrenciasService";
import {
  createOccurrenceBodySchema,
  occurrenceResponseSchema,
  listOccurrenceResponseSchema,
  listOccurrenceQuerySchema,
  ListOccurrenceQuery,
  CreateOccurrenceBody,
  updateOccurrenceParamsSchema,
  updateOccurrenceBodySchema,
  UpdateOccurrenceParams,
  UpdateOccurrenceBody,
  deleteOccurrenceParamsSchema,
  DeleteOccurrenceParams,
} from "../schemas/ocorrenciasSchema";
import { z } from "zod";
const service = new OccurrenceService();
export async function occurrenceRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/ocorrencia",
    {
      schema: {
        tags: ["Ocorrências"],
        summary: "Cria uma nova ocorrência",
        body: createOccurrenceBodySchema,
        response: {
          201: occurrenceResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const body = request.body as CreateOccurrenceBody;
      try {
        const newItem = await service.create(body);
        return reply.status(201).send(newItem);
      } catch (error: any) {
        console.error("Erro detalhado ao criar ocorrência:", error);
        return reply.status(500).send({
          message: "Erro ao criar ocorrência.",
          detail: error?.message || String(error),
        });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().get(
    "/ocorrencia",
    {
      schema: {
        tags: ["Ocorrências"],
        summary: "Lista ocorrências",
        querystring: listOccurrenceQuerySchema,
        response: {
          200: listOccurrenceResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { page, limit, search } = request.query as ListOccurrenceQuery;
      try {
        const result = await service.getAll(page, limit, search);
        return reply.status(200).send(result);
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao listar." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().put(
    "/ocorrencia/:id",
    {
      schema: {
        tags: ["Ocorrências"],
        summary: "Atualiza ocorrência",
        params: updateOccurrenceParamsSchema,
        body: updateOccurrenceBodySchema,
        response: {
          200: occurrenceResponseSchema,
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as UpdateOccurrenceParams;
      const updateData = request.body as UpdateOccurrenceBody;
      try {
        const updated = await service.update(Number(id), updateData);
        if (!updated) {
          return reply
            .status(404)
            .send({ message: "Ocorrência não encontrada." });
        }
        return reply.status(200).send(updated);
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao atualizar." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/ocorrencia/:id",
    {
      schema: {
        tags: ["Ocorrências"],
        summary: "Exclui ocorrência",
        params: deleteOccurrenceParamsSchema,
        response: {
          204: z.null(),
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as DeleteOccurrenceParams;
      try {
        const deleted = await service.delete(Number(id));
        if (deleted === null) {
          return reply
            .status(404)
            .send({ message: "Ocorrência não encontrada." });
        }
        return reply.status(204).send();
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao excluir." });
      }
    },
  );
}