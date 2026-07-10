import { FastifyInstance, FastifyReply } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { OccurrenceTypeService } from "../services/OccurrenceTypeService";
import {
  createOccurrenceTypeBodySchema,
  occurrenceTypeResponseSchema,
  listOccurrenceTypeResponseSchema,
  listOccurrenceTypeQuerySchema,
  updateOccurrenceTypeParamsSchema,
  updateOccurrenceTypeBodySchema,
  deleteOccurrenceTypeParamsSchema,
  ListOccurrenceTypeQuery,
  CreateOccurrenceTypeBody,
  UpdateOccurrenceTypeParams,
  UpdateOccurrenceTypeBody,
  DeleteOccurrenceTypeParams,
} from "../schemas/occurrenceTypeSchema";
import { z } from "zod";
const service = new OccurrenceTypeService();
export async function occurrenceTypeRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/tipo-ocorrencia",
    {
      schema: {
        tags: ["Tipos de Ocorrência"],
        summary: "Cria um novo tipo de ocorrência",
        body: createOccurrenceTypeBodySchema,
        response: {
          201: occurrenceTypeResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const body = request.body as CreateOccurrenceTypeBody;
      try {
        const newItem = await service.create(body);
        return reply.status(201).send(newItem);
      } catch (error) {
        return reply
          .status(500)
          .send({ message: "Erro ao criar tipo de ocorrência." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().get(
    "/tipo-ocorrencia",
    {
      schema: {
        tags: ["Tipos de Ocorrência"],
        summary: "Lista tipos de ocorrências",
        querystring: listOccurrenceTypeQuerySchema,
        response: {
          200: listOccurrenceTypeResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { page, limit, search } = request.query as ListOccurrenceTypeQuery;
      try {
        const result = await service.getAll(page, limit, search);
        return reply.status(200).send(result);
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao listar." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().put(
    "/tipo-ocorrencia/:id",
    {
      schema: {
        tags: ["Tipos de Ocorrência"],
        summary: "Atualiza tipo de ocorrência",
        params: updateOccurrenceTypeParamsSchema,
        body: updateOccurrenceTypeBodySchema,
        response: {
          200: occurrenceTypeResponseSchema,
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as UpdateOccurrenceTypeParams;
      const updateData = request.body as UpdateOccurrenceTypeBody;
      try {
        const updated = await service.update(Number(id), updateData);
        if (!updated) {
          return reply
            .status(404)
            .send({ message: "Tipo de ocorrência não encontrado." });
        }
        return reply.status(200).send(updated);
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao atualizar." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/tipo-ocorrencia/:id",
    {
      schema: {
        tags: ["Tipos de Ocorrência"],
        summary: "Exclui tipo de ocorrência",
        params: deleteOccurrenceTypeParamsSchema,
        response: {
          204: z.null(),
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as DeleteOccurrenceTypeParams;
      try {
        const deleted = await service.delete(Number(id));
        if (deleted === null) {
          return reply
            .status(404)
            .send({ message: "Tipo de ocorrência não encontrado." });
        }
        return reply.status(204).send();
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao excluir." });
      }
    },
  );
}