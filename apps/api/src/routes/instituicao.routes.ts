import { FastifyInstance, FastifyReply } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { InstituicaoService } from "../services/InstituicaoService";
import { z } from "zod";
import {
  createInstituicaoBodySchema,
  instituicaoResponseSchema,
  listInstituicaoResponseSchema,
  listInstituicaoQuerySchema,
  ListInstituicaoQuery,
  updateInstituicaoBodySchema,
  updateInstituicaoParamsSchema,
  UpdateInstituicaoParams,
  UpdateInstituicaoBody,
  deleteInstituicaoParamsSchema,
  DeleteInstituicaoParams,
  CreateInstituicaoBody,
} from "../schemas/instituicaoSchema";
const instituicaoService = new InstituicaoService();
export async function instituicaoRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/instituicao",
    {
      schema: {
        tags: ["Instituição de Ensino"],
        summary: "Cria uma nova Instituição",
        body: createInstituicaoBodySchema,
        response: {
          201: instituicaoResponseSchema,
          409: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const body = request.body as CreateInstituicaoBody;
      try {
        const newInstituicao = await instituicaoService.create(body);
        return reply.status(201).send(newInstituicao);
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes("já cadastrado")) {
            return reply.status(409).send({ message: error.message });
          }
          console.error(error.message);
          return reply
            .status(500)
            .send({ message: "Erro interno ao processar a requisição." });
        }
        return reply
          .status(500)
          .send({ message: "Um erro desconhecido ocorreu." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().get(
    "/instituicao",
    {
      schema: {
        tags: ["Instituição de Ensino"],
        summary: "Lista instituições com paginação",
        querystring: listInstituicaoQuerySchema,
        response: {
          200: listInstituicaoResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { page, limit, search } = request.query as ListInstituicaoQuery;
      try {
        const result = await instituicaoService.getAll(page, limit, search);
        return reply.status(200).send(result);
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
          return reply.status(500).send({ message: "Erro interno." });
        }
        return reply.status(500).send({ message: "Erro desconhecido." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().put(
    "/instituicao/:id",
    {
      schema: {
        tags: ["Instituição de Ensino"],
        summary: "Atualiza dados de uma instituição",
        params: updateInstituicaoParamsSchema,
        body: updateInstituicaoBodySchema,
        response: {
          200: instituicaoResponseSchema,
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as UpdateInstituicaoParams;
      const updateData = request.body as UpdateInstituicaoBody;
      try {
        if (Object.keys(updateData).length === 0) {
          return reply
            .status(400)
            .send({ message: "Nenhum dado enviado para atualização." });
        }
        const updated = await instituicaoService.update(Number(id), updateData);
        if (!updated) {
          return reply
            .status(404)
            .send({ message: "Instituição não encontrada." });
        }
        return reply.status(200).send(updated);
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
          return reply
            .status(500)
            .send({ message: "Erro interno ao atualizar." });
        }
        return reply.status(500).send({ message: "Erro desconhecido." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/instituicao/:id",
    {
      schema: {
        tags: ["Instituição de Ensino"],
        summary: "Exclui uma instituição do sistema",
        params: deleteInstituicaoParamsSchema,
        response: {
          204: z.null(),
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as DeleteInstituicaoParams;
      try {
        const deleted = await instituicaoService.delete(Number(id));
        if (deleted === null) {
          return reply
            .status(404)
            .send({ message: "Instituição não encontrada." });
        }
        return reply.status(204).send();
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
          return reply.status(500).send({ message: error.message });
        }
        return reply.status(500).send({ message: "Erro desconhecido." });
      }
    },
  );
}