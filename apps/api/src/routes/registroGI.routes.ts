import { FastifyInstance, FastifyReply } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { RegistroGIService } from "../services/RegistroGIService";
import {
  createRegistroGIBodySchema,
  registroGIResponseSchema,
  listRegistroGIResponseSchema,
  listRegistroGIQuerySchema,
  ListRegistroGIQuery,
  CreateRegistroGIBody,
  updateRegistroGIParamsSchema,
  updateRegistroGIBodySchema,
  UpdateRegistroGIParams,
  UpdateRegistroGIBody,
} from "../schemas/registroGISchema";
import { z } from "zod";

const service = new RegistroGIService();

export async function registroGIRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/registro-gi",
    {
      schema: {
        tags: ["Registro GI"],
        summary: "Cria novo Registro GI",
        body: createRegistroGIBodySchema,
        response: {
          201: registroGIResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const body = request.body as CreateRegistroGIBody;
      try {
        const newItem = await service.create(body);
        return reply.status(201).send(newItem);
      } catch {
        return reply.status(500).send({ message: "Erro ao criar Registro GI." });
      }
    },
  );

  app.withTypeProvider<ZodTypeProvider>().get(
    "/registro-gi",
    {
      schema: {
        tags: ["Registro GI"],
        summary: "Lista Registros GI com paginação",
        querystring: listRegistroGIQuerySchema,
        response: {
          200: listRegistroGIResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { page, limit, search } = request.query as ListRegistroGIQuery;
      try {
        const result = await service.getAll(page, limit, search);
        return reply.status(200).send(result);
      } catch {
        return reply.status(500).send({ message: "Erro ao listar." });
      }
    },
  );

  app.withTypeProvider<ZodTypeProvider>().get(
    "/registro-gi/:id",
    {
      schema: {
        tags: ["Registro GI"],
        summary: "Busca Registro GI por ID",
        params: z.object({ id: z.coerce.number() }),
        response: {
          200: registroGIResponseSchema,
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as { id: number };
      try {
        const result = await service.getById(id);
        if (!result)
          return reply.status(404).send({ message: "Não encontrado." });
        return reply.status(200).send(result);
      } catch {
        return reply.status(500).send({ message: "Erro ao buscar." });
      }
    },
  );

  app.withTypeProvider<ZodTypeProvider>().put(
    "/registro-gi/:id",
    {
      schema: {
        tags: ["Registro GI"],
        summary: "Atualiza Registro GI",
        params: updateRegistroGIParamsSchema,
        body: updateRegistroGIBodySchema,
        response: {
          200: registroGIResponseSchema,
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as UpdateRegistroGIParams;
      const updateData = request.body as UpdateRegistroGIBody;
      try {
        const updated = await service.update(Number(id), updateData);
        if (!updated)
          return reply.status(404).send({ message: "Não encontrado." });
        return reply.status(200).send(updated);
      } catch {
        return reply.status(500).send({ message: "Erro ao atualizar." });
      }
    },
  );

  app.withTypeProvider<ZodTypeProvider>().delete(
    "/registro-gi/:id",
    {
      schema: {
        tags: ["Registro GI"],
        summary: "Exclui Registro GI",
        params: z.object({ id: z.coerce.number() }),
        response: {
          204: z.null(),
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as { id: number };
      try {
        const deleted = await service.delete(Number(id));
        if (!deleted)
          return reply.status(404).send({ message: "Não encontrado." });
        return reply.status(204).send();
      } catch {
        return reply.status(500).send({ message: "Erro ao excluir." });
      }
    },
  );
}
