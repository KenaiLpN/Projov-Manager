import { FastifyInstance, FastifyReply } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { UnidadeParceiroService } from "../services/UnidadeParceiroService";
import {
  createUnidadeParceiroBodySchema,
  listUnidadeParceiroQuerySchema,
  ListUnidadeParceiroQuery,
  CreateUnidadeParceiroBody,
  updateUnidadeParceiroParamsSchema,
  updateUnidadeParceiroBodySchema,
  UpdateUnidadeParceiroParams,
  UpdateUnidadeParceiroBody,
  unityParceiroResponseSchema,
  listUnidadeParceiroResponseSchema,
} from "../schemas/unidadeParceiroSchema";
import { z } from "zod";
const service = new UnidadeParceiroService();
export async function unidadeParceiroRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/unidades-parceiro",
    {
      schema: {
        tags: ["Unidades de Parceiros"],
        summary: "Cria uma nova unidade de parceiro",
        body: createUnidadeParceiroBodySchema,
        response: {
          201: unityParceiroResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const body = request.body as CreateUnidadeParceiroBody;
      try {
        const newItem = await service.create(body);
        return reply.status(201).send(newItem);
      } catch (error) {
        return reply
          .status(500)
          .send({ message: "Erro ao criar unidade de parceiro." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().get(
    "/unidades-parceiro",
    {
      schema: {
        tags: ["Unidades de Parceiros"],
        summary: "Lista unidades de parceiros",
        querystring: listUnidadeParceiroQuerySchema,
        response: {
          200: listUnidadeParceiroResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { page, limit, search, empresaId } =
        request.query as ListUnidadeParceiroQuery;
      try {
        const result = await service.getAll(page, limit, search, empresaId);
        return reply.status(200).send(result);
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao listar." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().get(
    "/unidades-parceiro/:codigo/:parceiro",
    {
      schema: {
        tags: ["Unidades de Parceiros"],
        summary: "Busca unidade de parceiro por ID composto",
        params: updateUnidadeParceiroParamsSchema,
        response: {
          200: unityParceiroResponseSchema,
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { codigo, parceiro } =
        request.params as UpdateUnidadeParceiroParams;
      try {
        const result = await service.getById(Number(codigo), Number(parceiro));
        if (!result)
          return reply.status(404).send({ message: "Não encontrado." });
        return reply.status(200).send(result);
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao buscar." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().put(
    "/unidades-parceiro/:codigo/:parceiro",
    {
      schema: {
        tags: ["Unidades de Parceiros"],
        summary: "Atualiza unidade de parceiro",
        params: updateUnidadeParceiroParamsSchema,
        body: updateUnidadeParceiroBodySchema,
        response: {
          200: unityParceiroResponseSchema,
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { codigo, parceiro } =
        request.params as UpdateUnidadeParceiroParams;
      const updateData = request.body as UpdateUnidadeParceiroBody;
      try {
        const updated = await service.update(
          Number(codigo),
          Number(parceiro),
          updateData,
        );
        if (!updated)
          return reply.status(404).send({ message: "Não encontrado." });
        return reply.status(200).send(updated);
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao atualizar." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/unidades-parceiro/:codigo/:parceiro",
    {
      schema: {
        tags: ["Unidades de Parceiros"],
        summary: "Exclui unidade de parceiro",
        params: updateUnidadeParceiroParamsSchema,
        response: {
          204: z.null(),
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { codigo, parceiro } =
        request.params as UpdateUnidadeParceiroParams;
      try {
        const deleted = await service.delete(Number(codigo), Number(parceiro));
        if (!deleted)
          return reply.status(404).send({ message: "Não encontrado." });
        return reply.status(204).send();
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao excluir." });
      }
    },
  );
}