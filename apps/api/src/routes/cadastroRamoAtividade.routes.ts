import { FastifyInstance, FastifyReply } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { CadastroRamoAtividadeService } from "../services/CadastroRamoAtividadeService";
import {
  createCadastroRamoAtividadeBodySchema,
  cadastroRamoAtividadeResponseSchema,
  listCadastroRamoAtividadeResponseSchema,
  listCadastroRamoAtividadeQuerySchema,
  ListCadastroRamoAtividadeQuery,
  CreateCadastroRamoAtividadeBody,
  updateCadastroRamoAtividadeParamsSchema,
  updateCadastroRamoAtividadeBodySchema,
  UpdateCadastroRamoAtividadeParams,
  UpdateCadastroRamoAtividadeBody,
  deleteCadastroRamoAtividadeParamsSchema,
  DeleteCadastroRamoAtividadeParams,
} from "../schemas/cadastroRamoAtividadeSchema";
import { z } from "zod";
const service = new CadastroRamoAtividadeService();
export async function cadastroRamoAtividadeRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/ramos-atividade",
    {
      schema: {
        tags: ["Ramos de Atividade"],
        summary: "Cria um novo ramo de atividade",
        body: createCadastroRamoAtividadeBodySchema,
        response: {
          201: cadastroRamoAtividadeResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const body = request.body as CreateCadastroRamoAtividadeBody;
      try {
        const newItem = await service.create(body);
        return reply.status(201).send(newItem);
      } catch (error) {
        return reply
          .status(500)
          .send({ message: "Erro ao criar ramo de atividade." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().get(
    "/ramos-atividade",
    {
      schema: {
        tags: ["Ramos de Atividade"],
        summary: "Lista ramos de atividade",
        querystring: listCadastroRamoAtividadeQuerySchema,
        response: {
          200: listCadastroRamoAtividadeResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { page, limit, search } =
        request.query as ListCadastroRamoAtividadeQuery;
      try {
        const result = await service.getAll(page, limit, search);
        return reply.status(200).send(result);
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao listar." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().put(
    "/ramos-atividade/:id",
    {
      schema: {
        tags: ["Ramos de Atividade"],
        summary: "Atualiza ramo de atividade",
        params: updateCadastroRamoAtividadeParamsSchema,
        body: updateCadastroRamoAtividadeBodySchema,
        response: {
          200: cadastroRamoAtividadeResponseSchema,
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as UpdateCadastroRamoAtividadeParams;
      const updateData = request.body as UpdateCadastroRamoAtividadeBody;
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
    "/ramos-atividade/:id",
    {
      schema: {
        tags: ["Ramos de Atividade"],
        summary: "Exclui ramo de atividade",
        params: deleteCadastroRamoAtividadeParamsSchema,
        response: {
          204: z.null(),
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as DeleteCadastroRamoAtividadeParams;
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