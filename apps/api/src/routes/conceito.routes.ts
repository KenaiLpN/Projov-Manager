import { FastifyInstance, FastifyReply } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { ConceitoService } from "../services/ConceitoService";
import {
  createConceitoBodySchema,
  conceitoResponseSchema,
  listConceitoResponseSchema,
  listConceitoQuerySchema,
  ListConceitoQuery,
  CreateConceitoBody,
  updateConceitoParamsSchema,
  updateConceitoBodySchema,
  UpdateConceitoParams,
  UpdateConceitoBody,
  deleteConceitoParamsSchema,
  DeleteConceitoParams,
} from "../schemas/conceitoSchema";
import { z } from "zod";
const service = new ConceitoService();
export async function conceitoRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/conceitos",
    {
      schema: {
        tags: ["Conceitos"],
        summary: "Cria um novo conceito",
        body: createConceitoBodySchema,
        response: {
          201: conceitoResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const body = request.body as CreateConceitoBody;
      try {
        const newItem = await service.create(body);
        return reply.status(201).send(newItem);
      } catch (error) {
        if (error instanceof Error) console.error(error.message);
        return reply.status(500).send({ message: "Erro ao criar conceito." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().get(
    "/conceitos",
    {
      schema: {
        tags: ["Conceitos"],
        summary: "Lista conceitos",
        querystring: listConceitoQuerySchema,
        response: {
          200: listConceitoResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { page, limit, search } = request.query as ListConceitoQuery;
      try {
        const result = await service.getAll(page, limit, search);
        return reply.status(200).send(result);
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao listar." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().put(
    "/conceitos/:id",
    {
      schema: {
        tags: ["Conceitos"],
        summary: "Atualiza conceito",
        params: updateConceitoParamsSchema,
        body: updateConceitoBodySchema,
        response: {
          200: conceitoResponseSchema,
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as UpdateConceitoParams;
      const updateData = request.body as UpdateConceitoBody;
      try {
        const updated = await service.update(id, updateData);
        if (!updated) {
          return reply
            .status(404)
            .send({ message: "Conceito não encontrado." });
        }
        return reply.status(200).send(updated);
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao atualizar." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/conceitos/:id",
    {
      schema: {
        tags: ["Conceitos"],
        summary: "Exclui conceito",
        params: deleteConceitoParamsSchema,
        response: {
          204: z.null(),
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as DeleteConceitoParams;
      try {
        const deleted = await service.delete(id);
        if (deleted === null) {
          return reply
            .status(404)
            .send({ message: "Conceito não encontrado." });
        }
        return reply.status(204).send();
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao excluir." });
      }
    },
  );
}