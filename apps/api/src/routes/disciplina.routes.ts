import { FastifyInstance, FastifyReply } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { DisciplinaService } from "../services/DisciplinaService";
import {
  createDisciplinaBodySchema,
  disciplinaResponseSchema,
  listDisciplinaResponseSchema,
  listDisciplinaQuerySchema,
  ListDisciplinaQuery,
  CreateDisciplinaBody,
  updateDisciplinaParamsSchema,
  updateDisciplinaBodySchema,
  UpdateDisciplinaParams,
  UpdateDisciplinaBody,
  deleteDisciplinaParamsSchema,
  DeleteDisciplinaParams,
} from "../schemas/disciplinaSchema";
import { z } from "zod";
const service = new DisciplinaService();
export async function disciplinaRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/disciplinas",
    {
      schema: {
        tags: ["Disciplinas"],
        summary: "Cria uma nova disciplina",
        body: createDisciplinaBodySchema,
        response: {
          201: disciplinaResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const body = request.body as CreateDisciplinaBody;
      try {
        const newItem = await service.create(body);
        return reply.status(201).send(newItem);
      } catch (error) {
        if (error instanceof Error) console.error(error.message);
        return reply.status(500).send({ message: "Erro ao criar disciplina." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().get(
    "/disciplinas",
    {
      schema: {
        tags: ["Disciplinas"],
        summary: "Lista disciplinas",
        querystring: listDisciplinaQuerySchema,
        response: {
          200: listDisciplinaResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { page, limit, search } = request.query as ListDisciplinaQuery;
      try {
        const result = await service.getAll(page, limit, search);
        return reply.status(200).send(result);
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao listar." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().put(
    "/disciplinas/:id",
    {
      schema: {
        tags: ["Disciplinas"],
        summary: "Atualiza disciplina",
        params: updateDisciplinaParamsSchema,
        body: updateDisciplinaBodySchema,
        response: {
          200: disciplinaResponseSchema,
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as UpdateDisciplinaParams;
      const updateData = request.body as UpdateDisciplinaBody;
      try {
        const updated = await service.update(id, updateData);
        if (!updated) {
          return reply
            .status(404)
            .send({ message: "Disciplina não encontrada." });
        }
        return reply.status(200).send(updated);
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao atualizar." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/disciplinas/:id",
    {
      schema: {
        tags: ["Disciplinas"],
        summary: "Exclui disciplina",
        params: deleteDisciplinaParamsSchema,
        response: {
          204: z.null(),
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as DeleteDisciplinaParams;
      try {
        const deleted = await service.delete(id);
        if (deleted === null) {
          return reply
            .status(404)
            .send({ message: "Disciplina não encontrada." });
        }
        return reply.status(204).send();
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao excluir." });
      }
    },
  );
}