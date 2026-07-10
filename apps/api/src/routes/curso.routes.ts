import { FastifyInstance, FastifyReply } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { CursoService } from "../services/CursoService";
import {
  createCursoBodySchema,
  cursoResponseSchema,
  listCursoResponseSchema,
  listCursoQuerySchema,
  ListCursoQuery,
  CreateCursoBody,
  updateCursoParamsSchema,
  updateCursoBodySchema,
  UpdateCursoParams,
  UpdateCursoBody,
  deleteCursoParamsSchema,
  DeleteCursoParams,
} from "../schemas/cursoSchema";
import { z } from "zod";
const service = new CursoService();
export async function cursoRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/cursos",
    {
      schema: {
        tags: ["Cursos"],
        summary: "Cria um novo curso",
        body: createCursoBodySchema,
        response: {
          201: cursoResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const body = request.body as CreateCursoBody;
      try {
        const newItem = await service.create(body);
        return reply.status(201).send(newItem);
      } catch (error) {
        if (error instanceof Error) console.error(error.message);
        return reply.status(500).send({ message: "Erro ao criar curso." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().get(
    "/cursos",
    {
      schema: {
        tags: ["Cursos"],
        summary: "Lista cursos",
        querystring: listCursoQuerySchema,
        response: {
          200: listCursoResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { page, limit, search } = request.query as ListCursoQuery;
      try {
        const result = await service.getAll(page, limit, search);
        return reply.status(200).send(result);
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao listar." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().put(
    "/cursos/:id",
    {
      schema: {
        tags: ["Cursos"],
        summary: "Atualiza curso",
        params: updateCursoParamsSchema,
        body: updateCursoBodySchema,
        response: {
          200: cursoResponseSchema,
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as UpdateCursoParams;
      const updateData = request.body as UpdateCursoBody;
      try {
        const updated = await service.update(id, updateData);
        if (!updated) {
          return reply.status(404).send({ message: "Curso não encontrado." });
        }
        return reply.status(200).send(updated);
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao atualizar." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/cursos/:id",
    {
      schema: {
        tags: ["Cursos"],
        summary: "Exclui curso",
        params: deleteCursoParamsSchema,
        response: {
          204: z.null(),
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as DeleteCursoParams;
      try {
        const deleted = await service.delete(id);
        if (deleted === null) {
          return reply.status(404).send({ message: "Curso não encontrado." });
        }
        return reply.status(204).send();
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao excluir." });
      }
    },
  );
}