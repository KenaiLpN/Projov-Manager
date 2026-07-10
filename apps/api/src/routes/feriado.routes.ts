import { FastifyInstance, FastifyReply } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { FeriadoService } from "../services/FeriadoService";
import {
  createFeriadoBodySchema,
  feriadoResponseSchema,
  listFeriadoResponseSchema,
  listFeriadoQuerySchema,
  ListFeriadoQuery,
  CreateFeriadoBody,
  updateFeriadoParamsSchema,
  updateFeriadoBodySchema,
  UpdateFeriadoParams,
  UpdateFeriadoBody,
  deleteFeriadoParamsSchema,
  DeleteFeriadoParams,
} from "../schemas/feriadoSchema";
import { z } from "zod";
const service = new FeriadoService();
export async function feriadoRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/feriado",
    {
      schema: {
        tags: ["Feriados"],
        summary: "Cria um novo feriado",
        body: createFeriadoBodySchema,
        response: {
          201: feriadoResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const body = request.body as CreateFeriadoBody;
      try {
        const newItem = await service.create(body);
        return reply.status(201).send(newItem);
      } catch (error) {
        console.error(error);
        return reply.status(500).send({ message: "Erro ao criar feriado." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().get(
    "/feriado",
    {
      schema: {
        tags: ["Feriados"],
        summary: "Lista feriados",
        querystring: listFeriadoQuerySchema,
        response: {
          200: listFeriadoResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { page, limit, search } = request.query as ListFeriadoQuery;
      try {
        const result = await service.getAll(page, limit, search);
        return reply.status(200).send(result);
      } catch (error) {
        console.error(error);
        return reply.status(500).send({ message: "Erro ao listar." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().put(
    "/feriado/:unidade/:data",
    {
      schema: {
        tags: ["Feriados"],
        summary: "Atualiza feriado",
        params: updateFeriadoParamsSchema,
        body: updateFeriadoBodySchema,
        response: {
          200: feriadoResponseSchema,
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { unidade, data } = request.params as UpdateFeriadoParams;
      const updateData = request.body as UpdateFeriadoBody;
      try {
        const updated = await service.update({ unidade, data }, updateData);
        if (!updated) {
          return reply
            .status(404)
            .send({ message: "Registro não encontrado." });
        }
        return reply.status(200).send(updated);
      } catch (error) {
        console.error(error);
        return reply.status(500).send({ message: "Erro ao atualizar." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/feriado/:unidade/:data",
    {
      schema: {
        tags: ["Feriados"],
        summary: "Exclui feriado",
        params: deleteFeriadoParamsSchema,
        response: {
          204: z.null(),
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { unidade, data } = request.params as DeleteFeriadoParams;
      try {
        const deleted = await service.delete({ unidade, data });
        if (deleted === null) {
          return reply
            .status(404)
            .send({ message: "Registro não encontrado." });
        }
        return reply.status(204).send();
      } catch (error) {
        console.error(error);
        return reply.status(500).send({ message: "Erro ao excluir." });
      }
    },
  );
}