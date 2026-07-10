import { FastifyInstance, FastifyReply } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { TurmaService } from "../services/TurmaService";
import {
  createTurmaBodySchema,
  turmaResponseSchema,
  listTurmaResponseSchema,
  listTurmaQuerySchema,
  ListTurmaQuery,
  CreateTurmaBody,
  updateTurmaParamsSchema,
  updateTurmaBodySchema,
  UpdateTurmaParams,
  UpdateTurmaBody,
  deleteTurmaParamsSchema,
  DeleteTurmaParams,
} from "../schemas/turmaSchema";
import { z } from "zod";
const service = new TurmaService();
export async function turmaRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/turmas",
    {
      schema: {
        tags: ["Turmas"],
        summary: "Cria uma nova turma",
        body: createTurmaBodySchema,
        response: {
          201: turmaResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const body = request.body as CreateTurmaBody;
      try {
        const newItem = await service.create(body);
        return reply.status(201).send(newItem);
      } catch (error) {
        if (error instanceof Error) console.error(error.message);
        return reply.status(500).send({ message: "Erro ao criar turma." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().get(
    "/turmas",
    {
      schema: {
        tags: ["Turmas"],
        summary: "Lista turmas",
        querystring: listTurmaQuerySchema,
        // response: {
        //   200: listTurmaResponseSchema,
        //   500: z.object({ message: z.string() }),
        // },
      },
    },
    async (request, reply: FastifyReply) => {
      const { page, limit, search } = request.query as ListTurmaQuery;
      try {
        const result = await service.getAll(page, limit, search);
        return reply.status(200).send(result);
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao listar." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().put(
    "/turmas/:id",
    {
      schema: {
        tags: ["Turmas"],
        summary: "Atualiza turma",
        params: updateTurmaParamsSchema,
        body: updateTurmaBodySchema,
        response: {
          200: turmaResponseSchema,
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as UpdateTurmaParams;
      const updateData = request.body as UpdateTurmaBody;
      try {
        const updated = await service.update(id, updateData);
        if (!updated) {
          return reply.status(404).send({ message: "Turma não encontrada." });
        }
        return reply.status(200).send(updated);
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao atualizar." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/turmas/:id",
    {
      schema: {
        tags: ["Turmas"],
        summary: "Exclui turma",
        params: deleteTurmaParamsSchema,
        response: {
          204: z.null(),
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as DeleteTurmaParams;
      try {
        const deleted = await service.delete(id);
        if (deleted === null) {
          return reply.status(404).send({ message: "Turma não encontrada." });
        }
        return reply.status(204).send();
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao excluir." });
      }
    },
  );
}