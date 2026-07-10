import { FastifyInstance, FastifyReply } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { MotivoDesligamentoService } from "../services/MotivoDesligamentoService";
import {
  createMotivoDesligamentoBodySchema,
  motivoDesligamentoResponseSchema,
  listMotivoDesligamentoResponseSchema,
  listMotivoDesligamentoQuerySchema,
  ListMotivoDesligamentoQuery,
  CreateMotivoDesligamentoBody,
  updateMotivoDesligamentoParamsSchema,
  updateMotivoDesligamentoBodySchema,
  UpdateMotivoDesligamentoParams,
  UpdateMotivoDesligamentoBody,
  deleteMotivoDesligamentoParamsSchema,
  DeleteMotivoDesligamentoParams,
} from "../schemas/motivoDesligamentoSchema";
import { z } from "zod";
const service = new MotivoDesligamentoService();
export async function motivoDesligamentoRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/motivo-desligamento",
    {
      schema: {
        tags: ["Motivos de Desligamento"],
        summary: "Cria um novo motivo",
        body: createMotivoDesligamentoBodySchema,
        response: {
          201: motivoDesligamentoResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const body = request.body as CreateMotivoDesligamentoBody;
      try {
        const newItem = await service.create(body);
        return reply.status(201).send(newItem);
      } catch (error) {
        if (error instanceof Error) console.error(error.message);
        return reply.status(500).send({ message: "Erro ao criar motivo." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().get(
    "/motivo-desligamento",
    {
      schema: {
        tags: ["Motivos de Desligamento"],
        summary: "Lista motivos de desligamento",
        querystring: listMotivoDesligamentoQuerySchema,
        response: {
          200: listMotivoDesligamentoResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { page, limit, search } =
        request.query as ListMotivoDesligamentoQuery;
      try {
        const result = await service.getAll(page, limit, search);
        return reply.status(200).send(result);
      } catch (error) {
        console.error(error);
        return reply.status(500).send({ message: "Erro ao listar." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().put(
    "/motivo-desligamento/:id",
    {
      schema: {
        tags: ["Motivos de Desligamento"],
        summary: "Atualiza motivo",
        params: updateMotivoDesligamentoParamsSchema,
        body: updateMotivoDesligamentoBodySchema,
        response: {
          200: motivoDesligamentoResponseSchema,
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as UpdateMotivoDesligamentoParams;
      const updateData = request.body as UpdateMotivoDesligamentoBody;
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
    "/motivo-desligamento/:id",
    {
      schema: {
        tags: ["Motivos de Desligamento"],
        summary: "Exclui motivo",
        params: deleteMotivoDesligamentoParamsSchema,
        response: {
          204: z.null(),
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as DeleteMotivoDesligamentoParams;
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