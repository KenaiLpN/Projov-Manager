import { FastifyInstance, FastifyReply } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { SituacaoParticipanteService } from "../services/SituacaoParticipanteService";
import { z } from "zod";
import {
  createSituacaoBodySchema,
  situacaoResponseSchema,
  listSituacaoResponseSchema,
  listSituacaoQuerySchema,
  ListSituacaoQuery,
  updateSituacaoBodySchema,
  updateSituacaoParamsSchema,
  UpdateSituacaoParams,
  UpdateSituacaoBody,
  deleteSituacaoParamsSchema,
  DeleteSituacaoParams,
  CreateSituacaoBody,
} from "../schemas/situacaoParticipanteSchema";
const service = new SituacaoParticipanteService();
export async function situacaoParticipanteRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/situacao-participante",
    {
      schema: {
        tags: ["Situações Participante"],
        summary: "Cria uma nova situação",
        body: createSituacaoBodySchema,
        response: {
          201: situacaoResponseSchema,
          409: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const body = request.body as CreateSituacaoBody;
      try {
        const newItem = await service.create(body);
        return reply.status(201).send(newItem);
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes("já existe")) {
            return reply.status(409).send({ message: error.message });
          }
          console.error(error.message);
          return reply.status(500).send({ message: "Erro interno." });
        }
        return reply.status(500).send({ message: "Erro desconhecido." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().get(
    "/situacao-participante",
    {
      schema: {
        tags: ["Situações Participante"],
        summary: "Lista situações",
        querystring: listSituacaoQuerySchema,
        response: {
          200: listSituacaoResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { page, limit, search } = request.query as ListSituacaoQuery;
      try {
        const result = await service.getAll(page, limit, search);
        return reply.status(200).send(result);
      } catch (error) {
        console.error(error);
        return reply.status(500).send({ message: "Erro interno." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().put(
    "/situacao-participante/:id",
    {
      schema: {
        tags: ["Situações Participante"],
        summary: "Atualiza uma situação",
        params: updateSituacaoParamsSchema,
        body: updateSituacaoBodySchema,
        response: {
          200: situacaoResponseSchema,
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as UpdateSituacaoParams;
      const updateData = request.body as UpdateSituacaoBody;
      try {
        const updated = await service.update(Number(id), updateData);
        if (!updated) {
          return reply
            .status(404)
            .send({ message: "Registro não encontrado." });
        }
        return reply.status(200).send(updated);
      } catch (error) {
        console.error(error);
        return reply.status(500).send({ message: "Erro interno." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/situacao-participante/:id",
    {
      schema: {
        tags: ["Situações Participante"],
        summary: "Exclui uma situação",
        params: deleteSituacaoParamsSchema,
        response: {
          204: z.null(),
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as DeleteSituacaoParams;
      try {
        const deleted = await service.delete(Number(id));
        if (deleted === null) {
          return reply
            .status(404)
            .send({ message: "Registro não encontrado." });
        }
        return reply.status(204).send();
      } catch (error) {
        console.error(error);
        return reply.status(500).send({ message: "Erro interno." });
      }
    },
  );
}