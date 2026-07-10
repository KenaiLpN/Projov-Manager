import { FastifyInstance, FastifyReply } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { GrauEscolaridadeService } from "../services/GrauEscolaridadeService";
import {
  createGrauEscolaridadeBodySchema,
  grauEscolaridadeResponseSchema,
  listGrauEscolaridadeResponseSchema,
  listGrauEscolaridadeQuerySchema,
  ListGrauEscolaridadeQuery,
  CreateGrauEscolaridadeBody,
  updateGrauEscolaridadeParamsSchema,
  updateGrauEscolaridadeBodySchema,
  UpdateGrauEscolaridadeParams,
  UpdateGrauEscolaridadeBody,
  deleteGrauEscolaridadeParamsSchema,
  DeleteGrauEscolaridadeParams,
} from "../schemas/grauEscolaridadeSchema";
import { z } from "zod";
const service = new GrauEscolaridadeService();
export async function grauEscolaridadeRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/grau-escolaridade",
    {
      schema: {
        tags: ["Graus de Escolaridade"],
        summary: "Cria um novo grau de escolaridade",
        body: createGrauEscolaridadeBodySchema,
        response: {
          201: grauEscolaridadeResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const body = request.body as CreateGrauEscolaridadeBody;
      try {
        const newItem = await service.create(body);
        return reply.status(201).send(newItem);
      } catch (error) {
        return reply
          .status(500)
          .send({ message: "Erro ao criar grau de escolaridade." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().get(
    "/grau-escolaridade",
    {
      schema: {
        tags: ["Graus de Escolaridade"],
        summary: "Lista graus de escolaridade",
        querystring: listGrauEscolaridadeQuerySchema,
        response: {
          200: listGrauEscolaridadeResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { page, limit, search } =
        request.query as ListGrauEscolaridadeQuery;
      try {
        const result = await service.getAll(page, limit, search);
        return reply.status(200).send(result);
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao listar." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().put(
    "/grau-escolaridade/:id",
    {
      schema: {
        tags: ["Graus de Escolaridade"],
        summary: "Atualiza grau de escolaridade",
        params: updateGrauEscolaridadeParamsSchema,
        body: updateGrauEscolaridadeBodySchema,
        response: {
          200: grauEscolaridadeResponseSchema,
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as UpdateGrauEscolaridadeParams;
      const updateData = request.body as UpdateGrauEscolaridadeBody;
      try {
        const updated = await service.update(Number(id), updateData);
        if (!updated) {
          return reply
            .status(404)
            .send({ message: "Registro não encontrado." });
        }
        return reply.status(200).send(updated);
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao atualizar." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/grau-escolaridade/:id",
    {
      schema: {
        tags: ["Graus de Escolaridade"],
        summary: "Exclui grau de escolaridade",
        params: deleteGrauEscolaridadeParamsSchema,
        response: {
          204: z.null(),
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as DeleteGrauEscolaridadeParams;
      try {
        const deleted = await service.delete(Number(id));
        if (deleted === null) {
          return reply
            .status(404)
            .send({ message: "Registro não encontrado." });
        }
        return reply.status(204).send();
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao excluir." });
      }
    },
  );
}