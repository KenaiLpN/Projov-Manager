import { FastifyInstance, FastifyReply } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { GrauParentescoService } from "../services/GrauParentescoService";
import { z } from "zod";
import {
  createGrauParentescoBodySchema,
  CreateGrauParentescoBody,
  grauParentescoResponseSchema,
  listGrauParentescoQuerySchema,
  ListGrauParentescoQuery,
  listGrauParentescoResponseSchema,
  updateGrauParentescoParamsSchema,
  UpdateGrauParentescoParams,
  updateGrauParentescoBodySchema,
  UpdateGrauParentescoBody,
  deleteGrauParentescoParamsSchema,
  DeleteGrauParentescoParams,
} from "../schemas/grauParentescoSchema";
const service = new GrauParentescoService();
export async function grauParentescoRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/grau-parentesco",
    {
      schema: {
        tags: ["Graus Parentesco"],
        summary: "Cria um novo grau de parentesco",
        body: createGrauParentescoBodySchema,
        response: {
          201: grauParentescoResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const body = request.body as CreateGrauParentescoBody;
      try {
        const newItem = await service.create(body);
        return reply.status(201).send(newItem);
      } catch (error) {
        console.error(error);
        return reply
          .status(500)
          .send({ message: "Erro interno ao criar grau de parentesco." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().get(
    "/grau-parentesco",
    {
      schema: {
        tags: ["Graus Parentesco"],
        summary: "Lista graus de parentesco com paginação",
        querystring: listGrauParentescoQuerySchema,
        response: {
          200: listGrauParentescoResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { page, limit, search } = request.query as ListGrauParentescoQuery;
      try {
        const result = await service.getAll(page, limit, search);
        return reply.status(200).send(result);
      } catch (error) {
        console.error(error);
        return reply.status(500).send({ message: "Erro interno ao listar." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().put(
    "/grau-parentesco/:id",
    {
      schema: {
        tags: ["Graus Parentesco"],
        summary: "Atualiza um grau de parentesco existente",
        params: updateGrauParentescoParamsSchema,
        body: updateGrauParentescoBodySchema,
        response: {
          200: grauParentescoResponseSchema,
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as UpdateGrauParentescoParams;
      const updateData = request.body as UpdateGrauParentescoBody;
      try {
        const updated = await service.update(Number(id), updateData);
        if (!updated) {
          return reply
            .status(404)
            .send({ message: "Grau de parentesco não encontrado." });
        }
        return reply.status(200).send(updated);
      } catch (error) {
        console.error(error);
        return reply
          .status(500)
          .send({ message: "Erro interno ao atualizar." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/grau-parentesco/:id",
    {
      schema: {
        tags: ["Graus Parentesco"],
        summary: "Remove um grau de parentesco",
        params: deleteGrauParentescoParamsSchema,
        response: {
          204: z.null(),
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as DeleteGrauParentescoParams;
      try {
        const deleted = await service.delete(Number(id));
        if (!deleted) {
          return reply
            .status(404)
            .send({ message: "Grau de parentesco não encontrado." });
        }
        return reply.status(204).send();
      } catch (error) {
        console.error(error);
        return reply.status(500).send({ message: "Erro interno ao deletar." });
      }
    },
  );
}