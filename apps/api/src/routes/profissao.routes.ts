import { FastifyInstance, FastifyReply } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { ProfissaoService } from "../services/ProfissaoService";
import { z } from "zod";
import {
  createProfissaoBodySchema,
  profissaoResponseSchema,
  listProfissaoResponseSchema,
  listProfissaoQuerySchema,
  ListProfissaoQuery,
  updateProfissaoBodySchema,
  updateProfissaoParamsSchema,
  UpdateProfissaoParams,
  UpdateProfissaoBody,
  deleteProfissaoParamsSchema,
  DeleteProfissaoParams,
  CreateProfissaoBody,
} from "../schemas/profissaoSchema";
const service = new ProfissaoService();
export async function profissaoRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/profissao",
    {
      schema: {
        tags: ["Profissões"],
        summary: "Cria uma nova profissão",
        body: createProfissaoBodySchema,
        response: {
          201: profissaoResponseSchema,
          409: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const body = request.body as CreateProfissaoBody;
      try {
        const newItem = await service.create(body);
        return reply.status(201).send(newItem);
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes("Já existe")) {
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
    "/profissao",
    {
      schema: {
        tags: ["Profissões"],
        summary: "Lista profissões",
        querystring: listProfissaoQuerySchema,
        response: {
          200: listProfissaoResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { page, limit, search } = request.query as ListProfissaoQuery;
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
    "/profissao/:id",
    {
      schema: {
        tags: ["Profissões"],
        summary: "Atualiza uma profissão",
        params: updateProfissaoParamsSchema,
        body: updateProfissaoBodySchema,
        response: {
          200: profissaoResponseSchema,
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as UpdateProfissaoParams;
      const updateData = request.body as UpdateProfissaoBody;
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
    "/profissao/:id",
    {
      schema: {
        tags: ["Profissões"],
        summary: "Exclui uma profissão",
        params: deleteProfissaoParamsSchema,
        response: {
          204: z.null(),
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as DeleteProfissaoParams;
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