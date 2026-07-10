import { FastifyInstance, FastifyReply } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { StatusEncaminhamentoService } from "../services/StatusEncaminhamentoService";
import {
  createStatusEncaminhamentoBodySchema,
  statusEncaminhamentoResponseSchema,
  listStatusEncaminhamentoResponseSchema,
  listStatusEncaminhamentoQuerySchema,
  ListStatusEncaminhamentoQuery,
  CreateStatusEncaminhamentoBody,
  updateStatusEncaminhamentoParamsSchema,
  updateStatusEncaminhamentoBodySchema,
  UpdateStatusEncaminhamentoParams,
  UpdateStatusEncaminhamentoBody,
  deleteStatusEncaminhamentoParamsSchema,
  DeleteStatusEncaminhamentoParams,
} from "../schemas/statusEncaminhamentoSchema";
import { z } from "zod";
const service = new StatusEncaminhamentoService();
export async function statusEncaminhamentoRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/status-encaminhamento",
    {
      schema: {
        tags: ["Status de Encaminhamento"],
        summary: "Cria um novo status",
        body: createStatusEncaminhamentoBodySchema,
        response: {
          201: statusEncaminhamentoResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const body = request.body as CreateStatusEncaminhamentoBody;
      try {
        const newItem = await service.create(body);
        return reply.status(201).send(newItem);
      } catch (error) {
        if (error instanceof Error) console.error(error.message);
        return reply.status(500).send({ message: "Erro ao criar status." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().get(
    "/status-encaminhamento",
    {
      schema: {
        tags: ["Status de Encaminhamento"],
        summary: "Lista status de encaminhamento",
        querystring: listStatusEncaminhamentoQuerySchema,
        response: {
          200: listStatusEncaminhamentoResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { page, limit, search } =
        request.query as ListStatusEncaminhamentoQuery;
      try {
        const result = await service.getAll(page, limit, search);
        return reply.status(200).send(result);
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao listar." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().put(
    "/status-encaminhamento/:id",
    {
      schema: {
        tags: ["Status de Encaminhamento"],
        summary: "Atualiza status",
        params: updateStatusEncaminhamentoParamsSchema,
        body: updateStatusEncaminhamentoBodySchema,
        response: {
          200: statusEncaminhamentoResponseSchema,
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as UpdateStatusEncaminhamentoParams;
      const updateData = request.body as UpdateStatusEncaminhamentoBody;
      try {
        const updated = await service.update(id, updateData);
        if (!updated) {
          return reply.status(404).send({ message: "Status não encontrado." });
        }
        return reply.status(200).send(updated);
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao atualizar." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/status-encaminhamento/:id",
    {
      schema: {
        tags: ["Status de Encaminhamento"],
        summary: "Exclui status",
        params: deleteStatusEncaminhamentoParamsSchema,
        response: {
          204: z.null(),
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as DeleteStatusEncaminhamentoParams;
      try {
        const deleted = await service.delete(id);
        if (deleted === null) {
          return reply.status(404).send({ message: "Status não encontrado." });
        }
        return reply.status(204).send();
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao excluir." });
      }
    },
  );
}