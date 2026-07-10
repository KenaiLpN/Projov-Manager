import { FastifyInstance, FastifyReply } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { OrientadorService } from "../services/OrientadorService";
import { z } from "zod";
import {
  createOrientadorBodySchema,
  CreateOrientadorBody,
  orientadorResponseSchema,
  listOrientadorQuerySchema,
  ListOrientadorQuery,
  listOrientadorResponseSchema,
  updateOrientadorParamsSchema,
  UpdateOrientadorParams,
  updateOrientadorBodySchema,
  UpdateOrientadorBody,
  deleteOrientadorParamsSchema,
  DeleteOrientadorParams,
} from "../schemas/orientadorSchema";
const orientadorService = new OrientadorService();
export async function orientadorRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/orientadores",
    {
      schema: {
        tags: ["Orientadores"],
        summary: "Cria um novo orientador",
        body: createOrientadorBodySchema,
        response: {
          201: orientadorResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const body = request.body as CreateOrientadorBody;
      try {
        const newItem = await orientadorService.create(body);
        return reply.status(201).send(newItem);
      } catch (error) {
        console.error(error);
        return reply.status(500).send({ message: "Erro ao criar orientador" });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().get(
    "/orientadores",
    {
      schema: {
        tags: ["Orientadores"],
        summary: "Lista orientadores com paginação",
        querystring: listOrientadorQuerySchema,
        response: {
          200: listOrientadorResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { page, limit, search } = request.query as ListOrientadorQuery;
      try {
        const result = await orientadorService.getAll(page, limit, search);
        return reply.status(200).send(result);
      } catch (error) {
        console.error(error);
        return reply
          .status(500)
          .send({ message: "Erro ao listar orientadores" });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().put(
    "/orientadores/:id",
    {
      schema: {
        tags: ["Orientadores"],
        summary: "Atualiza um orientador",
        params: updateOrientadorParamsSchema,
        body: updateOrientadorBodySchema,
        response: {
          200: orientadorResponseSchema,
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as UpdateOrientadorParams;
      const updateData = request.body as UpdateOrientadorBody;
      try {
        const updated = await orientadorService.update(id, updateData);
        if (!updated) {
          return reply
            .status(404)
            .send({ message: "Orientador não encontrado" });
        }
        return reply.status(200).send(updated);
      } catch (error) {
        console.error(error);
        return reply
          .status(500)
          .send({ message: "Erro ao atualizar orientador" });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/orientadores/:id",
    {
      schema: {
        tags: ["Orientadores"],
        summary: "Deleta um orientador",
        params: deleteOrientadorParamsSchema,
        response: {
          204: z.null(),
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as DeleteOrientadorParams;
      try {
        const deleted = await orientadorService.delete(id);
        if (!deleted) {
          return reply
            .status(404)
            .send({ message: "Orientador não encontrado" });
        }
        return reply.status(204).send();
      } catch (error) {
        console.error(error);
        return reply
          .status(500)
          .send({ message: "Erro ao deletar orientador" });
      }
    },
  );
}