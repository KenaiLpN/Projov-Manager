import { FastifyInstance, FastifyReply } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { CadastroRegiaoService } from "../services/CadastroRegiaoService";
import {
  createCadastroRegiaoBodySchema,
  cadastroRegiaoResponseSchema,
  listCadastroRegiaoResponseSchema,
  listCadastroRegiaoQuerySchema,
  ListCadastroRegiaoQuery,
  CreateCadastroRegiaoBody,
  updateCadastroRegiaoParamsSchema,
  updateCadastroRegiaoBodySchema,
  UpdateCadastroRegiaoParams,
  UpdateCadastroRegiaoBody,
  deleteCadastroRegiaoParamsSchema,
  DeleteCadastroRegiaoParams,
} from "../schemas/cadastroRegiaoSchema";
import { z } from "zod";
const service = new CadastroRegiaoService();
export async function cadastroRegiaoRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/regiao",
    {
      schema: {
        tags: ["Cadastro Região"],
        summary: "Cria uma nova região",
        body: createCadastroRegiaoBodySchema,
        response: {
          201: cadastroRegiaoResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const body = request.body as CreateCadastroRegiaoBody;
      try {
        const newItem = await service.create(body);
        return reply.status(201).send(newItem);
      } catch (error) {
        if (error instanceof Error) console.error(error.message);
        return reply.status(500).send({ message: "Erro ao criar região." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().get(
    "/regiao",
    {
      schema: {
        tags: ["Cadastro Região"],
        summary: "Lista regiões",
        querystring: listCadastroRegiaoQuerySchema,
        response: {
          200: listCadastroRegiaoResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { page, limit, search } = request.query as ListCadastroRegiaoQuery;
      try {
        const result = await service.getAll(page, limit, search);
        return reply.status(200).send(result);
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao listar." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().put(
    "/regiao/:id",
    {
      schema: {
        tags: ["Cadastro Região"],
        summary: "Atualiza região",
        params: updateCadastroRegiaoParamsSchema,
        body: updateCadastroRegiaoBodySchema,
        response: {
          200: cadastroRegiaoResponseSchema,
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as UpdateCadastroRegiaoParams;
      const updateData = request.body as UpdateCadastroRegiaoBody;
      try {
        const updated = await service.update(Number(id), updateData);
        if (!updated) {
          return reply.status(404).send({ message: "Região não encontrada." });
        }
        return reply.status(200).send(updated);
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao atualizar." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/regiao/:id",
    {
      schema: {
        tags: ["Cadastro Região"],
        summary: "Exclui região",
        params: deleteCadastroRegiaoParamsSchema,
        response: {
          204: z.null(),
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as DeleteCadastroRegiaoParams;
      try {
        const deleted = await service.delete(Number(id));
        if (deleted === null) {
          return reply.status(404).send({ message: "Região não encontrada." });
        }
        return reply.status(204).send();
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao excluir." });
      }
    },
  );
}