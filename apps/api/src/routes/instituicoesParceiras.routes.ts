import { FastifyInstance, FastifyReply } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { InstituicoesParceirasService } from "../services/InstituicoesParceirasService";
import {
  createInstituicaoParceiraBodySchema,
  instituicaoParceiraResponseSchema,
  listInstituicaoParceiraResponseSchema,
  listInstituicaoParceiraQuerySchema,
  ListInstituicaoParceiraQuery,
  CreateInstituicaoParceiraBody,
  updateInstituicaoParceiraParamsSchema,
  updateInstituicaoParceiraBodySchema,
  UpdateInstituicaoParceiraParams,
  UpdateInstituicaoParceiraBody,
  deleteInstituicaoParceiraParamsSchema,
  DeleteInstituicaoParceiraParams,
} from "../schemas/instituicoesParceirasSchema";
import { z } from "zod";
const service = new InstituicoesParceirasService();
export async function instituicoesParceirasRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/instituicoes-parceiras",
    {
      schema: {
        tags: ["Instituições Parceiras"],
        summary: "Cria uma nova instituição parceira",
        body: createInstituicaoParceiraBodySchema,
        response: {
          201: instituicaoParceiraResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const body = request.body as CreateInstituicaoParceiraBody;
      try {
        const newItem = await service.create(body);
        return reply.status(201).send(newItem);
      } catch (error) {
        if (error instanceof Error) console.error(error.message);
        return reply.status(500).send({ message: "Erro ao criar parceiro." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().get(
    "/instituicoes-parceiras",
    {
      schema: {
        tags: ["Instituições Parceiras"],
        summary: "Lista instituições parceiras",
        querystring: listInstituicaoParceiraQuerySchema,
        response: {
          200: listInstituicaoParceiraResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { page, limit, search } =
        request.query as ListInstituicaoParceiraQuery;
      try {
        const result = await service.getAll(page, limit, search);
        return reply.status(200).send(result);
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao listar." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().put(
    "/instituicoes-parceiras/:id",
    {
      schema: {
        tags: ["Instituições Parceiras"],
        summary: "Atualiza parceiro",
        params: updateInstituicaoParceiraParamsSchema,
        body: updateInstituicaoParceiraBodySchema,
        response: {
          200: instituicaoParceiraResponseSchema,
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as UpdateInstituicaoParceiraParams;
      const updateData = request.body as UpdateInstituicaoParceiraBody;
      try {
        const updated = await service.update(Number(id), updateData);
        if (!updated) {
          return reply
            .status(404)
            .send({ message: "Parceiro não encontrado." });
        }
        return reply.status(200).send(updated);
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao atualizar." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/instituicoes-parceiras/:id",
    {
      schema: {
        tags: ["Instituições Parceiras"],
        summary: "Exclui parceiro",
        params: deleteInstituicaoParceiraParamsSchema,
        response: {
          204: z.null(),
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as DeleteInstituicaoParceiraParams;
      try {
        const deleted = await service.delete(Number(id));
        if (deleted === null) {
          return reply
            .status(404)
            .send({ message: "Parceiro não encontrado." });
        }
        return reply.status(204).send();
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao excluir." });
      }
    },
  );
}